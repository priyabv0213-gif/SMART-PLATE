import {
  AllocationPlan,
  FoodDonation,
  Recipient,
  Vehicle,
  SingleAssignment,
  UnallocatedDonation,
  RejectedAssignmentCandidate,
  AllocationMetrics,
} from '../types';
import { evaluateCandidateFeasibility } from './safetyGate';
import { calculateUrbanDrivingDistanceKm } from './routingEstimator';
import { calculateJainsFairnessIndex } from './fairnessCalculator';

export function runStaticTimeWindowBaseline(
  donations: FoodDonation[],
  recipients: Recipient[],
  vehicles: Vehicle[],
  currentTimeIso: string = new Date().toISOString()
): AllocationPlan {
  const startTime = performance.now();
  const assignments: SingleAssignment[] = [];
  const unallocated: UnallocatedDonation[] = [];
  const rejectedCandidates: RejectedAssignmentCandidate[] = [];

  const recipientState = new Map<string, { currentLoad: number; fulfilledDemand: number }>();
  recipients.forEach((r) => {
    recipientState.set(r.id, { currentLoad: r.currentLoad, fulfilledDemand: 0 });
  });

  const vehicleState = new Map<string, number>();
  vehicles.forEach((v) => vehicleState.set(v.id, v.currentLoad));

  let totalTransportKm = 0;

  // Sort donations strictly by safe deadline (earliest deadline first - EDF)
  const sortedDonations = [...donations].sort((a, b) => {
    return new Date(a.verifiedSafeDeadline).getTime() - new Date(b.verifiedSafeDeadline).getTime();
  });

  for (const donation of sortedDonations) {
    if (!donation.safetyVerified || donation.quantity <= 0) {
      unallocated.push({
        donationId: donation.id,
        donorName: donation.donorName,
        category: donation.foodCategory,
        remainingQuantity: donation.quantity,
        reason: !donation.safetyVerified ? 'Safety verification missing' : 'Zero quantity',
      });
      continue;
    }

    let remainingSupply = donation.quantity;

    // In static time-window, evaluate recipients that have compatible operating windows
    for (const recipient of recipients) {
      if (remainingSupply <= 0) break;

      const state = recipientState.get(recipient.id)!;
      const availableCap = recipient.maxReceivingCapacity - state.currentLoad;
      const unmetDemand = recipient.demandQuantity - state.fulfilledDemand;

      if (availableCap <= 0 || unmetDemand <= 0) continue;

      const suitableVehicle = vehicles.find((v) => {
        const load = vehicleState.get(v.id) || 0;
        return v.status !== 'Broken Down' && v.capacity - load >= 10;
      });

      const check = evaluateCandidateFeasibility(donation, recipient, suitableVehicle, currentTimeIso);

      if (!check.isEligible || !check.isTimeFeasible || !check.timeline) {
        rejectedCandidates.push({
          donationId: donation.id,
          recipientId: recipient.id,
          recipientName: recipient.name,
          reason: check.rejectionReasons.join('; '),
          bindingConstraint: check.bindingConstraint || 'Safety/Deadline',
        });
        continue;
      }

      // Allocate
      const qtyToAllocate = Math.min(remainingSupply, availableCap, unmetDemand);
      if (qtyToAllocate <= 0) continue;

      const distKm = calculateUrbanDrivingDistanceKm(donation.location, recipient.location);
      totalTransportKm += distKm;

      state.currentLoad += qtyToAllocate;
      state.fulfilledDemand += qtyToAllocate;
      remainingSupply -= qtyToAllocate;

      if (suitableVehicle) {
        const vLoad = vehicleState.get(suitableVehicle.id) || 0;
        vehicleState.set(suitableVehicle.id, vLoad + qtyToAllocate);
      }

      assignments.push({
        id: `ASG-STW-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        donationId: donation.id,
        recipientId: recipient.id,
        vehicleId: suitableVehicle?.id,
        donorName: donation.donorName,
        recipientName: recipient.name,
        foodCategory: donation.foodCategory,
        allocatedQuantity: qtyToAllocate,
        originalSupplyQuantity: donation.quantity,
        isSplit: qtyToAllocate < donation.quantity,
        distanceKm: distKm,
        travelTimeMinutes: check.timeline.travelMinutes,
        estimatedPickupTime: check.timeline.estimatedPickupDate.toISOString(),
        estimatedArrivalTime: check.timeline.estimatedArrivalDate.toISOString(),
        estimatedCompletionTime: check.timeline.estimatedCompletionDate.toISOString(),
        safeDeadline: donation.verifiedSafeDeadline,
        timeMarginMinutes: check.timeMarginMinutes || 0,
        isTimeFeasible: true,
        explanation: `Static time-window match: Accepted assignment with ${check.timeMarginMinutes}m margin inside recipient operating window.`,
        bindingConstraints: ['Time Feasibility Window', 'Static Priority'],
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      });
    }

    if (remainingSupply > 0) {
      unallocated.push({
        donationId: donation.id,
        donorName: donation.donorName,
        category: donation.foodCategory,
        remainingQuantity: remainingSupply,
        reason:
          remainingSupply === donation.quantity
            ? 'No time-window feasible recipient found with open hours and capacity'
            : `Partial allocation: ${remainingSupply} meals unallocated due to recipient window limits`,
      });
    }
  }

  const totalSurplus = donations.reduce((acc, d) => acc + d.quantity, 0);
  const totalAllocated = assignments.reduce((acc, a) => acc + a.allocatedQuantity, 0);
  const totalDemand = recipients.reduce((acc, r) => acc + r.demandQuantity, 0);

  const fulfilledMap = new Map<string, number>();
  recipients.forEach((r) => {
    fulfilledMap.set(r.id, recipientState.get(r.id)?.fulfilledDemand || 0);
  });
  const fairness = calculateJainsFairnessIndex(recipients, fulfilledMap);

  const metrics: AllocationMetrics = {
    totalSurplusRegistered: totalSurplus,
    quantityAllocated: totalAllocated,
    quantitySafelyDelivered: totalAllocated,
    quantityAtRisk: 0,
    quantityUnallocated: totalSurplus - totalAllocated,
    onTimeDeliveryRate: totalAllocated > 0 ? 100 : 0,
    demandSatisfactionRate: totalDemand > 0 ? Number(((totalAllocated / totalDemand) * 100).toFixed(1)) : 0,
    totalTransportKm: Number(totalTransportKm.toFixed(1)),
    kmPerRescuedMeal: totalAllocated > 0 ? Number((totalTransportKm / totalAllocated).toFixed(3)) : 0,
    fairnessIndex: fairness,
    co2PreventedKg: Number((totalAllocated * 2.5 * 0.4).toFixed(1)),
    recoveredAlternativeQuantity: 0,
    unrecoverableQuantity: totalSurplus - totalAllocated,
  };

  const executionTimeMs = performance.now() - startTime;

  return {
    runId: `RUN-STW-${Date.now()}`,
    timestamp: new Date().toISOString(),
    algorithm: 'static-time-window',
    objectiveWeights: { foodRescued: 0.4, demandSatisfied: 0.3, transportDistance: 0.3, fairness: 0.0 },
    assignments,
    unallocated,
    rejectedCandidates,
    metrics,
    executionTimeMs: Number(executionTimeMs.toFixed(2)),
  };
}
