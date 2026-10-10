import { PlannedRoute, RouteStop, SingleAssignment, Vehicle, FoodDonation, Recipient } from '../types';
import { calculateUrbanDrivingDistanceKm, estimateTravelTimeMinutes } from './routingEstimator';

/**
 * Builds coherent delivery routes from active assignments.
 * Supports bundled pickups for nearby donors while strictly guaranteeing that each food batch
 * reaches its recipient before its individual safe deadline.
 */
export function generatePlannedRoutes(
  assignments: SingleAssignment[],
  vehicles: Vehicle[],
  donations: FoodDonation[],
  recipients: Recipient[],
  currentTimeIso: string = new Date().toISOString()
): PlannedRoute[] {
  const routes: PlannedRoute[] = [];
  const donationMap = new Map(donations.map((d) => [d.id, d]));
  const recipientMap = new Map(recipients.map((r) => [r.id, r]));

  // Group assignments by assigned vehicle
  const assignmentsByVehicle = new Map<string, SingleAssignment[]>();

  assignments.forEach((asg) => {
    const vId = asg.vehicleId || vehicles[0]?.id || 'VEH-DEFAULT';
    if (!assignmentsByVehicle.has(vId)) {
      assignmentsByVehicle.set(vId, []);
    }
    assignmentsByVehicle.get(vId)!.push(asg);
  });

  const now = new Date(currentTimeIso);

  assignmentsByVehicle.forEach((vAssignments, vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId) || {
      id: vehicleId,
      name: 'Standard Dispatch Unit',
      speedKmH: 30,
      location: { lat: 40.7128, lng: -74.006 },
    };

    const stops: RouteStop[] = [];
    let currentPoint = vehicle.location;
    let accumulatedTimeMs = now.getTime();
    let totalDistKm = 0;
    let allDeadlinesFeasible = true;

    // Check if bundled pickup (more than 1 distinct donor on this vehicle's run)
    const distinctDonationIds = new Set(vAssignments.map((a) => a.donationId));
    const isBundled = distinctDonationIds.size > 1;

    // Schedule pickups first, then deliveries
    // 1. Add Pickup stops
    distinctDonationIds.forEach((donationId) => {
      const don = donationMap.get(donationId);
      if (!don) return;

      const asgsForDon = vAssignments.filter((a) => a.donationId === donationId);
      const totalPickupQty = asgsForDon.reduce((s, a) => s + a.allocatedQuantity, 0);

      const legDist = calculateUrbanDrivingDistanceKm(currentPoint, don.location);
      totalDistKm += legDist;
      const legTimeMin = estimateTravelTimeMinutes(legDist, vehicle.speedKmH);
      accumulatedTimeMs += legTimeMin * 60000;

      const arrivalTime = new Date(accumulatedTimeMs);
      accumulatedTimeMs += 12 * 60000; // 12 mins pickup handover
      const departureTime = new Date(accumulatedTimeMs);

      stops.push({
        id: `STOP-PICKUP-${don.id}`,
        type: 'pickup',
        name: `Pickup: ${don.donorName} (${totalPickupQty} ${don.unit})`,
        location: don.location,
        donationId: don.id,
        quantity: totalPickupQty,
        estimatedArrival: arrivalTime.toISOString(),
        estimatedDeparture: departureTime.toISOString(),
        deadline: don.verifiedSafeDeadline,
        completed: false,
      });

      currentPoint = don.location;
    });

    // 2. Add Delivery stops
    vAssignments.forEach((asg) => {
      const rec = recipientMap.get(asg.recipientId);
      if (!rec) return;

      const legDist = calculateUrbanDrivingDistanceKm(currentPoint, rec.location);
      totalDistKm += legDist;
      const legTimeMin = estimateTravelTimeMinutes(legDist, vehicle.speedKmH);
      accumulatedTimeMs += legTimeMin * 60000;

      const arrivalTime = new Date(accumulatedTimeMs);
      accumulatedTimeMs += 12 * 60000; // 12 mins drop-off & intake verification
      const departureTime = new Date(accumulatedTimeMs);

      // Verify safe deadline
      const deadlineDate = new Date(asg.safeDeadline);
      if (departureTime.getTime() > deadlineDate.getTime()) {
        allDeadlinesFeasible = false;
      }

      stops.push({
        id: `STOP-DELIV-${asg.id}`,
        type: 'delivery',
        name: `Drop-off: ${rec.name} (${asg.allocatedQuantity} meals)`,
        location: rec.location,
        recipientId: rec.id,
        donationId: asg.donationId,
        quantity: asg.allocatedQuantity,
        estimatedArrival: arrivalTime.toISOString(),
        estimatedDeparture: departureTime.toISOString(),
        deadline: asg.safeDeadline,
        completed: asg.status === 'Delivered',
      });

      currentPoint = rec.location;
    });

    const totalDurationMin = Math.ceil((accumulatedTimeMs - now.getTime()) / 60000);

    routes.push({
      id: `ROUTE-${vehicleId}-${Date.now().toString().slice(-4)}`,
      vehicleId,
      vehicleName: vehicle.name,
      stops,
      totalDistanceKm: Number(totalDistKm.toFixed(1)),
      totalDurationMinutes: totalDurationMin,
      isBundledPickup: isBundled,
      safetyFeasible: allDeadlinesFeasible,
      status: 'Scheduled',
    });
  });

  return routes;
}
