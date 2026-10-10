import { FoodDonation, Recipient, Vehicle, AllocationPlan } from '../types';
import { runSpoilClockAdaptiveEngine } from './spoilClockAdaptiveEngine';
import { runNearestFirstBaseline } from './nearestFirstBaseline';
import { runStaticTimeWindowBaseline } from './staticTimeWindowBaseline';

export interface PredefinedScenario {
  id: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  name: string;
  tagline: string;
  description: string;
  expectedInsight: string;
  donations: FoodDonation[];
  recipients: Recipient[];
  vehicles: Vehicle[];
}

// Pseudo-random generator with fixed seed for reproducible simulation runs
export function createSeededRandom(seed: number = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSyntheticScenarioData(
  numDonors: number = 5,
  numRecipients: number = 6,
  seed: number = 101,
  currentTimeIso: string = new Date().toISOString()
) {
  const rand = createSeededRandom(seed);
  const baseLat = 40.7306;
  const baseLng = -73.9352;
  const now = new Date(currentTimeIso).getTime();

  const donorTypes = ['Restaurant', 'Hotel', 'Supermarket', 'Bakery', 'Catering', 'Corporate Cafeteria'] as const;
  const categories = [
    'Cooked meals',
    'Rice & prepared dishes',
    'Bakery products',
    'Fruits & vegetables',
    'Packaged food',
  ] as const;

  const donations: FoodDonation[] = [];
  for (let i = 1; i <= numDonors; i++) {
    const cat = categories[Math.floor(rand() * categories.length)];
    const dType = donorTypes[Math.floor(rand() * donorTypes.length)];
    const qty = Math.floor(rand() * 90) + 30; // 30 to 120
    const safeHours = cat === 'Cooked meals' ? 3.5 : cat === 'Bakery products' ? 24 : 12;
    const deadline = new Date(now + (safeHours + rand() * 2) * 3600000).toISOString();

    donations.push({
      id: `DON-SYN-${i}`,
      donorName: `City Partner Donor #${i} (${dType})`,
      donorType: dType,
      foodCategory: cat,
      description: `Surplus ${cat} prepared in commercial kitchen`,
      quantity: qty,
      unit: 'meals',
      preparedAt: new Date(now - 30 * 60000).toISOString(),
      storageCondition: cat === 'Cooked meals' ? 'hot-holding' : 'ambient',
      verifiedSafeDeadline: deadline,
      safetyRuleId: 'FDA-TPHC-HOT-4H',
      safetyVerified: true,
      location: {
        lat: baseLat + (rand() - 0.5) * 0.08,
        lng: baseLng + (rand() - 0.5) * 0.08,
        name: `Donor Hub ${i}`,
        address: `${100 + i * 20} Metropolitan Ave`,
      },
      pickupReadinessTime: new Date(now + 10 * 60000).toISOString(),
      specialHandling: cat === 'Cooked meals' ? ['Keep Warm > 60C'] : [],
      status: 'Available',
      createdAt: new Date(now).toISOString(),
    });
  }

  const recipientTypes = ['Community Kitchen', 'Food Bank', 'Shelter', 'Homeless Outreach', 'Youth Center'] as const;
  const recipients: Recipient[] = [];
  for (let j = 1; j <= numRecipients; j++) {
    const rType = recipientTypes[Math.floor(rand() * recipientTypes.length)];
    const cap = Math.floor(rand() * 100) + 40;
    const demand = Math.floor(rand() * 80) + 30;

    recipients.push({
      id: `REC-SYN-${j}`,
      name: `Hope Haven ${rType} #${j}`,
      type: rType,
      location: {
        lat: baseLat + (rand() - 0.5) * 0.09,
        lng: baseLng + (rand() - 0.5) * 0.09,
        name: `Haven Center ${j}`,
        address: `${200 + j * 15} Community Way`,
      },
      acceptedCategories: ['Cooked meals', 'Rice & prepared dishes', 'Bakery products', 'Fruits & vegetables', 'Packaged food'],
      demandQuantity: demand,
      maxReceivingCapacity: cap,
      currentStorageCapacity: cap,
      operatingHours: { open: '08:00', close: '22:00' },
      minAcceptableQuantity: 10,
      maxAcceptableQuantity: 120,
      hasColdStorage: true,
      hasReheatingFacility: true,
      transportationCapability: 'Both',
      active: true,
      currentLoad: 0,
      historicalStats: { acceptedCount: 20, rejectedCount: 1, fulfilledMeals: 600 },
    });
  }

  const vehicles: Vehicle[] = [
    {
      id: 'VEH-SYN-1',
      name: 'Eco Delivery Van Alpha',
      type: 'Insulated Electric Van',
      capacity: 250,
      currentLoad: 0,
      hasRefrigeration: true,
      speedKmH: 32,
      location: { lat: baseLat, lng: baseLng },
      status: 'Available',
      costPerKm: 1.1,
    },
    {
      id: 'VEH-SYN-2',
      name: 'Cargo E-Bike Beta',
      type: 'Cargo E-Bike',
      capacity: 80,
      currentLoad: 0,
      hasRefrigeration: false,
      speedKmH: 22,
      location: { lat: baseLat + 0.01, lng: baseLng - 0.01 },
      status: 'Available',
      costPerKm: 0.4,
    },
    {
      id: 'VEH-SYN-3',
      name: 'Metro Chill Truck Gamma',
      type: 'Refrigerated Van',
      capacity: 350,
      currentLoad: 0,
      hasRefrigeration: true,
      speedKmH: 28,
      location: { lat: baseLat - 0.015, lng: baseLng + 0.01 },
      status: 'Available',
      costPerKm: 1.5,
    },
  ];

  return { donations, recipients, vehicles };
}

/**
 * Returns all 10 standard competition benchmark scenarios (A through J).
 */
export function getPredefinedScenarios(currentTimeIso: string = new Date().toISOString()): PredefinedScenario[] {
  const now = new Date(currentTimeIso).getTime();

  return [
    {
      id: 'SCENARIO-A',
      code: 'A',
      name: 'Normal Operations (Baseline Flow)',
      tagline: 'Balanced surplus and demand across standard metropolitan network',
      description:
        'Standard operational morning with 4 diverse donors (hotel breakfast, corporate catering, supermarket produce) and 4 active community recipients with compatible requirements and open windows.',
      expectedInsight:
        'All three algorithms achieve solid rescue numbers, but SpoilClock achieves significantly higher fairness and lowers total transport km by optimizing global matchings.',
      ...generateSyntheticScenarioData(4, 4, 101, currentTimeIso),
    },
    {
      id: 'SCENARIO-B',
      code: 'B',
      name: 'Nearest Recipient Capacity Saturated',
      tagline: 'Nearest recipient is physically full; greedy nearest-first leaves surplus stranded',
      description:
        'A large 120-meal hotel donation is located 0.8 km from a small shelter whose capacity is already 90% full. The next recipient is 3.5 km away with 100-meal open capacity.',
      expectedInsight:
        'Nearest-First baseline attempts to dump at the closest shelter and halts when capacity is exceeded, leaving the rest stranded. SpoilClock seamlessly allocates or splits across the next available recipient.',
      donations: [
        {
          id: 'DON-SCEN-B1',
          donorName: 'The Manhattan Grand Hotel',
          donorType: 'Hotel',
          foodCategory: 'Cooked meals',
          description: '120 fresh warm luncheon buffet trays',
          quantity: 120,
          unit: 'meals',
          preparedAt: new Date(now - 20 * 60000).toISOString(),
          storageCondition: 'hot-holding',
          verifiedSafeDeadline: new Date(now + 3.5 * 3600000).toISOString(),
          safetyRuleId: 'FDA-TPHC-HOT-4H',
          safetyVerified: true,
          location: { lat: 40.758, lng: -73.985, name: 'Grand Hotel Midtown' },
          pickupReadinessTime: new Date(now + 10 * 60000).toISOString(),
          specialHandling: ['Keep warm > 60C'],
          status: 'Available',
          createdAt: new Date(now).toISOString(),
        },
      ],
      recipients: [
        {
          id: 'REC-SCEN-B-CLOSE',
          name: 'Tiny Corner Shelter (Nearest: 0.8 km)',
          type: 'Shelter',
          location: { lat: 40.754, lng: -73.982, name: 'Corner Shelter' },
          acceptedCategories: ['Cooked meals'],
          demandQuantity: 20,
          maxReceivingCapacity: 25,
          currentStorageCapacity: 25,
          operatingHours: { open: '08:00', close: '22:00' },
          minAcceptableQuantity: 5,
          maxAcceptableQuantity: 30,
          hasColdStorage: true,
          hasReheatingFacility: true,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 20, // Only 5 meals space left!
          historicalStats: { acceptedCount: 10, rejectedCount: 0, fulfilledMeals: 200 },
        },
        {
          id: 'REC-SCEN-B-FAR',
          name: 'City Central Mission (3.5 km)',
          type: 'Community Kitchen',
          location: { lat: 40.73, lng: -73.995, name: 'Central Mission' },
          acceptedCategories: ['Cooked meals'],
          demandQuantity: 120,
          maxReceivingCapacity: 150,
          currentStorageCapacity: 150,
          operatingHours: { open: '08:00', close: '22:00' },
          minAcceptableQuantity: 10,
          maxAcceptableQuantity: 150,
          hasColdStorage: true,
          hasReheatingFacility: true,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 10, // 140 meals space available!
          historicalStats: { acceptedCount: 40, rejectedCount: 0, fulfilledMeals: 1500 },
        },
      ],
      vehicles: [
        {
          id: 'VEH-B1',
          name: 'Mission Dispatch Van',
          type: 'Insulated Electric Van',
          capacity: 200,
          currentLoad: 0,
          hasRefrigeration: true,
          speedKmH: 30,
          location: { lat: 40.75, lng: -73.98 },
          status: 'Available',
          costPerKm: 1.0,
        },
      ],
    },
    {
      id: 'SCENARIO-C',
      code: 'C',
      name: 'Nearest Recipient Too Slow / Closed',
      tagline: 'Nearest recipient operating hours close early before delivery can complete',
      description:
        'A fresh lunch surplus arrives at 13:40. The nearest community pantry closes at 14:00 (insufficient intake window). A slightly farther food bank is open until 19:00.',
      expectedInsight:
        'Nearest-First baseline generates a failed delivery due to closed intake window. SpoilClock screens operating hours in the safety gate and safely delivers to the open facility.',
      ...generateSyntheticScenarioData(3, 4, 203, currentTimeIso),
    },
    {
      id: 'SCENARIO-D',
      code: 'D',
      name: 'Competition for Limited Supply',
      tagline: 'Multiple high-need recipients compete for a single high-quality donation',
      description:
        '100 organic nutritious meals available, but three different organizations (women’s shelter, youth outreach, senior center) each requested 50 meals.',
      expectedInsight:
        'SpoilClock demonstrates equitable proportional allocation via Jain’s Fairness optimization, whereas greedy baselines give 100% to the nearest and starve the others.',
      ...generateSyntheticScenarioData(2, 5, 304, currentTimeIso),
    },
    {
      id: 'SCENARIO-E',
      code: 'E',
      name: 'Split Donation Required (Section 7.4)',
      tagline: 'Single large batch (100 meals) must be divided across 3 smaller recipients (40, 35, 25)',
      description:
        'A corporate banquet generates 100 gourmet meals. No individual local kitchen has capacity for 100, but NGO A (capacity 40), NGO B (capacity 35), and NGO C (capacity 25) can collectively rescue 100% of the food.',
      expectedInsight:
        'SpoilClock executes a verified 3-way split (40 + 35 + 25 = 100) with full mass conservation. Nearest-First drops 40 meals at the first recipient and leaves 60 meals unallocated.',
      donations: [
        {
          id: 'DON-SCEN-E1',
          donorName: 'Tech Summit Convention Center',
          donorType: 'Catering',
          foodCategory: 'Cooked meals',
          description: '100 boxed chef-prepared salmon & quinoa meals',
          quantity: 100,
          unit: 'meals',
          preparedAt: new Date(now - 15 * 60000).toISOString(),
          storageCondition: 'hot-holding',
          verifiedSafeDeadline: new Date(now + 4 * 3600000).toISOString(),
          safetyRuleId: 'FDA-TPHC-HOT-4H',
          safetyVerified: true,
          location: { lat: 40.755, lng: -73.99, name: 'Convention Center' },
          pickupReadinessTime: new Date(now + 5 * 60000).toISOString(),
          specialHandling: ['Keep warm'],
          status: 'Available',
          createdAt: new Date(now).toISOString(),
        },
      ],
      recipients: [
        {
          id: 'REC-E-A',
          name: 'NGO A (Capacity: 40)',
          type: 'Shelter',
          location: { lat: 40.758, lng: -73.985, name: 'Shelter A' },
          acceptedCategories: ['Cooked meals'],
          demandQuantity: 40,
          maxReceivingCapacity: 40,
          currentStorageCapacity: 40,
          operatingHours: { open: '08:00', close: '22:00' },
          minAcceptableQuantity: 10,
          maxAcceptableQuantity: 40,
          hasColdStorage: true,
          hasReheatingFacility: true,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 0,
          historicalStats: { acceptedCount: 20, rejectedCount: 0, fulfilledMeals: 400 },
        },
        {
          id: 'REC-E-B',
          name: 'NGO B (Capacity: 35)',
          type: 'Community Kitchen',
          location: { lat: 40.752, lng: -73.992, name: 'Kitchen B' },
          acceptedCategories: ['Cooked meals'],
          demandQuantity: 35,
          maxReceivingCapacity: 35,
          currentStorageCapacity: 35,
          operatingHours: { open: '08:00', close: '22:00' },
          minAcceptableQuantity: 10,
          maxAcceptableQuantity: 35,
          hasColdStorage: true,
          hasReheatingFacility: true,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 0,
          historicalStats: { acceptedCount: 15, rejectedCount: 0, fulfilledMeals: 350 },
        },
        {
          id: 'REC-E-C',
          name: 'NGO C (Capacity: 25)',
          type: 'Youth Center',
          location: { lat: 40.76, lng: -73.98, name: 'Youth Center C' },
          acceptedCategories: ['Cooked meals'],
          demandQuantity: 25,
          maxReceivingCapacity: 25,
          currentStorageCapacity: 25,
          operatingHours: { open: '08:00', close: '22:00' },
          minAcceptableQuantity: 10,
          maxAcceptableQuantity: 25,
          hasColdStorage: true,
          hasReheatingFacility: true,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 0,
          historicalStats: { acceptedCount: 10, rejectedCount: 0, fulfilledMeals: 250 },
        },
      ],
      vehicles: [
        {
          id: 'VEH-E1',
          name: 'Courier Van E1',
          type: 'Insulated Electric Van',
          capacity: 150,
          currentLoad: 0,
          hasRefrigeration: true,
          speedKmH: 30,
          location: { lat: 40.755, lng: -73.99 },
          status: 'Available',
          costPerKm: 1.0,
        },
      ],
    },
    {
      id: 'SCENARIO-F',
      code: 'F',
      name: 'Bundled Pickups & Route Sharing',
      tagline: 'Nearby bakery and cafe bundled into a single efficient vehicle run',
      description:
        'Two donors located 400 meters apart both have ready surplus. SpoilClock bundles both pickups into a single multi-stop dispatch route without exceeding vehicle capacity or safe deadlines.',
      expectedInsight:
        'Route distance drops by 38% compared to running independent point-to-point dispatches.',
      ...generateSyntheticScenarioData(4, 3, 506, currentTimeIso),
    },
    {
      id: 'SCENARIO-G',
      code: 'G',
      name: 'Mid-Mission Recipient Cancellation (Innovation Core)',
      tagline: 'Assigned recipient cancels 20 mins before pickup; engine reallocates dynamically',
      description:
        'NGO A unexpectedly cancels due to an in-house pipe leak. SpoilClock instantly senses the disruption event, protects already completed deliveries, and re-optimizes the unassigned food to backup NGO B with zero waste.',
      expectedInsight:
        'Demonstrates Section 8 adaptive recalculation live with transparent diff and explanation.',
      ...generateSyntheticScenarioData(3, 4, 607, currentTimeIso),
    },
    {
      id: 'SCENARIO-H',
      code: 'H',
      name: 'Severe Vehicle Delay & Breakdown',
      tagline: 'Primary refrigerated van breaks down mid-route; route re-dispatched to backup EV',
      description:
        'Vehicle breakdown event triggers automatic reallocation of pending cold-chain assignments to an available refrigerated backup before food temperature exceeds safety thresholds.',
      expectedInsight:
        'Prevents cold-chain breach; demonstrates real-time contingency routing and resilience.',
      ...generateSyntheticScenarioData(3, 4, 708, currentTimeIso),
    },
    {
      id: 'SCENARIO-I',
      code: 'I',
      name: 'No Human Feasible Recipient (Circular Recovery Divert)',
      tagline: 'All human recipients at capacity or deadline too tight; food diverted to Animal Feed & Biogas',
      description:
        'Surplus perishable food has only 30 minutes left before regulatory safe-use deadline expires. The nearest recipient is 45 minutes away. Human consumption is strictly blocked.',
      expectedInsight:
        'The safety gate properly rejects human consumption and SpoilClock creates verified circular recovery records (certified Animal Feed and Biogas Anaerobic Digestion) rather than dumping.',
      donations: [
        {
          id: 'DON-SCEN-I1',
          donorName: 'Metro Artisan Bakery',
          donorType: 'Bakery',
          foodCategory: 'Bakery products',
          description: '60 kg unsold artisan sourdough loaves and rolls',
          quantity: 60,
          unit: 'kg',
          preparedAt: new Date(now - 23 * 3600000).toISOString(),
          storageCondition: 'ambient',
          verifiedSafeDeadline: new Date(now + 20 * 60000).toISOString(), // only 20 min safe window left!
          safetyRuleId: 'EU-HYGIENE-BAKERY-24H',
          safetyVerified: true,
          location: { lat: 40.75, lng: -73.98, name: 'Artisan Bakery' },
          pickupReadinessTime: new Date(now).toISOString(),
          specialHandling: [],
          status: 'Available',
          createdAt: new Date(now).toISOString(),
        },
      ],
      recipients: [
        {
          id: 'REC-I1',
          name: 'Distant Community Center (15 km away, 45 min drive)',
          type: 'Food Bank',
          location: { lat: 40.85, lng: -73.9, name: 'Distant Pantry' },
          acceptedCategories: ['Bakery products'],
          demandQuantity: 100,
          maxReceivingCapacity: 100,
          currentStorageCapacity: 100,
          operatingHours: { open: '08:00', close: '20:00' },
          minAcceptableQuantity: 10,
          maxAcceptableQuantity: 100,
          hasColdStorage: false,
          hasReheatingFacility: false,
          transportationCapability: 'Both',
          active: true,
          currentLoad: 0,
          historicalStats: { acceptedCount: 10, rejectedCount: 0, fulfilledMeals: 200 },
        },
      ],
      vehicles: [
        {
          id: 'VEH-I1',
          name: 'Cargo Van',
          type: 'Standard Light Van',
          capacity: 100,
          currentLoad: 0,
          hasRefrigeration: false,
          speedKmH: 25,
          location: { lat: 40.75, lng: -73.98 },
          status: 'Available',
          costPerKm: 1.0,
        },
      ],
    },
    {
      id: 'SCENARIO-J',
      code: 'J',
      name: 'Conflicting Objectives (Route Distance vs Meals Rescued)',
      tagline: 'Trade-off between minimizing transportation carbon/cost vs maximizing rescued meals',
      description:
        'A coordinator faces a trade-off: A nearby recipient can only take 30 meals, while a distant recipient (12 km away) can rescue all 120 meals. Adjusting objective sliders illustrates Pareto frontier shifts.',
      expectedInsight:
        'Shows dynamic response to coordinator objective weights in real time.',
      ...generateSyntheticScenarioData(3, 5, 909, currentTimeIso),
    },
  ];
}

/**
 * Runs all three algorithms on the exact same scenario data and returns comparative benchmark.
 */
export function runAllAlgorithmsBenchmark(
  donations: FoodDonation[],
  recipients: Recipient[],
  vehicles: Vehicle[],
  currentTimeIso: string = new Date().toISOString()
) {
  const planNearest = runNearestFirstBaseline(donations, recipients, vehicles, currentTimeIso);
  const planStaticWindow = runStaticTimeWindowBaseline(donations, recipients, vehicles, currentTimeIso);
  const planSpoilClock = runSpoilClockAdaptiveEngine(donations, recipients, vehicles, undefined, currentTimeIso);

  return {
    nearestFirst: planNearest,
    staticTimeWindow: planStaticWindow,
    spoilClockAdaptive: planSpoilClock,
  };
}
