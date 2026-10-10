import { Coordinates, Vehicle } from '../types';

// Urban circuity / detour factor (Manhattan / grid / urban street network)
export const URBAN_CIRCUITY_FACTOR = 1.32;
export const PICKUP_HANDOVER_MINUTES = 12;
export const DROPOFF_HANDOVER_MINUTES = 12;

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates realistic urban driving distance.
 */
export function calculateUrbanDrivingDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const direct = calculateHaversineDistanceKm(c1, c2);
  return Number((direct * URBAN_CIRCUITY_FACTOR).toFixed(2));
}

/**
 * Estimates driving travel time in minutes based on distance and vehicle speed.
 */
export function estimateTravelTimeMinutes(
  distanceKm: number,
  vehicleSpeedKmH: number = 32,
  trafficCongestionFactor: number = 1.15
): number {
  if (distanceKm <= 0.05) return 3; // minimal buffer for adjacent blocks
  const effectiveSpeed = Math.max(10, vehicleSpeedKmH / trafficCongestionFactor);
  const travelHours = distanceKm / effectiveSpeed;
  return Math.ceil(travelHours * 60);
}

/**
 * Full mission timeline estimation:
 * 1. Dispatch travel to donor (if vehicle provided)
 * 2. Pickup and handover at donor
 * 3. Driving travel from donor to recipient
 * 4. Drop-off, temp verification and intake at recipient
 */
export interface MissionTimeline {
  pickupReadyDate: Date;
  estimatedPickupDate: Date;
  estimatedArrivalDate: Date;
  estimatedCompletionDate: Date;
  travelMinutes: number;
  totalMissionMinutes: number;
}

export function computeMissionTimeline(
  pickupReadyIso: string,
  donorLoc: Coordinates,
  recipientLoc: Coordinates,
  vehicle?: Vehicle,
  currentTimeIso: string = new Date().toISOString()
): MissionTimeline {
  const now = new Date(currentTimeIso);
  const ready = new Date(pickupReadyIso);

  // Vehicle might already be at donor or traveling from current vehicle loc
  let vehicleArrivalToDonorMin = 0;
  const speed = vehicle ? vehicle.speedKmH : 30;

  if (vehicle && vehicle.location) {
    const distToDonor = calculateUrbanDrivingDistanceKm(vehicle.location, donorLoc);
    vehicleArrivalToDonorMin = estimateTravelTimeMinutes(distToDonor, speed);
  }

  // Pickup start time cannot be earlier than when the food is ready AND when vehicle arrives
  const vehicleArrivalDate = new Date(now.getTime() + vehicleArrivalToDonorMin * 60000);
  const effectivePickupStart = vehicleArrivalDate.getTime() > ready.getTime() ? vehicleArrivalDate : ready;

  const estimatedPickupDone = new Date(effectivePickupStart.getTime() + PICKUP_HANDOVER_MINUTES * 60000);

  // Travel from donor to recipient
  const donorToRecipDist = calculateUrbanDrivingDistanceKm(donorLoc, recipientLoc);
  const travelMin = estimateTravelTimeMinutes(donorToRecipDist, speed);

  const estimatedArrivalAtRecipient = new Date(estimatedPickupDone.getTime() + travelMin * 60000);
  const estimatedCompletionDate = new Date(estimatedArrivalAtRecipient.getTime() + DROPOFF_HANDOVER_MINUTES * 60000);

  const totalMissionMin = Math.ceil((estimatedCompletionDate.getTime() - now.getTime()) / 60000);

  return {
    pickupReadyDate: ready,
    estimatedPickupDate: estimatedPickupDone,
    estimatedArrivalDate: estimatedArrivalAtRecipient,
    estimatedCompletionDate,
    travelMinutes: travelMin,
    totalMissionMinutes: Math.max(0, totalMissionMin),
  };
}
