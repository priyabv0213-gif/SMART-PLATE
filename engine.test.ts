import { describe, it, expect } from 'vitest';
import { FoodDonation, Recipient, Vehicle, OperationalDisruptionEvent } from '../types';
import { runSpoilClockAdaptiveEngine } from '../engine/spoilClockAdaptiveEngine';
import { runNearestFirstBaseline } from '../engine/nearestFirstBaseline';
import { evaluateCandidateFeasibility } from '../engine/safetyGate';
import { handleDisruptionEvent } from '../engine/reallocationManager';
import { determineRecoveryTier } from '../engine/recoveryEvaluator';

// Fixture helpers
function createSampleDonation(overrides: Partial<FoodDonation> = {}): FoodDonation {
  const baseTime = new Date('2026-10-09T12:00:00Z');
  const safeTime = new Date('2026-10-09T16:00:00Z'); // 4 hours later

  return {
    id: 'DON-001',
    donorName: 'Grand Hotel Metro',
    donorType: 'Hotel',
    foodCategory: 'Cooked meals',
    description: 'Fresh buffet surplus pasta and grilled chicken trays',
    quantity: 100,
    unit: 'meals',
    preparedAt: baseTime.toISOString(),
    storageCondition: 'hot-holding',
    verifiedSafeDeadline: safeTime.toISOString(),
    safetyRuleId: 'FDA-TPHC-HOT-4H',
    safetyVerified: true,
    location: { lat: 40.7128, lng: -74.006, name: 'Grand Hotel', address: '100 Broadway, NY' },
    pickupReadinessTime: baseTime.toISOString(),
    specialHandling: ['Keep warm'],
    status: 'Available',
    createdAt: baseTime.toISOString(),
    ...overrides,
  };
}

function createSampleRecipient(id: string, name: string, overrides: Partial<Recipient> = {}): Recipient {
  return {
    id,
    name,
    type: 'Community Kitchen',
    location: { lat: 40.718, lng: -74.001, name, address: '50 Main St, NY' },
    acceptedCategories: ['Cooked meals', 'Rice & prepared dishes', 'Bakery products'],
    demandQuantity: 50,
    maxReceivingCapacity: 60,
    currentStorageCapacity: 60,
    operatingHours: { open: '08:00', close: '22:00' },
    minAcceptableQuantity: 10,
    maxAcceptableQuantity: 100,
    hasColdStorage: true,
    hasReheatingFacility: true,
    transportationCapability: 'Both',
    active: true,
    currentLoad: 0,
    historicalStats: { acceptedCount: 15, rejectedCount: 0, fulfilledMeals: 450 },
    ...overrides,
  };
}

function createSampleVehicle(id: string = 'VEH-01', overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id,
    name: 'Eco Van 1',
    type: 'Insulated Electric Van',
    capacity: 250,
    currentLoad: 0,
    hasRefrigeration: true,
    speedKmH: 30,
    location: { lat: 40.712, lng: -74.005 },
    status: 'Available',
    costPerKm: 1.2,
    ...overrides,
  };
}

