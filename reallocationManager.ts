import {
  AllocationPlan,
  FoodDonation,
  Recipient,
  Vehicle,
  OperationalDisruptionEvent,
  SingleAssignment,
} from '../types';
import { runSpoilClockAdaptiveEngine } from './spoilClockAdaptiveEngine';
import { determineRecoveryTier, createRecoveryRecord } from './recoveryEvaluator';

export interface ReallocationResult {
  previousPlan: AllocationPlan;
  revisedPlan: AllocationPlan;
  event: OperationalDisruptionEvent;
  affectedDonationIds: string[];
  preservedAssignments: SingleAssignment[];
  reallocatedAssignments: SingleAssignment[];
  divertedToRecoveryCount: number;
  unrecoverableCount: number;
  explanation: string;
}

/**
 * Executes event-driven recalculation when disruptions occur.
 * Preserves completed deliveries, re-evaluates pending assignments, and updates explainable audit trail.
 */
export function handleDisruptionEvent(
  event: OperationalDisruptionEvent,
  currentPlan: AllocationPlan,
  donations: FoodDonation[],
  recipients: Recipient[],
  vehicles: Vehicle[],
  currentTimeIso: string = new Date().toISOString()
): ReallocationResult {
  // 1. Separate completed assignments vs uncompleted assignments
  const completedAssignments = currentPlan.assignments.filter((a) => a.status === 'Delivered');
  const pendingAssignments = currentPlan.assignments.filter((a) => a.status !== 'Delivered');

  // 2. Identify affected items based on event type
  let updatedRecipients = recipients.map((r) => ({ ...r }));
  let updatedVehicles = vehicles.map((v) => ({ ...v }));
  let updatedDonations = donations.map((d) => ({ ...d }));

  const affectedDonationIds = new Set<string>();

  if (event.type === 'recipient_cancellation' || event.type === 'recipient_available') {
    const targetRecipientId = event.targetId;
    updatedRecipients = updatedRecipients.map((r) => {
      if (r.id === targetRecipientId) {
        return {
          ...r,
          active: event.type === 'recipient_available',
          demandQuantity: event.type === 'recipient_cancellation' ? 0 : r.demandQuantity,
        };
      }
      return r;
    });

    // Mark affected donations assigned to this cancelled recipient
    pendingAssignments.forEach((a) => {
      if (a.recipientId === targetRecipientId) {
        affectedDonationIds.add(a.donationId);
      }
    });
  } else if (event.type === 'vehicle_breakdown') {
    const targetVehicleId = event.targetId;
    updatedVehicles = updatedVehicles.map((v) => {
      if (v.id === targetVehicleId) {
        return { ...v, status: 'Broken Down', currentLoad: 0 };
      }
      return v;
    });

    pendingAssignments.forEach((a) => {
      if (a.vehicleId === targetVehicleId) {
        affectedDonationIds.add(a.donationId);
      }
    });
  } else if (event.type === 'delivery_delay') {
    // E.g., traffic jam or delay of 45 minutes
    pendingAssignments.forEach((a) => {
      if (a.id === event.targetId || a.donationId === event.targetId) {
        affectedDonationIds.add(a.donationId);
      }
    });
  } else if (event.type === 'demand_change') {
    // Target recipient demand updated
    affectedDonationIds.add(event.targetId);
  } else if (event.type === 'new_donation') {
    affectedDonationIds.add(event.targetId);
  }

  // 3. Prepare donations pool for re-optimization:
  // - Donations that were affected and uncompleted are re-entered with their uncompleted quantities
  // - Completed delivery quantities are subtracted from recipient loads and donation supply
  const donationPool: FoodDonation[] = [];

  for (const d of updatedDonations) {
    const completedForThisDonation = completedAssignments
      .filter((a) => a.donationId === d.id)
      .reduce((sum, a) => sum + a.allocatedQuantity, 0);

    const remainingToAllocate = d.quantity - completedForThisDonation;
    if (remainingToAllocate > 0) {
      donationPool.push({
        ...d,
        quantity: remainingToAllocate,
      });
    }
  }

  // Deduct completed deliveries from recipient currentLoad
  completedAssignments.forEach((c) => {
    const r = updatedRecipients.find((rec) => rec.id === c.recipientId);
    if (r) {
      r.currentLoad = Math.min(r.maxReceivingCapacity, r.currentLoad + c.allocatedQuantity);
    }
  });

  // 4. Run re-optimization
  const reoptimizedPlan = runSpoilClockAdaptiveEngine(
    donationPool,
    updatedRecipients,
    updatedVehicles,
    currentPlan.objectiveWeights,
    currentTimeIso
  );

  // Combine preserved completed assignments with newly reallocated assignments
  const finalAssignments = [...completedAssignments, ...reoptimizedPlan.assignments];

  // Calculate delta metrics
  const previousRescued = currentPlan.metrics.quantityAllocated;
  const newRescued = finalAssignments.reduce((acc, a) => acc + a.allocatedQuantity, 0);
  const reallocatedCount = reoptimizedPlan.assignments.length;
  const unrecoveredDelta = Math.max(0, previousRescued - newRescued);

  let explanation = '';
  if (event.type === 'recipient_cancellation') {
    if (newRescued >= previousRescued) {
      explanation = `Recipient ${event.targetId} cancelled. SpoilClock successfully reallocated ${newRescued} meals to alternative time-feasible recipients with zero food lost!`;
    } else {
      explanation = `Recipient ${event.targetId} cancelled. SpoilClock rescued ${newRescued} meals; ${unrecoveredDelta} meals could not find feasible human recipients in time and were diverted to circular recovery.`;
    }
  } else if (event.type === 'vehicle_breakdown') {
    explanation = `Vehicle ${event.targetId} breakdown detected. Affected routes were re-dispatched to backup available transport.`;
  } else {
    explanation = `Adaptive recalculation triggered by "${event.title}". Optimized allocation based on live constraints.`;
  }

  event.resolved = true;
  event.reallocationDiff = {
    preservedDeliveriesCount: completedAssignments.length,
    reallocatedMealsCount: newRescued,
    unrecoverableMealsDelta: unrecoveredDelta,
    explanation,
    previousPlanId: currentPlan.runId,
    newPlanId: reoptimizedPlan.runId,
  };

  const reallocatedOnly = reoptimizedPlan.assignments;

  return {
    previousPlan: currentPlan,
    revisedPlan: {
      ...reoptimizedPlan,
      assignments: finalAssignments,
      metrics: {
        ...reoptimizedPlan.metrics,
        quantityAllocated: newRescued,
        quantitySafelyDelivered: finalAssignments.filter((a) => a.status === 'Delivered').reduce((s, a) => s + a.allocatedQuantity, 0),
        unrecoverableQuantity: unrecoveredDelta,
      },
    },
    event,
    affectedDonationIds: Array.from(affectedDonationIds),
    preservedAssignments: completedAssignments,
    reallocatedAssignments: reallocatedOnly,
    divertedToRecoveryCount: reoptimizedPlan.unallocated.length,
    unrecoverableCount: unrecoveredDelta,
    explanation,
  };
}
