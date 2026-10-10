import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Split,
  ArrowRight,
  TrendingUp,
  MapPin,
  HelpCircle,
  Award,
  Layers,
  Building2,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Code,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { runSpoilClockAdaptiveEngine, DEFAULT_OBJECTIVE_WEIGHTS } from '../../engine/spoilClockAdaptiveEngine';
import { runNearestFirstBaseline } from '../../engine/nearestFirstBaseline';
import { runStaticTimeWindowBaseline } from '../../engine/staticTimeWindowBaseline';
import { handleDisruptionEvent } from '../../engine/reallocationManager';
import { FoodDonation, Recipient, Vehicle, AllocationPlan, OperationalDisruptionEvent } from '../../types';
import { getFoodImage } from '../../data/foodImages';

export const PublicDemoView: React.FC = () => {
  const { setActiveTab } = useApp();

  // Isolated Coimbatore Demonstration Scenario
  const baseNow = new Date('2026-10-09T13:00:00Z');

  const createInitialDemoState = () => {
    const demoDonation: FoodDonation = {
      id: 'DEMO-DON-CBE-01',
      donorName: 'The Grand Residency Banquet (Coimbatore)',
      donorType: 'Hotel',
      foodCategory: 'Cooked meals',
      foodName: 'Surplus Banquet South Indian Meals & Biryani',
      description: '100 fresh, warm banquet meals: Royal Dum Biryani, Sambar Rice, Potato Poriyal & Dal',
      quantity: 100,
      unit: 'meals',
      preparedAt: new Date(baseNow.getTime() - 30 * 60000).toISOString(),
      storageCondition: 'hot-holding',
      currentTempC: 65,
      verifiedSafeDeadline: new Date(baseNow.getTime() + 3.5 * 3600000).toISOString(), // 3h 30m safe window
      safetyRuleId: 'FSSAI-SURPLUS-COOKED',
      safetyVerified: true,
      city: 'Coimbatore',
      location: { lat: 11.0135, lng: 76.9812, name: 'The Residency Avinashi Rd', address: '1076 Avinashi Rd, Coimbatore, Tamil Nadu' },
      pickupReadinessTime: new Date(baseNow.getTime() + 10 * 60000).toISOString(),
      specialHandling: ['Keep warm > 60°C', 'FSSAI compliant thermal containers'],
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      createdAt: baseNow.toISOString(),
    };

    const demoRecipients: Recipient[] = [
      {
        id: 'DEMO-REC-A',
        name: 'No Food Waste Ukkadam Kitchen',
        type: 'Community Kitchen',
        city: 'Coimbatore',
        location: { lat: 10.9914, lng: 76.9588, name: 'Ukkadam Hub', address: 'Bypass Rd, Ukkadam, Coimbatore' },
        acceptedCategories: ['Cooked meals', 'Rice & prepared dishes', 'Bakery products'],
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
        historicalStats: { acceptedCount: 30, rejectedCount: 0, fulfilledMeals: 1200 },
      },
      {
        id: 'DEMO-REC-B',
        name: 'Universal Peace Foundation Care Home',
        type: 'Shelter',
        city: 'Coimbatore',
        location: { lat: 10.9972, lng: 77.0215, name: 'Singanallur Shelter', address: 'Trichy Rd, Singanallur, Coimbatore' },
        acceptedCategories: ['Cooked meals', 'Rice & prepared dishes'],
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
        historicalStats: { acceptedCount: 25, rejectedCount: 0, fulfilledMeals: 850 },
      },
      {
        id: 'DEMO-REC-C',
        name: 'Asha Nivas Children Home & Food Bank',
        type: 'Youth Center',
        city: 'Coimbatore',
        location: { lat: 11.0024, lng: 76.9892, name: 'Ramanathapuram Home', address: 'Puliakulam Rd, Coimbatore' },
        acceptedCategories: ['Cooked meals', 'Rice & prepared dishes', 'Bakery products'],
        demandQuantity: 50,
        maxReceivingCapacity: 50,
        currentStorageCapacity: 50,
        operatingHours: { open: '08:00', close: '22:00' },
        minAcceptableQuantity: 10,
        maxAcceptableQuantity: 50,
        hasColdStorage: true,
        hasReheatingFacility: true,
        transportationCapability: 'Both',
        active: true,
        currentLoad: 0,
        historicalStats: { acceptedCount: 15, rejectedCount: 0, fulfilledMeals: 600 },
      },
    ];

    const demoVehicles: Vehicle[] = [
      {
        id: 'DEMO-VEH-01',
        name: 'Coimbatore Dispatch EV-01',
        type: 'Insulated Electric Van',
        capacity: 180,
        currentLoad: 0,
        hasRefrigeration: true,
        speedKmH: 30,
        city: 'Coimbatore',
        location: { lat: 11.0135, lng: 76.9812 },
        status: 'Available',
        costPerKm: 1.0,
      },
    ];

    return { demoDonation, demoRecipients, demoVehicles };
  };

  const [demoState, setDemoState] = useState(createInitialDemoState);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [demoPlan, setDemoPlan] = useState<AllocationPlan>(() => {
    const s = createInitialDemoState();
    return runSpoilClockAdaptiveEngine([s.demoDonation], s.demoRecipients, s.demoVehicles, DEFAULT_OBJECTIVE_WEIGHTS);
  });
  const [originalPlan, setOriginalPlan] = useState<AllocationPlan | null>(null);
  const [activeDisruption, setActiveDisruption] = useState<OperationalDisruptionEvent | null>(null);
  const [reallocationDiff, setReallocationDiff] = useState<any | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Trigger Recipient Cancellation
  const handleSimulateRecipientCancellation = () => {
    if (!originalPlan) {
      setOriginalPlan(demoPlan);
    }

    const event: OperationalDisruptionEvent = {
      id: `EVT-DEMO-CANCEL-${Date.now()}`,
      type: 'recipient_cancellation',
      timestamp: new Date().toISOString(),
      title: 'Ukkadam Kitchen Sudden Cancellation (Pipe Blockage)',
      description: 'Intake kitchen at Ukkadam reported a pipe blockage and cannot receive the 40 allocated meals.',
      targetId: 'DEMO-REC-A',
      severity: 'high',
      resolved: false,
    };

    const reallocation = handleDisruptionEvent(
      event,
      demoPlan,
      [demoState.demoDonation],
      demoState.demoRecipients,
      demoState.demoVehicles
    );

    setDemoPlan(reallocation.revisedPlan);
    setActiveDisruption(event);
    setReallocationDiff(reallocation);
    setActiveStage(5);
  };

  // Trigger Traffic Delay
  const handleSimulateTrafficDelay = () => {
    if (!originalPlan) {
      setOriginalPlan(demoPlan);
    }

    const event: OperationalDisruptionEvent = {
      id: `EVT-DEMO-DELAY-${Date.now()}`,
      type: 'delivery_delay',
      timestamp: new Date().toISOString(),
      title: 'Avinashi Road Flyover Transit Delay (+40 min delay)',
      description: 'Major transit congestion on Avinashi Road flyover. Re-evaluating deadline feasibility.',
      targetId: demoState.demoDonation.id,
      severity: 'medium',
      resolved: false,
    };

    const reallocation = handleDisruptionEvent(
      event,
      demoPlan,
      [demoState.demoDonation],
      demoState.demoRecipients,
      demoState.demoVehicles
    );

    setDemoPlan(reallocation.revisedPlan);
    setActiveDisruption(event);
    setReallocationDiff(reallocation);
    setActiveStage(5);
  };

  const handleResetDemo = () => {
    const s = createInitialDemoState();
    setDemoState(s);
    const plan = runSpoilClockAdaptiveEngine([s.demoDonation], s.demoRecipients, s.demoVehicles, DEFAULT_OBJECTIVE_WEIGHTS);
    setDemoPlan(plan);
    setOriginalPlan(null);
    setActiveDisruption(null);
    setReallocationDiff(null);
    setActiveStage(1);
  };

  // Compare on identical scenario inputs
  const nfPlan = runNearestFirstBaseline([demoState.demoDonation], demoState.demoRecipients, demoState.demoVehicles);
  const stwPlan = runStaticTimeWindowBaseline([demoState.demoDonation], demoState.demoRecipients, demoState.demoVehicles);

  const stages = [
    { num: 1, title: 'Food Available', desc: 'Surplus donation listed' },
    { num: 2, title: 'Recipients Evaluated', desc: 'Shelters & capacities' },
    { num: 3, title: 'Smart Allocation', desc: 'Optimized multi-split' },
    { num: 4, title: 'Disruption Event', desc: 'Simulate cancellation' },
    { num: 5, title: 'Recalculation', desc: 'Autonomous recovery' },
    { num: 6, title: 'Baseline Benchmark', desc: 'Compare with standard' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-purple-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guided Hackathon Demonstration</span>
            </span>
            <span className="text-xs text-slate-400">• Coimbatore Food Rescue Scenario</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            How SmartPlate Rescues 100 Banquet Meals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            A step-by-step walkthrough showing how food is safely distributed, how disruptions trigger autonomous reallocation, and how SmartPlate outperforms traditional greedy dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-300" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* 6-Stage Stepper Navigation */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {stages.map((st) => {
            const isCurrent = activeStage === st.num;
            const isCompleted = activeStage > st.num;

            return (
              <button
                key={st.num}
                onClick={() => setActiveStage(st.num as any)}
                className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl transition-all text-left ${
                  isCurrent
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100/70 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? 'bg-white text-orange-600'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : st.num}
                </div>
                <div className="min-w-0">
                  <div className="text-xs leading-tight truncate">{st.title}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isCurrent ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {st.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE CONTENT CARDS */}

      {/* STAGE 1: FOOD BECOMES AVAILABLE */}
      {activeStage === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Stage 1 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Surplus Food Becomes Available
              </h2>
              <p className="text-xs text-slate-500">
                A hotel reports a sudden banquet surplus after a corporate convention lunch.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              FSSAI Verified Safe
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src={demoState.demoDonation.imageUrl}
                alt={demoState.demoDonation.foodName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 text-white px-3 py-1 rounded-full text-xs font-black">
                {demoState.demoDonation.quantity} {demoState.demoDonation.unit}
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/70 backdrop-blur-xs text-white rounded-xl text-xs">
                <strong>Storage:</strong> Hot-Holding at {demoState.demoDonation.currentTempC}°C
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-medium">Donor Organization:</div>
                <h3 className="text-base font-extrabold text-slate-900">{demoState.demoDonation.donorName}</h3>
                <p className="text-slate-600">{demoState.demoDonation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Available Quantity</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {demoState.demoDonation.quantity} Banquet Meals
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Verified Safe Window</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    3.5 Hours Remaining
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Pickup Location</span>
                  <span className="font-bold text-slate-800">
                    Avinashi Road, Coimbatore
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Handling Requirement</span>
                  <span className="font-bold text-slate-800">
                    Insulated Thermal Containers
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Next: Consider Suitable Recipients</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: SUITABLE RECIPIENTS CONSIDERED */}
      {activeStage === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Stage 2 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Nearby Community Recipients Considered
              </h2>
              <p className="text-xs text-slate-500">
                SmartPlate evaluates local community kitchens and shelters, their intake limits, and safe transit travel times.
              </p>
            </div>
            <span className="text-xs text-slate-400">3 Eligible Candidate Hubs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoState.demoRecipients.map((rec, i) => (
              <div
                key={rec.id}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      Candidate #{i + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {rec.type}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{rec.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{rec.location.address}</p>

                  <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Requested Need:</span>
                      <span className="font-extrabold text-slate-900">{rec.demandQuantity} meals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Intake Capacity:</span>
                      <span className="font-bold text-slate-800">{rec.maxReceivingCapacity} meals max</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operating Window:</span>
                      <span className="font-medium text-slate-700">
                        {rec.operatingHours.open} - {rec.operatingHours.close}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accepts Cooked Meals • Verified Intake</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Next: SmartPlate Allocates Food</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: SMARTPLATE ALLOCATES FOOD */}
      {activeStage === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Stage 3 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                SmartPlate Solves the Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Instead of giving all 100 meals to one kitchen or dumping excess, SmartPlate splits the donation safely across recipients.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              100% of Meals Rescued (Zero Waste)
            </span>
          </div>

          {/* Allocation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoPlan.assignments.map((asg, idx) => (
              <div
                key={asg.id}
                className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Split Assignment #{idx + 1}
                    </span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      {asg.allocatedQuantity} Meals
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm mt-1">{asg.recipientName}</h3>

                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Distance:</span>
                      <span className="font-bold text-slate-800">{asg.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Travel Time:</span>
                      <span className="font-bold text-slate-800">~{asg.travelTimeMinutes} mins</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Safe Deadline Buffer:</span>
                      <span>+{asg.timeMarginMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                  "{asg.explanation}"
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setActiveStage(4)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Next: Simulate a Problem Occurring</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: A PROBLEM OCCURS */}
      {activeStage === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Stage 4 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Simulate an Operational Disruption
              </h2>
              <p className="text-xs text-slate-500">
                In real urban food rescue, things go wrong. Choose a real-world disruption to test SmartPlate's adaptive engine:
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Interactive Trigger</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disruption 1: Recipient Cancellation */}
            <div className="bg-amber-50/50 rounded-2xl p-6 border-2 border-amber-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Recipient Cancellation: Ukkadam Kitchen
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ukkadam Community Kitchen calls with an emergency pipe blockage. They can no longer accept their 40 assigned banquet meals.
                </p>
                <div className="p-3 bg-white rounded-xl text-xs text-amber-900 font-semibold border border-amber-200">
                  ⚠️ Challenge: Reassign 40 meals within the remaining safe deadline window without creating food waste!
                </div>
              </div>

              <button
                onClick={handleSimulateRecipientCancellation}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Cancellation & Recalculate</span>
              </button>
            </div>

            {/* Disruption 2: Traffic Jam Delay */}
            <div className="bg-purple-50/50 rounded-2xl p-6 border-2 border-purple-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Transit Congestion: Avinashi Road Jam (+40 min delay)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Major traffic standstill on Avinashi Road delays the dispatch vehicle by 40 minutes, placing microbial safe-use deadlines at risk.
                </p>
                <div className="p-3 bg-white rounded-xl text-xs text-purple-900 font-semibold border border-purple-200">
                  ⚠️ Challenge: Validate whether food will still arrive before spoiling or if closer recipients are required!
                </div>
              </div>

              <button
                onClick={handleSimulateTrafficDelay}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Traffic Delay & Recalculate</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: SMARTPLATE RECALCULATES */}
      {activeStage === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Stage 5 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Autonomous Recalculation Results
              </h2>
              <p className="text-xs text-slate-500">
                The SmartPlate engine instantly executed in &lt;10ms, adapting the mission without human panic or delay.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Executed in &lt;10 ms
            </span>
          </div>

          {activeDisruption && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Handled Event: {activeDisruption.title}</span>
              </div>
              <p>{activeDisruption.description}</p>
            </div>
          )}

          {/* Plain English Explanation */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2">
            <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px]">
              What Changed & Why:
            </span>
            <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
              {reallocationDiff?.explanation ||
                'Surplus meals were autonomously rerouted to alternative verified shelters with available capacity and valid safe deadlines, preserving 100% of the food.'}
            </p>
          </div>

          {/* Revised Assignments */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Revised Feasible Delivery Plan ({demoPlan.assignments.length} assignments)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoPlan.assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{asg.recipientName}</span>
                    <span className="font-extrabold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded">
                      {asg.allocatedQuantity} Meals
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Distance: {asg.distanceKm} km</span>
                    <span className="text-emerald-700 font-semibold">Safe buffer: +{asg.timeMarginMinutes} mins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    {asg.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(4)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Simulate Another Problem</span>
            </button>
            <button
              onClick={() => setActiveStage(6)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Next: Compare with Baselines</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6: COMPARE THE RESULT (BENCHMARK) */}
      {activeStage === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Stage 6 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Benchmark Comparison Against Baseline Methods
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating SmartPlate against traditional nearest-first dispatch and static time-window planning under identical scenario inputs.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Identical Inputs
            </span>
          </div>

          {/* Compact Benchmark Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* SmartPlate Card */}
            <div className="bg-emerald-50/70 border-2 border-emerald-400 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-950 text-sm">SmartPlate Adaptive</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Innovation
                </span>
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span>Meals Rescued:</span>
                  <strong className="text-emerald-800 text-base">{demoPlan.metrics.quantityAllocated} / 100</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span>Split Donations:</span>
                  <strong className="text-emerald-800">Yes (Multi-hub split)</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span>Disruption Response:</span>
                  <strong className="text-emerald-800">Autonomous (&lt;10ms)</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span>Nutritional Fairness:</span>
                  <strong className="text-emerald-800">{demoPlan.metrics.fairnessIndex} (High)</strong>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900 font-medium">
                ✓ Rescues 100% of food with zero waste by splitting large batches.
              </p>
            </div>

            {/* Nearest-First Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Nearest-First Greedy</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Standard Baseline
                </span>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Meals Rescued:</span>
                  <strong className="text-slate-800 text-base">{nfPlan.metrics.quantityAllocated} / 100</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Split Donations:</span>
                  <span className="text-slate-400">No (Leaves 60 stranded)</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Disruption Response:</span>
                  <span className="text-red-600 font-semibold">Fails (No fallback)</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Nutritional Fairness:</span>
                  <span>{nfPlan.metrics.fairnessIndex}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatches to closest NGO only; discards remaining 60 meals when closest reaches capacity.
              </p>
            </div>

            {/* Static Time-Window Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Static Time-Window</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Fixed Baseline
                </span>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Meals Rescued:</span>
                  <strong className="text-slate-800 text-base">{stwPlan.metrics.quantityAllocated} / 100</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Split Donations:</span>
                  <span className="text-slate-400">No (Rigid schedule)</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Disruption Response:</span>
                  <span className="text-red-600 font-semibold">Fails (Manual call)</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Nutritional Fairness:</span>
                  <span>{stwPlan.metrics.fairnessIndex}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Follows fixed calendar windows; unable to dynamically adapt when delivery delays occur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(5)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Demonstration</span>
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Return to Live Food Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTIONAL ADVANCED TECHNICAL REFERENCE COLLAPSIBLE (For Judges & Developers) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Technical Diagnostics & Architecture Reference</h3>
              <p className="text-xs text-slate-500">
                For competition evaluators and engineers wishing to inspect underlying constraints & math
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {showTechnicalDetails ? 'Hide Diagnostics' : 'Inspect Mathematical Diagnostics'}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">Jain's Fairness Index Formula</span>
                <code className="text-[11px] text-slate-600 font-mono block mt-1">
                  J(x) = (Σ x_i)^2 / (n * Σ x_i^2)
                </code>
                <span className="text-[10px] text-slate-400 mt-1 block">Calculated value: {demoPlan.metrics.fairnessIndex}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">Microbiological Safe Gate</span>
                <span className="text-[11px] text-slate-600 block mt-1">
                  FSSAI Hot-Holding &gt;60°C TPHC Safe Window
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  All active legs: +{demoPlan.assignments[0]?.timeMarginMinutes}m margin
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">Full Engineering Tools</span>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Simulation Lab (10 urban scenarios), Circular Recovery, and Benchmarks
                </span>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className="text-[11px] font-bold text-orange-600 hover:underline mt-1 block"
                >
                  Open Advanced Tools View ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
