import {
  AllocationPlan,
  FoodDonation,
  Recipient,
  Vehicle,
  SingleAssignment,
  UnallocatedDonation,
  RejectedAssignmentCandidate,
  AllocationMetrics,
  AllocationObjectiveWeights,
} from '../types';
import { evaluateCandidateFeasibility } from './safetyGate';
import { calculateUrbanDrivingDistanceKm } from './routingEstimator';
import { calculateJainsFairnessIndex } from './fairnessCalculator';
import { determineRecoveryTier } from './recoveryEvaluator';

export const DEFAULT_OBJECTIVE_WEIGHTS: AllocationObjectiveWeights = {
  foodRescued: 0.4,
  demandSatisfied: 0.25,
  transportDistance: 0.15,
  fairness: 0.2,
};

export function runSpoilClockAdaptiveEngine(
  donations: FoodDonation[],
  recipients: Recipient[],
  vehicles: Vehicle[],
  weights: AllocationObjectiveWeights = DEFAULT_OBJECTIVE_WEIGHTS,
  currentTimeIso: string = new Date().toISOString()
): AllocationPlan {
  const startTime = performance.now();
  const assignments: SingleAssignment[] = [];
  const unallocated: UnallocatedDonation[] = [];
  const rejectedCandidates: RejectedAssignmentCandidate[] = [];

  // Working state for recipients
  const recipientState = new Map<string, { currentLoad: number; fulfilledDemand: number }>();
  recipients.forEach((r) => {
    recipientState.set(r.id, { currentLoad: r.currentLoad, fulfilledDemand: 0 });
  });

  // Working state for vehicles
  const vehicleState = new Map<string, { load: number; currentLoc: { lat: number; lng: number } }>();
  vehicles.forEach((v) => {
    vehicleState.set(v.id, { load: v.currentLoad, currentLoc: { ...v.location } });
  });

  let totalTransportKm = 0;
  const now = new Date(currentTimeIso).getTime();

  // Normalize weights
  const weightSum = weights.foodRescued + weights.demandSatisfied + weights.transportDistance + weights.fairness || 1;
  const wRescued = weights.foodRescued / weightSum;
  const wDemand = weights.demandSatisfied / weightSum;
  const wDistance = weights.transportDistance / weightSum;
  const wFairness = weights.fairness / weightSum;

  // Prioritize donations: sort by urgency of safe-use deadline (decay awareness)
  const sortedDonations = [...donations].sort((a, b) => {
    const timeA = new Date(a.verifiedSafeDeadline).getTime();
    const timeB = new Date(b.verifiedSafeDeadline).getTime();
    return timeA - timeB;
  });

  for (const donation of sortedDonations) {
    // Safety verification check
    if (!donation.safetyVerified || donation.quantity <= 0) {
      const recTier = determineRecoveryTier(donation, 'Failed human safety verification / missing certification');
      unallocated.push({
        donationId: donation.id,
        donorName: donation.donorName,
        category: donation.foodCategory,
        remainingQuantity: donation.quantity,
        reason: !donation.safetyVerified
          ? 'Safety verification missing: Batch blocked from human redistribution'
          : 'Zero quantity registered',
        candidateRecoveryRoute: recTier.category,
      });
      continue;
    }

    let remainingSupply = donation.quantity;
    let splitCounter = 0;
    const splitAssignmentsForThisDonation: SingleAssignment[] = [];

    // Attempt multi-recipient allocation loop (enabling split donations if necessary)
    while (remainingSupply > 0) {
      interface ScoredCandidate {
        recipient: Recipient;
        vehicle?: Vehicle;
        allocatableQty: number;
        distKm: number;
        travelMinutes: number;
        timeMarginMinutes: number;
        score: number;
        explanation: string;
        timeline: any;
      }

      const scoredCandidates: ScoredCandidate[] = [];

      for (const recipient of recipients) {
        if (!recipient.active) continue;

        const rState = recipientState.get(recipient.id)!;
        const availCap = recipient.maxReceivingCapacity - rState.currentLoad;
        const unmetDemand = recipient.demandQuantity - rState.fulfilledDemand;

        if (availCap <= 0 || unmetDemand <= 0) {
          continue;
        }

        // Available quantity to this recipient
        const allocatableQty = Math.min(remainingSupply, availCap, unmetDemand);
        if (allocatableQty < recipient.minAcceptableQuantity && remainingSupply >= recipient.minAcceptableQuantity) {
          // If less than min acceptable quantity but we have enough, avoid undersized drops
          continue;
        }

        // Find best compatible vehicle
        const candidateVehicles = vehicles.filter((v) => {
          if (v.status === 'Broken Down') return false;
          const vState = vehicleState.get(v.id);
          const vAvail = v.capacity - (vState?.load || 0);
          return vAvail >= Math.min(10, allocatableQty);
        });

        // Pick closest available vehicle
        let chosenVehicle: Vehicle | undefined = candidateVehicles[0];
        if (candidateVehicles.length > 1) {
          candidateVehicles.sort((v1, v2) => {
            const d1 = calculateUrbanDrivingDistanceKm(v1.location, donation.location);
            const d2 = calculateUrbanDrivingDistanceKm(v2.location, donation.location);
            return d1 - d2;
          });
          chosenVehicle = candidateVehicles[0];
        }

        // Safety gate check
        const check = evaluateCandidateFeasibility(donation, recipient, chosenVehicle, currentTimeIso);

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

        const distKm = calculateUrbanDrivingDistanceKm(donation.location, recipient.location);

        // Normalize metrics for scoring (0 to 1)
        const rescueNorm = Math.min(1, allocatableQty / Math.max(1, donation.quantity));
        const demandRatio = unmetDemand / Math.max(1, recipient.demandQuantity); // higher deficit = higher need
        const distanceNorm = Math.max(0, 1 - distKm / 25); // 0 km -> 1.0, 25 km -> 0.0

        // Urgency factor based on safe deadline margin
        const marginMinutes = check.timeMarginMinutes ?? 0;
        const hoursToDeadline = Math.max(0.1, marginMinutes / 60);
        const urgencyFactor = 1.0 + 1.5 / (1.0 + hoursToDeadline);

        // Combined objective score
        const score =
          urgencyFactor *
          (wRescued * rescueNorm + wDemand * demandRatio + wDistance * distanceNorm + wFairness * demandRatio);

        const explanation =
          `${recipient.name} selected: Rescues ${allocatableQty} ${donation.unit} (${Math.round(
            (allocatableQty / donation.quantity) * 100
          )}% of batch), fulfilling ${Math.round((allocatableQty / recipient.demandQuantity) * 100)}% of demand. ` +
          `Safe margin: ${marginMinutes} mins before deadline. Distance: ${distKm} km.`;

        scoredCandidates.push({
          recipient,
          vehicle: chosenVehicle,
          allocatableQty,
          distKm,
          travelMinutes: check.timeline.travelMinutes,
          timeMarginMinutes: marginMinutes,
          score,
          explanation,
          timeline: check.timeline,
        });
      }

      // If no candidate is feasible for the remaining supply, stop
      if (scoredCandidates.length === 0) {
        break;
      }

      // Pick top-scoring candidate
      scoredCandidates.sort((a, b) => b.score - a.score);
      const best = scoredCandidates[0];

      splitCounter++;
      remainingSupply -= best.allocatableQty;
      totalTransportKm += best.distKm;

      // Update state
      const rState = recipientState.get(best.recipient.id)!;
      rState.currentLoad += best.allocatableQty;
      rState.fulfilledDemand += best.allocatableQty;

      if (best.vehicle) {
        const vState = vehicleState.get(best.vehicle.id)!;
        vState.load += best.allocatableQty;
      }

      const assignment: SingleAssignment = {
        id: `ASG-SC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        donationId: donation.id,
        recipientId: best.recipient.id,
        vehicleId: best.vehicle?.id,
        donorName: donation.donorName,
        recipientName: best.recipient.name,
        foodCategory: donation.foodCategory,
        allocatedQuantity: best.allocatableQty,
        originalSupplyQuantity: donation.quantity,
        isSplit: false, // will update below once all splits evaluated
        splitIndex: splitCounter,
        distanceKm: best.distKm,
        travelTimeMinutes: best.travelMinutes,
        estimatedPickupTime: best.timeline.estimatedPickupDate.toISOString(),
        estimatedArrivalTime: best.timeline.estimatedArrivalDate.toISOString(),
        estimatedCompletionTime: best.timeline.estimatedCompletionDate.toISOString(),
        safeDeadline: donation.verifiedSafeDeadline,
        timeMarginMinutes: best.timeMarginMinutes,
        isTimeFeasible: true,
        explanation: best.explanation,
        bindingConstraints: ['Multi-Objective Optimality', 'Rescue Window Margin', 'Capacity Constraint'],
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      };

      splitAssignmentsForThisDonation.push(assignment);

      // If all supply is allocated, break out
      if (remainingSupply <= 0) break;
    }

    // Mark split flags if multiple splits were made
    const isSplit = splitAssignmentsForThisDonation.length > 1;
    splitAssignmentsForThisDonation.forEach((asg) => {
      asg.isSplit = isSplit;
      asg.totalSplits = splitAssignmentsForThisDonation.length;
      if (isSplit) {
        asg.explanation += ` [Part of split donation: ${asg.allocatedQuantity}/${donation.quantity} ${donation.unit}]`;
      }
      assignments.push(asg);
    });

    // If supply remained unallocated, evaluate non-human recovery tier
    if (remainingSupply > 0) {
      const recTier = determineRecoveryTier(
        donation,
        remainingSupply === donation.quantity
          ? 'No feasible recipient satisfies safety deadline or category requirements'
          : `Partial unallocated remainder (${remainingSupply} ${donation.unit}) due to recipient capacity saturation`
      );

      unallocated.push({
        donationId: donation.id,
        donorName: donation.donorName,
        category: donation.foodCategory,
        remainingQuantity: remainingSupply,
        reason:
          remainingSupply === donation.quantity
            ? 'No time-feasible recipient with matching category and capacity within safe deadline'
            : `Partial allocation: ${remainingSupply} ${donation.unit} unallocated`,
        candidateRecoveryRoute: recTier.category,
      });
    }
  }

  // Calculate system-wide performance metrics
  const totalSurplus = donations.reduce((acc, d) => acc + d.quantity, 0);
  const totalAllocated = assignments.reduce((acc, a) => acc + a.allocatedQuantity, 0);
  const totalDemand = recipients.reduce((acc, r) => acc + r.demandQuantity, 0);

  const fulfilledMap = new Map<string, number>();
  recipients.forEach((r) => {
    fulfilledMap.set(r.id, recipientState.get(r.id)?.fulfilledDemand || 0);
  });
  const fairness = calculateJainsFairnessIndex(recipients, fulfilledMap);

  const unallocatedMeals = totalSurplus - totalAllocated;
  const recoveredAlternative = unallocated.reduce(
    (acc, u) => (u.candidateRecoveryRoute && u.candidateRecoveryRoute !== 'Safe Disposal' ? acc + u.remainingQuantity : acc),
    0
  );

  const metrics: AllocationMetrics = {
    totalSurplusRegistered: totalSurplus,
    quantityAllocated: totalAllocated,
    quantitySafelyDelivered: totalAllocated,
    quantityAtRisk: 0,
    quantityUnallocated: unallocatedMeals,
    onTimeDeliveryRate: totalAllocated > 0 ? 100 : 0,
    demandSatisfactionRate: totalDemand > 0 ? Number(((totalAllocated / totalDemand) * 100).toFixed(1)) : 0,
    totalTransportKm: Number(totalTransportKm.toFixed(1)),
    kmPerRescuedMeal: totalAllocated > 0 ? Number((totalTransportKm / totalAllocated).toFixed(3)) : 0,
    fairnessIndex: fairness,
    co2PreventedKg: Number((totalAllocated * 2.5 * 0.4).toFixed(1)),
    recoveredAlternativeQuantity: recoveredAlternative,
    unrecoverableQuantity: unallocatedMeals - recoveredAlternative,
  };

  const executionTimeMs = performance.now() - startTime;

  return {
    runId: `RUN-SC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    algorithm: 'spoilclock-adaptive',
    objectiveWeights: { ...weights },
    assignments,
    unallocated,
    rejectedCandidates,
    metrics,
    executionTimeMs: Number(executionTimeMs.toFixed(2)),
  };
}
