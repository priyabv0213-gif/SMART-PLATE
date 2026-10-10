import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FoodDonation,
  Recipient,
  Vehicle,
  AllocationPlan,
  AllocationObjectiveWeights,
  OperationalDisruptionEvent,
  RecoveryRecord,
  PlannedRoute,
} from '../types';
import {
  INITIAL_DONATIONS,
  INITIAL_RECIPIENTS,
  INITIAL_VEHICLES,
  INITIAL_EVENTS,
  INITIAL_RECOVERY_RECORDS,
} from '../data/mockData';
import { runSpoilClockAdaptiveEngine, DEFAULT_OBJECTIVE_WEIGHTS } from '../engine/spoilClockAdaptiveEngine';
import { runNearestFirstBaseline } from '../engine/nearestFirstBaseline';
import { runStaticTimeWindowBaseline } from '../engine/staticTimeWindowBaseline';
import { handleDisruptionEvent } from '../engine/reallocationManager';
import { generatePlannedRoutes } from '../engine/routePlanner';
import { getPredefinedScenarios } from '../engine/simulationScenarios';
import { createRecoveryRecord } from '../engine/recoveryEvaluator';

export type NavigationTab =
  | 'home'
  | 'explore'
  | 'donate'
  | 'request'
  | 'activity'
  | 'map'
  | 'impact'
  | 'matching'
  | 'operations'
  | 'demo'
  | 'advanced'
  // Backward compatibility aliases
  | 'available'
  | 'allocation'
  | 'routes'
  | 'comparison'
  | 'simulation'
  | 'recovery'
  | 'analytics'
  | 'settings';

export type UserRole = 'donor' | 'ngo' | 'coordinator' | 'judge_demo';

export interface UserProfile {
  username: string;
  role: UserRole;
  name: string;
  organization: string;
}