describe('SpoilClock Engine - Master Acceptance Test Suite', () => {
  const fixedNow = '2026-10-09T12:05:00Z';

  // Test 1: No allocation exceeds available supply
  it('Requirement 1: No allocation exceeds available supply', () => {
    const donation = createSampleDonation({ quantity: 80 });
    const rec1 = createSampleRecipient('REC-1', 'Shelter Alpha', { demandQuantity: 120, maxReceivingCapacity: 150 });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [rec1], [vehicle], undefined, fixedNow);

    const totalAllocated = plan.assignments.reduce((sum, a) => sum + a.allocatedQuantity, 0);
    expect(totalAllocated).toBeLessThanOrEqual(donation.quantity);
    expect(totalAllocated).toBe(80);
    expect(plan.unallocated.length).toBe(0);
  });

  // Test 2: No recipient exceeds capacity
  it('Requirement 2: No recipient exceeds capacity', () => {
    const donation = createSampleDonation({ quantity: 150 });
    const rec1 = createSampleRecipient('REC-1', 'Small Kitchen', {
      maxReceivingCapacity: 45,
      currentLoad: 10,
      demandQuantity: 100,
    });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [rec1], [vehicle], undefined, fixedNow);

    const allocatedToRec1 = plan.assignments
      .filter((a) => a.recipientId === 'REC-1')
      .reduce((sum, a) => sum + a.allocatedQuantity, 0);

    const remainingCap = rec1.maxReceivingCapacity - rec1.currentLoad;
    expect(allocatedToRec1).toBeLessThanOrEqual(remainingCap);
    expect(allocatedToRec1).toBe(35); // 45 max - 10 currentLoad = 35 available
  });

  // Test 3: No quantity is allocated twice
  it('Requirement 3: No quantity is allocated twice (mass conservation)', () => {
    const donation = createSampleDonation({ quantity: 100 });
    const rec1 = createSampleRecipient('REC-1', 'Kitchen A', { demandQuantity: 40, maxReceivingCapacity: 50 });
    const rec2 = createSampleRecipient('REC-2', 'Kitchen B', { demandQuantity: 60, maxReceivingCapacity: 80 });
    const rec3 = createSampleRecipient('REC-3', 'Kitchen C', { demandQuantity: 50, maxReceivingCapacity: 50 });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [rec1, rec2, rec3], [vehicle], undefined, fixedNow);

    const sumAllocated = plan.assignments.reduce((sum, a) => sum + a.allocatedQuantity, 0);
    const unallocatedQty = plan.unallocated.reduce((sum, u) => sum + u.remainingQuantity, 0);

    expect(sumAllocated + unallocatedQty).toBe(donation.quantity);
    expect(sumAllocated).toBe(100);
  });

  // Test 4: Ineligible food is never automatically assigned for human consumption
  it('Requirement 4: Ineligible food is never automatically assigned for human consumption', () => {
    const unverifiedDonation = createSampleDonation({
      id: 'DON-UNVERIFIED',
      safetyVerified: false, // NOT verified
      quantity: 50,
    });
    const rec1 = createSampleRecipient('REC-1', 'Kitchen A');
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([unverifiedDonation], [rec1], [vehicle], undefined, fixedNow);

    const assignedForUnverified = plan.assignments.filter((a) => a.donationId === 'DON-UNVERIFIED');
    expect(assignedForUnverified.length).toBe(0);
    expect(plan.unallocated.some((u) => u.donationId === 'DON-UNVERIFIED')).toBe(true);
    expect(plan.unallocated[0].reason).toContain('Safety verification missing');
  });

  // Test 5: Deadline-infeasible assignments are rejected
  it('Requirement 5: Deadline-infeasible assignments are rejected', () => {
    // Safe deadline is only 5 minutes from now, but travel + handover takes ~30 mins
    const nearExpiredDonation = createSampleDonation({
      id: 'DON-EXPIRED-SOON',
      verifiedSafeDeadline: new Date(new Date(fixedNow).getTime() + 5 * 60000).toISOString(),
    });
    const rec1 = createSampleRecipient('REC-1', 'Kitchen Far', {
      location: { lat: 40.85, lng: -73.9, name: 'Distant Center' }, // ~18 km away
    });
    const vehicle = createSampleVehicle();

    const check = evaluateCandidateFeasibility(nearExpiredDonation, rec1, vehicle, fixedNow);
    expect(check.isTimeFeasible).toBe(false);
    expect(check.rejectionReasons.some((r) => r.includes('Rescue window exceeded'))).toBe(true);

    const plan = runSpoilClockAdaptiveEngine([nearExpiredDonation], [rec1], [vehicle], undefined, fixedNow);
    expect(plan.assignments.length).toBe(0);
    expect(plan.rejectedCandidates.length).toBeGreaterThan(0);
  });

  // Test 6: Split allocations conserve the total quantity
  it('Requirement 6: Split allocations conserve the total quantity exactly', () => {
    const donation = createSampleDonation({ quantity: 100 });
    const recA = createSampleRecipient('REC-A', 'NGO A', { demandQuantity: 40, maxReceivingCapacity: 40 });
    const recB = createSampleRecipient('REC-B', 'NGO B', { demandQuantity: 35, maxReceivingCapacity: 35 });
    const recC = createSampleRecipient('REC-C', 'NGO C', { demandQuantity: 25, maxReceivingCapacity: 25 });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [recA, recB, recC], [vehicle], undefined, fixedNow);

    expect(plan.assignments.length).toBe(3);
    const assignedA = plan.assignments.find((a) => a.recipientId === 'REC-A')?.allocatedQuantity;
    const assignedB = plan.assignments.find((a) => a.recipientId === 'REC-B')?.allocatedQuantity;
    const assignedC = plan.assignments.find((a) => a.recipientId === 'REC-C')?.allocatedQuantity;

    expect(assignedA).toBe(40);
    expect(assignedB).toBe(35);
    expect(assignedC).toBe(25);
    expect((assignedA || 0) + (assignedB || 0) + (assignedC || 0)).toBe(100);
    expect(plan.assignments.every((a) => a.isSplit)).toBe(true);
  });

  // Test 7: A cancellation triggers recalculation
  it('Requirement 7: A cancellation triggers recalculation', () => {
    const donation = createSampleDonation({ quantity: 100 });
    const recA = createSampleRecipient('REC-A', 'NGO A', { demandQuantity: 40, maxReceivingCapacity: 40 });
    const recB = createSampleRecipient('REC-B', 'NGO B', { demandQuantity: 60, maxReceivingCapacity: 60 });
    const recC = createSampleRecipient('REC-C', 'NGO C (Backup)', { demandQuantity: 50, maxReceivingCapacity: 50 });
    const vehicle = createSampleVehicle();

    const initialPlan = runSpoilClockAdaptiveEngine([donation], [recA, recB, recC], [vehicle], undefined, fixedNow);
    expect(initialPlan.assignments.some((a) => a.recipientId === 'REC-A')).toBe(true);

    const event: OperationalDisruptionEvent = {
      id: 'EVT-CANCEL-A',
      type: 'recipient_cancellation',
      timestamp: fixedNow,
      title: 'NGO A Cancelled Intake',
      description: 'Kitchen equipment malfunction at NGO A',
      targetId: 'REC-A',
      severity: 'high',
      resolved: false,
    };

    const reallocation = handleDisruptionEvent(
      event,
      initialPlan,
      [donation],
      [recA, recB, recC],
      [vehicle],
      fixedNow
    );

    expect(reallocation.event.resolved).toBe(true);
    // NGO A should no longer have any active assignments in revised plan
    const revisedA = reallocation.revisedPlan.assignments.filter((a) => a.recipientId === 'REC-A');
    expect(revisedA.length).toBe(0);
    // Backup NGO C should now receive the surplus
    const revisedC = reallocation.revisedPlan.assignments.find((a) => a.recipientId === 'REC-C');
    expect(revisedC).toBeDefined();
    expect(revisedC?.allocatedQuantity).toBe(40);
  });

  // Test 8: Completed deliveries are not reassigned
  it('Requirement 8: Completed deliveries are not reassigned', () => {
    const donation = createSampleDonation({ quantity: 100 });
    const recA = createSampleRecipient('REC-A', 'NGO A', { demandQuantity: 50 });
    const recB = createSampleRecipient('REC-B', 'NGO B', { demandQuantity: 50 });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [recA, recB], [vehicle], undefined, fixedNow);
    // Mark assignment to REC-A as Delivered
    plan.assignments[0].status = 'Delivered';

    const event: OperationalDisruptionEvent = {
      id: 'EVT-VEHICLE-DOWN',
      type: 'vehicle_breakdown',
      timestamp: fixedNow,
      title: 'Vehicle Broken Down',
      description: 'Flat tire on highway',
      targetId: 'VEH-01',
      severity: 'medium',
      resolved: false,
    };

    const reallocation = handleDisruptionEvent(event, plan, [donation], [recA, recB], [vehicle], fixedNow);

    // Delivered assignment must be preserved
    expect(reallocation.preservedAssignments.length).toBe(1);
    expect(reallocation.preservedAssignments[0].status).toBe('Delivered');
    expect(reallocation.preservedAssignments[0].recipientId).toBe(plan.assignments[0].recipientId);
  });

  // Test 9: No feasible recipient results in a documented failed assignment
  it('Requirement 9: No feasible recipient results in a documented failed assignment', () => {
    // Produce donation, but recipients only take Cooked meals
    const produceDonation = createSampleDonation({
      id: 'DON-PRODUCE',
      foodCategory: 'Fruits & vegetables',
      quantity: 60,
    });
    const strictRec = createSampleRecipient('REC-COOKED-ONLY', 'Strict Kitchen', {
      acceptedCategories: ['Cooked meals'], // does NOT accept produce
    });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([produceDonation], [strictRec], [vehicle], undefined, fixedNow);

    expect(plan.assignments.length).toBe(0);
    expect(plan.unallocated.length).toBe(1);
    expect(plan.unallocated[0].remainingQuantity).toBe(60);
    expect(plan.rejectedCandidates.length).toBe(1);
    expect(plan.rejectedCandidates[0].bindingConstraint).toBe('Category Incompatible');
  });

  // Test 10: Recovery routes require their own eligibility checks
  it('Requirement 10: Recovery routes require their own eligibility checks', () => {
    const bakeryDonation = createSampleDonation({ foodCategory: 'Bakery products', quantity: 40 });
    const cookedDonation = createSampleDonation({ foodCategory: 'Cooked meals', quantity: 50 });

    const bakeryTier = determineRecoveryTier(bakeryDonation, 'No recipient available');
    expect(bakeryTier.category).toBe('Animal Feed');
    expect(bakeryTier.isEligible).toBe(true);
    expect(bakeryTier.facility).toContain('Livestock Feed');

    const cookedTier = determineRecoveryTier(cookedDonation, 'Safe window expired');
    expect(cookedTier.category).toBe('Biogas Digestion');
    expect(cookedTier.facility).toContain('EcoMethane');
  });

  // Test 11: Reproducible simulations produce reproducible results under fixed settings
  it('Requirement 11: Reproducible simulations produce reproducible results under fixed settings', () => {
    const donation = createSampleDonation({ quantity: 120 });
    const rec1 = createSampleRecipient('REC-1', 'Kitchen 1', { demandQuantity: 60 });
    const rec2 = createSampleRecipient('REC-2', 'Kitchen 2', { demandQuantity: 60 });
    const vehicle = createSampleVehicle();

    const plan1 = runSpoilClockAdaptiveEngine([donation], [rec1, rec2], [vehicle], undefined, fixedNow);
    const plan2 = runSpoilClockAdaptiveEngine([donation], [rec1, rec2], [vehicle], undefined, fixedNow);

    expect(plan1.assignments.length).toBe(plan2.assignments.length);
    expect(plan1.metrics.quantityAllocated).toBe(plan2.metrics.quantityAllocated);
    expect(plan1.metrics.fairnessIndex).toBe(plan2.metrics.fairnessIndex);
    expect(plan1.metrics.totalTransportKm).toBe(plan2.metrics.totalTransportKm);
  });

  // Test 12: Performance metrics match independently calculated expected values
  it('Requirement 12: Performance metrics match independently calculated expected values', () => {
    const donation = createSampleDonation({ quantity: 100 });
    const rec1 = createSampleRecipient('REC-1', 'Kitchen 1', { demandQuantity: 50, maxReceivingCapacity: 50 });
    const rec2 = createSampleRecipient('REC-2', 'Kitchen 2', { demandQuantity: 50, maxReceivingCapacity: 50 });
    const vehicle = createSampleVehicle();

    const plan = runSpoilClockAdaptiveEngine([donation], [rec1, rec2], [vehicle], undefined, fixedNow);

    // Independent checks:
    const expectedAllocated = 100;
    const expectedSurplus = 100;
    const expectedUnallocated = 0;
    const expectedDemandSatisfaction = 100; // 100 allocated / (50 + 50 demand) * 100
    const expectedFairness = 1.0; // Both got 50/50 = 100% of demand -> perfect fairness

    expect(plan.metrics.quantityAllocated).toBe(expectedAllocated);
    expect(plan.metrics.totalSurplusRegistered).toBe(expectedSurplus);
    expect(plan.metrics.quantityUnallocated).toBe(expectedUnallocated);
    expect(plan.metrics.demandSatisfactionRate).toBe(expectedDemandSatisfaction);
    expect(plan.metrics.fairnessIndex).toBe(expectedFairness);
  });
});
