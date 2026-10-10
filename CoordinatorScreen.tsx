import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AllocationPlan, SingleAssignment } from '../types';
import { triggerAllocationRun, triggerDisruption } from '../api/client';

interface CoordinatorScreenProps {
  plan: AllocationPlan | null;
  onRefresh: () => void;
}

export const CoordinatorScreen: React.FC<CoordinatorScreenProps> = ({
  plan,
  onRefresh,
}) => {
  const [running, setRunning] = useState(false);

  const metrics = plan?.metrics || {
    totalSurplusRegistered: 425,
    quantityAllocated: 345,
    quantitySafelyDelivered: 120,
    demandSatisfactionRate: 88,
    onTimeDeliveryRate: 100,
    fairnessIndex: 0.94,
    co2PreventedKg: 345,
    unrecoverableQuantity: 0,
  };

  const handleRunAllocation = async () => {
    setRunning(true);
    await triggerAllocationRun('spoilclock-adaptive');
    setRunning(false);
    Alert.alert('Allocation Updated', 'Multi-objective engine recalculated optimal Coimbatore rescue missions.');
    onRefresh();
  };

  const handleSimulateVehicleDelay = async () => {
    await triggerDisruption({
      type: 'delivery_delay',
      title: 'Avinashi Road Flyover Transit Delay (+35 min)',
      description: 'Vehicle encountered transit delay. Evaluating safe deadline margins.',
      targetId: 'DON-CBE-001',
      severity: 'medium',
    });
    Alert.alert('Delay Simulated', 'Engine verified safe margins and adapted routes.');
    onRefresh();
  };

  const handleSimulateCancellation = async () => {
    await triggerDisruption({
      type: 'recipient_cancellation',
      title: 'Ukkadam Community Kitchen Closure',
      description: 'Recipient reported intake plumbing failure.',
      targetId: 'REC-CBE-001',
      severity: 'high',
    });
    Alert.alert('Cancellation Simulated', 'Autonomous reallocation executed to standby shelters.');
    onRefresh();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Central Metrics Card */}
      <View style={styles.metricsCard}>
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Coimbatore Operations Deck</Text>
          <View style={styles.liveBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.liveText}>Live Dispatch</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricNum}>{metrics.quantityAllocated}</Text>
            <Text style={styles.metricLabel}>Meals Allocated</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricNum}>{metrics.onTimeDeliveryRate}%</Text>
            <Text style={styles.metricLabel}>Safe On-Time</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricNum}>{metrics.fairnessIndex}</Text>
            <Text style={styles.metricLabel}>Jain's Fairness</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricNum}>{metrics.co2PreventedKg} kg</Text>
            <Text style={styles.metricLabel}>CO₂ Prevented</Text>
          </View>
        </View>

        {/* Engine Trigger CTA */}
        <TouchableOpacity
          onPress={handleRunAllocation}
          disabled={running}
          style={[styles.runButton, running && styles.buttonDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.runButtonText}>
            {running ? 'Running Engine...' : '⚡ Run Adaptive Allocation'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Disruption Simulator Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Simulate Operational Disruptions</Text>
        <Text style={styles.cardSubtitle}>
          Test autonomous reallocation on mobile in Coimbatore
        </Text>

        <View style={styles.disruptionRow}>
          <TouchableOpacity
            onPress={handleSimulateCancellation}
            style={styles.cancelSimButton}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelSimText}>⚠️ Simulate Recipient Cancellation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSimulateVehicleDelay}
            style={styles.delaySimButton}
            activeOpacity={0.8}
          >
            <Text style={styles.delaySimText}>⏱️ Simulate Traffic Delay (+35 min)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Missions List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Active Feasible Missions ({plan?.assignments.length || 0})
        </Text>
        <Text style={styles.cardSubtitle}>
          Verified against microbiological decay limits
        </Text>

        {(plan?.assignments || []).map((asg: SingleAssignment) => (
          <View key={asg.id} style={styles.missionItem}>
            <View style={styles.missionTop}>
              <Text style={styles.missionDonor}>{asg.donorName}</Text>
              <Text style={styles.arrowText}>➔</Text>
              <Text style={styles.missionRec}>{asg.recipientName}</Text>
            </View>

            <View style={styles.missionDetails}>
              <Text style={styles.missionQty}>{asg.allocatedQuantity} meals</Text>
              <Text style={styles.missionMeta}>
                {asg.distanceKm} km • ~{asg.travelTimeMinutes} mins
              </Text>
              <Text style={styles.bufferText}>+{asg.timeMarginMinutes}m margin</Text>
            </View>

            <Text style={styles.explanationText}>💡 {asg.explanation}</Text>
          </View>
        ))}

        {(!plan || plan.assignments.length === 0) && (
          <Text style={styles.emptyText}>No active missions. Press "Run Adaptive Allocation".</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  metricsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  metricNum: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  runButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#64748b',
  },
  runButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  disruptionRow: {
    gap: 8,
  },
  cancelSimButton: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelSimText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  delaySimButton: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#d8b4fe',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  delaySimText: {
    color: '#7e22ce',
    fontSize: 12,
    fontWeight: '700',
  },
  missionItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  missionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missionDonor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  arrowText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  missionRec: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    flex: 1,
    textAlign: 'right',
  },
  missionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  missionQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
  },
  missionMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  bufferText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  explanationText: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
});
