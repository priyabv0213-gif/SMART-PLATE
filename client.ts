import { FoodDonation, Recipient, AllocationPlan, OperationalDisruptionEvent } from '../types';

// Default to live HTTPS production URL
export const DEFAULT_API_BASE = 'https://8c46269eb313ff95-106-192-71-88.serveousercontent.com';

let currentApiBase = DEFAULT_API_BASE;

export function setApiBaseUrl(url: string) {
  currentApiBase = url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return currentApiBase;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${currentApiBase}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getDonations(): Promise<FoodDonation[]> {
  try {
    const res = await fetch(`${currentApiBase}/api/donations`);
    if (!res.ok) throw new Error('Failed to fetch donations');
    return await res.json();
  } catch (err) {
    console.warn('[Mobile API] Using offline fallback for donations');
    return getOfflineDonations();
  }
}

export async function submitDonation(donation: Partial<FoodDonation>): Promise<FoodDonation> {
  const payload = {
    ...donation,
    id: `DON-MOB-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    status: 'Available',
    safetyVerified: true,
  };

  try {
    const res = await fetch(`${currentApiBase}/api/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Mobile API] Network error, queued locally');
  }

  return payload as FoodDonation;
}

export async function getRecipients(): Promise<Recipient[]> {
  try {
    const res = await fetch(`${currentApiBase}/api/recipients`);
    if (!res.ok) throw new Error('Failed to fetch recipients');
    return await res.json();
  } catch (err) {
    console.warn('[Mobile API] Using offline fallback for recipients');
    return getOfflineRecipients();
  }
}

export async function updateRecipientDemand(id: string, demandQuantity: number): Promise<boolean> {
  try {
    const res = await fetch(`${currentApiBase}/api/recipients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demandQuantity }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function triggerDisruption(event: Partial<OperationalDisruptionEvent>): Promise<any> {
  try {
    const res = await fetch(`${currentApiBase}/api/disrupt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[Mobile API] Disruption simulation failed over network:', e);
  }
  return null;
}

export async function triggerAllocationRun(algorithm = 'spoilclock-adaptive'): Promise<AllocationPlan | null> {
  try {
    const res = await fetch(`${currentApiBase}/api/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[Mobile API] Allocation run failed over network:', e);
  }
  return null;
}

export async function completeDelivery(assignmentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${currentApiBase}/api/deliveries/${assignmentId}/complete`, {
      method: 'POST',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetDemoState(): Promise<boolean> {
  try {
    const res = await fetch(`${currentApiBase}/api/demo/reset`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

// Offline fallback dataset for Coimbatore
function getOfflineDonations(): FoodDonation[] {
  const now = new Date();
  return [
    {
      id: 'DON-CBE-001',
      donorName: 'Annapoorna Gowrishankar',
      donorType: 'Restaurant',
      foodCategory: 'Cooked meals',
      description: 'Surplus South Indian lunch buffet trays (Meals, Sambar & Kootu)',
      quantity: 85,
      unit: 'meals',
      preparedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      storageCondition: 'hot-holding',
      currentTempC: 66,
      verifiedSafeDeadline: new Date(now.getTime() + 3.25 * 3600000).toISOString(),
      safetyRuleId: 'FSSAI-SURPLUS-COOKED',
      safetyVerified: true,
      location: { lat: 11.0062, lng: 76.9535, name: 'RS Puram Branch', address: 'Diwan Bahadur Rd, RS Puram, Coimbatore' },
      pickupReadinessTime: new Date(now.getTime() + 10 * 60000).toISOString(),
      specialHandling: ['Keep warm > 60°C'],
      status: 'Available',
      createdAt: now.toISOString(),
    },
    {
      id: 'DON-CBE-002',
      donorName: 'The Residency Towers',
      donorType: 'Hotel',
      foodCategory: 'Cooked meals',
      description: 'Surplus banquet dinner meals (Rice, Paneer Butter Masala, Roti)',
      quantity: 120,
      unit: 'meals',
      preparedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
      storageCondition: 'hot-holding',
      currentTempC: 68,
      verifiedSafeDeadline: new Date(now.getTime() + 3.8 * 3600000).toISOString(),
      safetyRuleId: 'FSSAI-SURPLUS-COOKED',
      safetyVerified: true,
      location: { lat: 11.0135, lng: 76.9812, name: 'Avinashi Road', address: '1076 Avinashi Rd, Coimbatore' },
      pickupReadinessTime: new Date(now.getTime() + 15 * 60000).toISOString(),
      specialHandling: ['Thermal container required'],
      status: 'Available',
      createdAt: now.toISOString(),
    },
  ];
}

function getOfflineRecipients(): Recipient[] {
  return [
    {
      id: 'REC-CBE-001',
      name: 'No Food Waste Community Kitchen',
      type: 'Community Kitchen',
      location: { lat: 10.9914, lng: 76.9588, name: 'Ukkadam Hub', address: 'Bypass Rd, Ukkadam, Coimbatore' },
      acceptedCategories: ['Cooked meals', 'Rice & prepared dishes', 'Bakery products'],
      demandQuantity: 50,
      maxReceivingCapacity: 60,
      currentStorageCapacity: 60,
      operatingHours: { open: '08:00', close: '22:00' },
      minAcceptableQuantity: 10,
      maxAcceptableQuantity: 60,
      hasColdStorage: true,
      hasReheatingFacility: true,
      transportationCapability: 'Both',
      active: true,
      currentLoad: 0,
      historicalStats: { acceptedCount: 42, rejectedCount: 0, fulfilledMeals: 1850 },
    },
    {
      id: 'REC-CBE-002',
      name: 'Universal Peace Foundation Care Home',
      type: 'Shelter',
      location: { lat: 10.9972, lng: 77.0215, name: 'Singanallur Shelter', address: 'Trichy Rd, Singanallur, Coimbatore' },
      acceptedCategories: ['Cooked meals', 'Rice & prepared dishes'],
      demandQuantity: 40,
      maxReceivingCapacity: 45,
      currentStorageCapacity: 45,
      operatingHours: { open: '08:00', close: '22:00' },
      minAcceptableQuantity: 10,
      maxAcceptableQuantity: 45,
      hasColdStorage: true,
      hasReheatingFacility: true,
      transportationCapability: 'Both',
      active: true,
      currentLoad: 0,
      historicalStats: { acceptedCount: 28, rejectedCount: 1, fulfilledMeals: 1100 },
    },
  ];
}