interface AppContextType {
  donations: FoodDonation[];
  recipients: Recipient[];
  vehicles: Vehicle[];
  currentPlan: AllocationPlan | null;
  comparisonPlans: {
    spoilClock: AllocationPlan | null;
    nearestFirst: AllocationPlan | null;
    staticTimeWindow: AllocationPlan | null;
  };
  plannedRoutes: PlannedRoute[];
  recoveryRecords: RecoveryRecord[];
  events: OperationalDisruptionEvent[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  objectiveWeights: AllocationObjectiveWeights;
  setObjectiveWeights: React.Dispatch<React.SetStateAction<AllocationObjectiveWeights>>;
  selectedAlgorithm: 'spoilclock-adaptive' | 'nearest-first' | 'static-time-window';
  setSelectedAlgorithm: (algo: 'spoilclock-adaptive' | 'nearest-first' | 'static-time-window') => void;
  isSimulatedMode: boolean;
  setIsSimulatedMode: (val: boolean) => void;
  lastRunTimestamp: string | null;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  isOnline: boolean;

  // Actions
  addDonation: (donation: Omit<FoodDonation, 'id' | 'createdAt'>) => void;
  updateDonation: (donation: FoodDonation) => void;
  cancelDonation: (donationId: string) => void;
  addRecipient: (recipient: Omit<Recipient, 'id' | 'currentLoad' | 'historicalStats'>) => void;
  updateRecipient: (recipient: Recipient) => void;
  toggleRecipientActive: (recipientId: string) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  executeAllocationRun: (algo?: 'spoilclock-adaptive' | 'nearest-first' | 'static-time-window') => AllocationPlan;
  executeAllAlgorithmsComparison: () => void;
  triggerDisruption: (event: Omit<OperationalDisruptionEvent, 'id' | 'timestamp' | 'resolved'>) => void;
  loadSimulationScenario: (scenarioCode: string) => void;
  markDeliveryCompleted: (assignmentId: string) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'spoilclock_cbe_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donations, setDonations] = useState<FoodDonation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}donations`);
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recipients`);
    return saved ? JSON.parse(saved) : INITIAL_RECIPIENTS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}vehicles`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [recoveryRecords, setRecoveryRecords] = useState<RecoveryRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recovery`);
    return saved ? JSON.parse(saved) : INITIAL_RECOVERY_RECORDS;
  });

  const [events, setEvents] = useState<OperationalDisruptionEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const getTabFromLocation = (): NavigationTab => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const query = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();

    const target = (query || path || hash) as NavigationTab;
    const validTabs: NavigationTab[] = [
      'home', 'explore', 'donate', 'request', 'activity', 'map', 'impact',
      'matching', 'operations', 'demo', 'advanced',
      'available', 'allocation', 'routes', 'comparison', 'simulation', 'recovery',
      'analytics', 'settings'
    ];
    if (validTabs.includes(target)) {
      return target;
    }
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<NavigationTab>(getTabFromLocation);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const newPath = tab === 'home' ? '/' : `/${tab}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromLocation());
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'spoilclock-adaptive' | 'nearest-first' | 'static-time-window'>('spoilclock-adaptive');
  const [objectiveWeights, setObjectiveWeights] = useState<AllocationObjectiveWeights>(DEFAULT_OBJECTIVE_WEIGHTS);
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>('Coimbatore, Tamil Nadu');

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    username: 'judge_demo',
    role: 'judge_demo',
    name: 'Hackathon Evaluation Judge',
    organization: 'Innovation Review Committee',
  });

  const [currentPlan, setCurrentPlan] = useState<AllocationPlan | null>(null);
  const [comparisonPlans, setComparisonPlans] = useState<{
    spoilClock: AllocationPlan | null;
    nearestFirst: AllocationPlan | null;
    staticTimeWindow: AllocationPlan | null;
  }>({ spoilClock: null, nearestFirst: null, staticTimeWindow: null });

  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>([]);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}donations`, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}recipients`, JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}recovery`, JSON.stringify(recoveryRecords));
  }, [recoveryRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}events`, JSON.stringify(events));
  }, [events]);

  // Try fetching live database state from shared backend if available
  useEffect(() => {
    fetch('/api/donations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setDonations(data);
        }
      })
      .catch(() => {
        // Fallback to local state seamlessly
      });

    fetch('/api/recipients')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setRecipients(data);
        }
      })
      .catch(() => {});
  }, []);

  // Initial allocation run on mount
  useEffect(() => {
    executeAllocationRun('spoilclock-adaptive');
  }, []);

  const switchUserRole = (role: UserRole) => {
    const profiles: Record<UserRole, UserProfile> = {
      judge_demo: {
        username: 'judge_demo',
        role: 'judge_demo',
        name: 'Evaluation Judge',
        organization: 'Innovation Review Committee',
      },
      donor: {
        username: 'annapoorna_donor',
        role: 'donor',
        name: 'Annapoorna Kitchen Manager',
        organization: 'Annapoorna Gowrishankar RS Puram',
      },
      ngo: {
        username: 'nofoodwaste_lead',
        role: 'ngo',
        name: 'No Food Waste Volunteer Lead',
        organization: 'No Food Waste Coimbatore Hub',
      },
      coordinator: {
        username: 'spoilclock_coordinator',
        role: 'coordinator',
        name: 'City Operations Coordinator',
        organization: 'SmartPlate Central Dispatch',
      },
    };
    setCurrentUser(profiles[role]);
  };

  const executeAllocationRun = (
    algo: 'spoilclock-adaptive' | 'nearest-first' | 'static-time-window' = selectedAlgorithm
  ): AllocationPlan => {
    let plan: AllocationPlan;

    if (algo === 'nearest-first') {
      plan = runNearestFirstBaseline(donations, recipients, vehicles);
    } else if (algo === 'static-time-window') {
      plan = runStaticTimeWindowBaseline(donations, recipients, vehicles);
    } else {
      plan = runSpoilClockAdaptiveEngine(donations, recipients, vehicles, objectiveWeights);
    }

    setCurrentPlan(plan);
    setLastRunTimestamp(new Date().toISOString());

    // Generate routes for active assignments
    const routes = generatePlannedRoutes(plan.assignments, vehicles, donations, recipients);
    setPlannedRoutes(routes);

    // Sync to backend if online
    fetch('/api/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: algo, weights: objectiveWeights }),
    }).catch(() => {});

    // Update unallocated items to recovery if applicable
    if (plan.unallocated.length > 0) {
      const newRecs: RecoveryRecord[] = [];
      plan.unallocated.forEach((u) => {
        const don = donations.find((d) => d.id === u.donationId);
        if (don) {
          const rec = createRecoveryRecord(don, u.reason, u.remainingQuantity);
          newRecs.push(rec);
        }
      });
      setRecoveryRecords((prev) => {
        const existingDonationIds = new Set(prev.map((r) => r.donationId));
        const filtered = newRecs.filter((r) => !existingDonationIds.has(r.donationId));
        return [...prev, ...filtered];
      });
    }

    return plan;
  };

  const executeAllAlgorithmsComparison = () => {
    const scPlan = runSpoilClockAdaptiveEngine(donations, recipients, vehicles, objectiveWeights);
    const nfPlan = runNearestFirstBaseline(donations, recipients, vehicles);
    const stwPlan = runStaticTimeWindowBaseline(donations, recipients, vehicles);

    setComparisonPlans({
      spoilClock: scPlan,
      nearestFirst: nfPlan,
      staticTimeWindow: stwPlan,
    });
  };

  const addDonation = (donationData: Omit<FoodDonation, 'id' | 'createdAt'>) => {
    const newDonation: FoodDonation = {
      ...donationData,
      id: `DON-CBE-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setDonations((prev) => [newDonation, ...prev]);

    // Sync to backend
    fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDonation),
    }).catch(() => {});
  };

  const updateDonation = (donation: FoodDonation) => {
    setDonations((prev) => prev.map((d) => (d.id === donation.id ? donation : d)));
    fetch(`/api/donations/${donation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
    }).catch(() => {});
  };

  const cancelDonation = (donationId: string) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === donationId ? { ...d, status: 'Rejected' as const } : d))
    );
    fetch(`/api/donations/${donationId}`, { method: 'DELETE' }).catch(() => {});
  };

  const addRecipient = (recipientData: Omit<Recipient, 'id' | 'currentLoad' | 'historicalStats'>) => {
    const newRec: Recipient = {
      ...recipientData,
      id: `REC-CBE-${Date.now().toString().slice(-4)}`,
      currentLoad: 0,
      historicalStats: { acceptedCount: 0, rejectedCount: 0, fulfilledMeals: 0 },
    };
    setRecipients((prev) => [newRec, ...prev]);
    fetch('/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRec),
    }).catch(() => {});
  };

  const updateRecipient = (recipient: Recipient) => {
    setRecipients((prev) => prev.map((r) => (r.id === recipient.id ? recipient : r)));
    fetch(`/api/recipients/${recipient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipient),
    }).catch(() => {});
  };

  const toggleRecipientActive = (recipientId: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === recipientId ? { ...r, active: !r.active } : r))
    );
    fetch(`/api/recipients/${recipientId}/toggle`, { method: 'PUT' }).catch(() => {});
  };

  const updateVehicleStatus = (vehicleId: string, status: Vehicle['status']) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status } : v)));
  };

  const triggerDisruption = (eventData: Omit<OperationalDisruptionEvent, 'id' | 'timestamp' | 'resolved'>) => {
    const event: OperationalDisruptionEvent = {
      ...eventData,
      id: `EVT-CBE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    if (currentPlan) {
      const reallocation = handleDisruptionEvent(
        event,
        currentPlan,
        donations,
        recipients,
        vehicles
      );

      setCurrentPlan(reallocation.revisedPlan);
      const routes = generatePlannedRoutes(reallocation.revisedPlan.assignments, vehicles, donations, recipients);
      setPlannedRoutes(routes);
    }

    setEvents((prev) => [event, ...prev]);

    // Send to backend
    fetch('/api/disrupt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch(() => {});
  };

  const markDeliveryCompleted = (assignmentId: string) => {
    if (!currentPlan) return;
    const updatedAssignments = currentPlan.assignments.map((a) =>
      a.id === assignmentId ? { ...a, status: 'Delivered' as const } : a
    );
    setCurrentPlan({
      ...currentPlan,
      assignments: updatedAssignments,
      metrics: {
        ...currentPlan.metrics,
        quantitySafelyDelivered: updatedAssignments
          .filter((a) => a.status === 'Delivered')
          .reduce((sum, a) => sum + a.allocatedQuantity, 0),
      },
    });

    fetch(`/api/deliveries/${assignmentId}/complete`, { method: 'POST' }).catch(() => {});
  };

  const loadSimulationScenario = (scenarioCode: string) => {
    const scenarios = getPredefinedScenarios();
    const target = scenarios.find((s) => s.code === scenarioCode);
    if (!target) return;

    setDonations(target.donations);
    setRecipients(target.recipients);
    setVehicles(target.vehicles);

    const plan = runSpoilClockAdaptiveEngine(target.donations, target.recipients, target.vehicles, objectiveWeights);
    setCurrentPlan(plan);
    const routes = generatePlannedRoutes(plan.assignments, target.vehicles, target.donations, target.recipients);
    setPlannedRoutes(routes);

    const scPlan = plan;
    const nfPlan = runNearestFirstBaseline(target.donations, target.recipients, target.vehicles);
    const stwPlan = runStaticTimeWindowBaseline(target.donations, target.recipients, target.vehicles);
    setComparisonPlans({
      spoilClock: scPlan,
      nearestFirst: nfPlan,
      staticTimeWindow: stwPlan,
    });
  };

  const resetToDemoData = () => {
    setDonations(INITIAL_DONATIONS);
    setRecipients(INITIAL_RECIPIENTS);
    setVehicles(INITIAL_VEHICLES);
    setEvents(INITIAL_EVENTS);
    setRecoveryRecords(INITIAL_RECOVERY_RECORDS);
    setObjectiveWeights(DEFAULT_OBJECTIVE_WEIGHTS);
    setSelectedAlgorithm('spoilclock-adaptive');

    const plan = runSpoilClockAdaptiveEngine(INITIAL_DONATIONS, INITIAL_RECIPIENTS, INITIAL_VEHICLES, DEFAULT_OBJECTIVE_WEIGHTS);
    setCurrentPlan(plan);
    const routes = generatePlannedRoutes(plan.assignments, INITIAL_VEHICLES, INITIAL_DONATIONS, INITIAL_RECIPIENTS);
    setPlannedRoutes(routes);
    executeAllAlgorithmsComparison();

    fetch('/api/demo/reset', { method: 'POST' }).catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        donations,
        recipients,
        vehicles,
        currentPlan,
        comparisonPlans,
        plannedRoutes,
        recoveryRecords,
        events,
        activeTab,
        setActiveTab,
        objectiveWeights,
        setObjectiveWeights,
        selectedAlgorithm,
        setSelectedAlgorithm,
        isSimulatedMode,
        setIsSimulatedMode,
        lastRunTimestamp,
        selectedCity,
        setSelectedCity,
        currentUser,
        switchUserRole,
        isOnline,
        addDonation,
        updateDonation,
        cancelDonation,
        addRecipient,
        updateRecipient,
        toggleRecipientActive,
        updateVehicleStatus,
        executeAllocationRun,
        executeAllAlgorithmsComparison,
        triggerDisruption,
        loadSimulationScenario,
        markDeliveryCompleted,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
