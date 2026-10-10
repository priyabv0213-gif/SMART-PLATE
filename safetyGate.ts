import { FoodDonation, Recipient, Vehicle } from '../types';
import { computeMissionTimeline, MissionTimeline } from './routingEstimator';

export interface SafetyGateCheckResult {
  isEligible: boolean;
  isTimeFeasible: boolean;
  rejectionReasons: string[];
  bindingConstraint?: 'Safety/Deadline' | 'Capacity Exceeded' | 'Category Incompatible' | 'Operating Hours Closed' | 'No Vehicle Available';
  timeline?: MissionTimeline;
  timeMarginMinutes?: number;
  explanation: string;
}

/**
 * Checks safety gate constraints and rescue-window feasibility for a candidate donation-recipient pair.
 */
export function evaluateCandidateFeasibility(
  donation: FoodDonation,
  recipient: Recipient,
  vehicle?: Vehicle,
  currentTimeIso: string = new Date().toISOString()
): SafetyGateCheckResult {
  const reasons: string[] = [];
  const now = new Date(currentTimeIso);

  // 1. Mandatory Food Safety Verification Check
  if (!donation.safetyVerified) {
    reasons.push('Safety verification missing: Donation is not certified by a qualified food-safety rule.');
  }

  // 2. Verified Safe-Use Deadline Check
  const safeDeadlineDate = new Date(donation.verifiedSafeDeadline);
  if (isNaN(safeDeadlineDate.getTime())) {
    reasons.push('Invalid or missing verified safe-use deadline.');
  } else if (safeDeadlineDate.getTime() <= now.getTime()) {
    reasons.push(`Safe deadline has already expired (${safeDeadlineDate.toLocaleTimeString()}).`);
  }

  // 3. Recipient Status & Operating Hours
  if (!recipient.active) {
    reasons.push(`Recipient "${recipient.name}" is currently marked inactive.`);
  }

  // 4. Food Category Acceptance
  if (!recipient.acceptedCategories.includes(donation.foodCategory)) {
    reasons.push(
      `Recipient "${recipient.name}" does not accept category "${donation.foodCategory}". Accepted: [${recipient.acceptedCategories.join(', ')}].`
    );
  }

  // 5. Cold Storage Requirement Check
  if (
    (donation.storageCondition === 'refrigerated' || donation.storageCondition === 'frozen') &&
    !recipient.hasColdStorage
  ) {
    reasons.push(`Donation requires cold-chain holding, but recipient "${recipient.name}" lacks cold storage equipment.`);
  }

  // 6. Capacity Check
  const availableCapacity = Math.max(0, recipient.maxReceivingCapacity - recipient.currentLoad);
  if (availableCapacity <= 0) {
    reasons.push(`Recipient "${recipient.name}" has reached maximum receiving capacity (${recipient.maxReceivingCapacity} meals).`);
  }

  // 7. Vehicle Capability Check (if vehicle provided)
  if (vehicle) {
    if (vehicle.status === 'Broken Down') {
      reasons.push(`Assigned vehicle "${vehicle.name}" is broken down.`);
    }
    if (
      (donation.storageCondition === 'refrigerated' || donation.storageCondition === 'frozen') &&
      !vehicle.hasRefrigeration
    ) {
      reasons.push(`Vehicle "${vehicle.name}" does not have active refrigeration required for this batch.`);
    }
  }

  // Stop early if basic safety or compatibility failed
  if (reasons.length > 0) {
    let binding: SafetyGateCheckResult['bindingConstraint'] = 'Safety/Deadline';
    if (reasons.some((r) => r.includes('capacity'))) binding = 'Capacity Exceeded';
    else if (reasons.some((r) => r.includes('category') || r.includes('cold-chain'))) binding = 'Category Incompatible';
    else if (reasons.some((r) => r.includes('vehicle'))) binding = 'No Vehicle Available';

    return {
      isEligible: false,
      isTimeFeasible: false,
      rejectionReasons: reasons,
      bindingConstraint: binding,
      explanation: reasons.join('; '),
    };
  }

  // 8. Rescue-Window Feasibility Check
  const timeline = computeMissionTimeline(
    donation.pickupReadinessTime,
    donation.location,
    recipient.location,
    vehicle,
    currentTimeIso
  );

  const timeMarginMinutes = Math.floor((safeDeadlineDate.getTime() - timeline.estimatedCompletionDate.getTime()) / 60000);

  // Check if completion is within safe deadline
  const isTimeFeasible = timeMarginMinutes >= 0;

  if (!isTimeFeasible) {
    reasons.push(
      `Rescue window exceeded: Estimated completion time (${timeline.estimatedCompletionDate.toLocaleTimeString()}) passes verified safe deadline (${safeDeadlineDate.toLocaleTimeString()}) by ${Math.abs(timeMarginMinutes)} minutes.`
    );
  }

  // Check Recipient Operating Hours against Estimated Arrival
  const arrivalHours = timeline.estimatedArrivalDate.getHours();
  const arrivalMinutes = timeline.estimatedArrivalDate.getMinutes();
  const arrivalTimeVal = arrivalHours * 60 + arrivalMinutes;

  const [openH, openM] = recipient.operatingHours.open.split(':').map(Number);
  const [closeH, closeM] = recipient.operatingHours.close.split(':').map(Number);
  const openTimeVal = openH * 60 + openM;
  const closeTimeVal = closeH * 60 + closeM;

  if (arrivalTimeVal < openTimeVal || arrivalTimeVal > closeTimeVal) {
    reasons.push(
      `Delivery arrival (${timeline.estimatedArrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) falls outside operating hours (${recipient.operatingHours.open} - ${recipient.operatingHours.close}).`
    );
  }

  const overallEligible = reasons.length === 0;
  let bindingConstraint: SafetyGateCheckResult['bindingConstraint'] = undefined;

  if (!overallEligible) {
    if (reasons.some((r) => r.includes('operating hours'))) {
      bindingConstraint = 'Operating Hours Closed';
    } else {
      bindingConstraint = 'Safety/Deadline';
    }
  }

  const explanation = overallEligible
    ? `Time-feasible: ${timeMarginMinutes} min safety buffer remaining before deadline (${safeDeadlineDate.toLocaleTimeString()}).`
    : reasons.join('; ');

  return {
    isEligible: overallEligible,
    isTimeFeasible: isTimeFeasible && reasons.length === 0,
    rejectionReasons: reasons,
    bindingConstraint,
    timeline,
    timeMarginMinutes,
    explanation,
  };
}
