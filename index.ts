export type FoodCategory =
  | 'Cooked meals'
  | 'Rice & prepared dishes'
  | 'Bakery products'
  | 'Fruits & vegetables'
  | 'Packaged food'
  | 'Dairy & chilled';

export type StorageCondition =
  | 'hot-holding'
  | 'refrigerated'
  | 'ambient'
  | 'frozen';

export type DonorType =
  | 'Restaurant'
  | 'Hotel'
  | 'Supermarket'
  | 'Bakery'
  | 'Catering'
  | 'Corporate Cafeteria';

export type RecipientType =
  | 'Community Kitchen'
  | 'Food Bank'
  | 'Shelter'
  | 'Homeless Outreach'
  | 'Youth Center';

export type DonationStatus =
  | 'Pending verification'
  | 'Available'
  | 'Eligible for allocation'
  | 'Allocated'
  | 'Pickup scheduled'
  | 'In transit'
  | 'Delivered'
  | 'Rejected'
  | 'Sent to approved recovery'
  | 'Unrecovered';

export type RecoveryCategory =
  | 'Animal Feed'
  | 'Composting'
  | 'Biogas Digestion'
  | 'Safe Disposal';

export interface Coordinates {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface SafetyRule {
  id: string;
  name: string;
  standardAuthority: string; // e.g., 'FDA Food Code 3-501.19', 'FSSAI Guidance', 'EU Reg EC 852/2004'
  maxSafeHoursFromPrep: number; // e.g. 4h for hot food, 6h for cold food
  requiresColdChain: boolean;
  requiresThermalBag: boolean;
  minTempHoldingC?: number;
  maxTempHoldingC?: number;
  allowHumanRedistribution: boolean;
  description: string;
}

export interface FoodDonation {
  id: string;
  donorName: string;
  donorType: DonorType;
  foodCategory: FoodCategory;
  foodName?: string;
  description: string;
  quantity: number; // in meals/units
  unit: 'meals' | 'kg' | 'portions' | 'trays';
  preparedAt: string; // ISO string
  storageCondition: StorageCondition;
  currentTempC?: number;
  verifiedSafeDeadline: string; // ISO string - verified threshold for safe human consumption
  safetyRuleId: string;
  safetyVerified: boolean; // if false -> requires verification, prevents automatic human consumption
  location: Coordinates;
  city?: string;
  pickupAddress?: string;
  remainingHours?: number;
  pickupReadinessTime: string; // ISO string
  specialHandling: string[]; // e.g., ['Keep Above 60C', 'Cold Chain Required', 'Fragile Trays']
  status: DonationStatus;
  notes?: string;
  imageUrl?: string;
  assignedRecipientId?: string;
  allocatedQuantity?: number;
  createdAt: string;
}

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  location: Coordinates;
  city?: string;
  acceptedCategories: FoodCategory[];
  demandQuantity: number; // target meals demanded
  maxReceivingCapacity: number; // absolute intake capacity
  currentStorageCapacity: number; // available storage capacity right now
  operatingHours: {
    open: string; // e.g., "08:00"
    close: string; // e.g., "20:00"
  };
  minAcceptableQuantity: number;
  maxAcceptableQuantity: number;
  hasColdStorage: boolean;
  hasReheatingFacility: boolean;
  transportationCapability: 'Self-pickup' | 'Delivery-only' | 'Both';
  active: boolean;
  currentLoad: number; // quantity already allocated/delivered in current window
  historicalStats: {
    acceptedCount: number;
    rejectedCount: number;
    fulfilledMeals: number;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Refrigerated Van' | 'Insulated Electric Van' | 'Cargo E-Bike' | 'Standard Light Van';
  capacity: number; // max meal equivalent
  currentLoad: number;
  hasRefrigeration: boolean;
  speedKmH: number;
  location: Coordinates;
  city?: string;
  status: 'Available' | 'Assigned' | 'In Transit' | 'Delayed' | 'Broken Down';
  costPerKm: number;
  assignedRouteId?: string;
}

export interface AllocationObjectiveWeights {
  foodRescued: number; // 0 to 1
  demandSatisfied: number; // 0 to 1
  transportDistance: number; // 0 to 1 (penalty)
  fairness: number; // 0 to 1
}

export interface SingleAssignment {
  id: string;
  donationId: string;
  recipientId: string;
  vehicleId?: string;
  donorName: string;
  recipientName: string;
  foodName?: string;
  foodCategory: FoodCategory;
  allocatedQuantity: number;
  originalSupplyQuantity: number;
  isSplit: boolean;
  splitIndex?: number;
  totalSplits?: number;
  distanceKm: number;
  travelTimeMinutes: number;
  estimatedTravelMinutes?: number;
  estimatedPickupTime: string;
  estimatedArrivalTime: string;
  estimatedCompletionTime: string;
  safeDeadline: string;
  timeMarginMinutes: number; // safeDeadline - estimatedCompletionTime (must be >= 0 for feasibility)
  isTimeFeasible: boolean;
  explanation: string;
  bindingConstraints: string[];
  status: 'Scheduled' | 'Pickup En Route' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Delayed';
  score?: number;
  pickupLocation?: Coordinates;
  deliveryLocation?: Coordinates;
  createdAt: string;
}

export interface UnallocatedDonation {
  donationId: string;
  donorName: string;
  category: FoodCategory;
  remainingQuantity: number;
  reason: string;
  candidateRecoveryRoute?: RecoveryCategory;
}

export interface RejectedAssignmentCandidate {
  donationId: string;
  recipientId: string;
  recipientName: string;
  reason: string;
  bindingConstraint: 'Safety/Deadline' | 'Capacity Exceeded' | 'Category Incompatible' | 'Operating Hours Closed' | 'No Vehicle Available';
}

export interface AllocationMetrics {
  totalSurplusRegistered: number;
  quantityAllocated: number;
  quantitySafelyDelivered: number;
  quantityAtRisk: number;
  quantityUnallocated: number;
  onTimeDeliveryRate: number; // percentage
  demandSatisfactionRate: number; // percentage
  totalTransportKm: number;
  kmPerRescuedMeal: number;
  fairnessIndex: number; // Jain's fairness index (0 to 1)
  co2PreventedKg: number; // estimated using ~2.5 kg CO2e per kg food saved
  recoveredAlternativeQuantity: number;
  unrecoverableQuantity: number;
}

export interface AllocationPlan {
  runId: string;
  timestamp: string;
  algorithm: 'spoilclock-adaptive' | 'nearest-first' | 'static-time-window';
  objectiveWeights: AllocationObjectiveWeights;
  assignments: SingleAssignment[];
  unallocated: UnallocatedDonation[];
  rejectedCandidates: RejectedAssignmentCandidate[];
  metrics: AllocationMetrics;
  executionTimeMs: number;
}

export interface RecoveryRecord {
  id: string;
  donationId: string;
  donorName: string;
  foodCategory: FoodCategory;
  reasonHumanConsumptionFailed: string;
  recoveryCategory: RecoveryCategory;
  receivingFacility: string;
  quantity: number;
  unit: string;
  eligibilityVerified: boolean;
  verificationRule: string;
  handoverStatus: 'Pending Dispatch' | 'Dispatched' | 'Delivered' | 'Certification Complete';
  timestamp: string;
  regulatoryComplianceNotes: string;
}

export interface OperationalDisruptionEvent {
  id: string;
  type:
    | 'recipient_cancellation'
    | 'vehicle_breakdown'
    | 'delivery_delay'
    | 'demand_change'
    | 'new_donation'
    | 'recipient_available';
  timestamp: string;
  title: string;
  description: string;
  targetId: string; // recipientId, vehicleId, or donationId
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  reallocationDiff?: {
    preservedDeliveriesCount: number;
    reallocatedMealsCount: number;
    unrecoverableMealsDelta: number;
    explanation: string;
    previousPlanId: string;
    newPlanId: string;
  };
}

export interface RouteStop {
  id: string;
  type: 'pickup' | 'delivery' | 'depot';
  name: string;
  location: Coordinates;
  donationId?: string;
  recipientId?: string;
  quantity: number;
  estimatedArrival: string;
  estimatedDeparture: string;
  deadline?: string;
  completed: boolean;
}

export interface PlannedRoute {
  id: string;
  vehicleId: string;
  vehicleName: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  isBundledPickup: boolean;
  safetyFeasible: boolean;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Disrupted';
}
