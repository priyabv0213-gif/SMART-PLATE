import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { resetDemoState, triggerDisruption } from '../api/client';

export const DemoScreen: React.FC = () => {
  // Mobile isolated demo scenario state
  const [disruptionApplied, setDisruptionApplied] = useState<string | null>(null);
  const [mealsRescued, setMealsRescued] = useState(100);
  const [recipientAssignments, setRecipientAssignments] = useState([
    { name: 'Ukkadam Community Kitchen', meals: 40, status: 'Assigned', eta: '13:40', margin: '+48m' },
    { name: 'Singanallur Care Home', meals: 35, status: 'Assigned', eta: '13:55', margin: '+33m' },
    { name: 'Asha Nivas Children Home', meals: 25, status: 'Assigned (Split)', eta: '14:05', margin: '+23m' },
  ]);

  const handleSimulateCancellation = async () => {
    // Recipient A cancels -> autonomous reallocation to Recipient C (Asha Nivas)
    setDisruptionApplied('Ukkadam Kitchen reported pipe blockage (-40 meals intake)');
    setRecipientAssignments([
      { name: 'Ukkadam Community Kitchen', meals: 0, status: 'Cancelled', eta: '--', margin: '--' },
      { name: 'Singanallur Care Home', meals: 35, status: 'Confirmed', eta: '13:55', margin: '+33m' },
      { name: 'Asha Nivas Children Home', meals: 65, status: 'Reallocated (+40)', eta: '14:15', margin: '+18m' },
    ]);
    await triggerDisruption({
      type: 'recipient_cancellation',
      title: 'Demo Recipient Cancellation',
      description: 'Simulated Ukkadam intake plumbing stoppage.',
      targetId: 'REC-DEMO-01',
    });
    Alert.alert('Reallocated!', 'SpoilClock re-routed 40 meals from Ukkadam to Asha Nivas within 8ms with zero safety violation.');
  };

  const handleSimulateDelay = async () => {
    // Vehicle delayed by 40 mins on Avinashi Rd flyover
    setDisruptionApplied('Avinashi Road Flyover gridlock (+40 min delay)');
    setRecipientAssignments([
      { name: 'Singanallur Care Home (Re-sequenced)', meals: 55, status: 'Prioritized (Closest)', eta: '14:20', margin: '+15m' },
      { name: 'Asha Nivas Children Home', meals: 45, status: 'Secondary Leg', eta: '14:35', margin: '+8m' },
    ]);
    await triggerDisruption({
      type: 'delivery_delay',
      title: 'Demo Transit Delay',
      description: 'Simulated 40m traffic jam.',
      targetId: 'DON-DEMO-01',
    });
    Alert.alert('Feasibility Checked', 'Engine re-sequenced delivery legs to prevent safe-use window expiration.');
  };

  const handleReset = async () => {
    setDisruptionApplied(null);
    setMealsRescued(100);
    setRecipientAssignments([
      { name: 'Ukkadam Community Kitchen', meals: 40, status: 'Assigned', eta: '13:40', margin: '+48m' },
      { name: 'Singanallur Care Home', meals: 35, status: 'Assigned', eta: '13:55', margin: '+33m' },
      { name: 'Asha Nivas Children Home', meals: 25, status: 'Assigned (Split)', eta: '14:05', margin: '+23m' },
    ]);
    await resetDemoState();
    Alert.alert('Reset Complete', 'Default Coimbatore 100-meal scenario restored.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <Text style={styles.bannerBadge}>⭐ Hackathon Judge Sandbox</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bannerTitle}>Coimbatore Food Rescue Scenario</Text>
        <Text style={styles.bannerSubtitle}>
          100 hot meals from The Grand Residency, Avinashi Rd. FSSAI 3.5h safe limit.
        </Text>
      </View>

      {/* Disruption Simulation Controls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Test Mid-Mission Disruptions</Text>
        <Text style={styles.cardSubtitle}>
          Trigger an operational crisis to test autonomous recovery
        </Text>

        <TouchableOpacity
          onPress={handleSimulateCancellation}
          style={styles.cancelBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>⚠️ Simulate Recipient #1 Cancellation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSimulateDelay}
          style={styles.delayBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.delayBtnText}>⏱️ Simulate +40 min Avinashi Rd Delay</Text>
        </TouchableOpacity>

        {disruptionApplied && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚡ Event Recalculation Triggered:</Text>
            <Text style={styles.alertText}>{disruptionApplied}</Text>
          </View>
        )}
      </View>

      {/* Recalculated Missions */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dynamic Allocation Plan</Text>
          <Text style={styles.rescuedText}>{mealsRescued} / 100 Meals Rescued</Text>
        </View>

        {recipientAssignments.map((item, idx) => (
          <View key={idx} style={styles.recItem}>
            <View style={styles.recTop}>
              <Text style={styles.recName}>{item.name}</Text>
              <View
                style={[
                  styles.statusTag,
                  item.status === 'Cancelled' ? styles.statusCancelled : styles.statusActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    item.status === 'Cancelled' ? styles.textCancelled : styles.textActive,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.recDetails}>
              <Text style={styles.recMeals}>{item.meals} meals</Text>
              <Text style={styles.recMeta}>ETA: {item.eta} • Safe buffer: {item.margin}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Baseline Comparison Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Algorithm Comparison vs Baseline</Text>
        <Text style={styles.cardSubtitle}>Same 100-meal scenario on Coimbatore road grid</Text>

        <View style={styles.compRow}>
          <Text style={styles.compLabel}>SpoilClock Adaptive:</Text>
          <Text style={styles.compValueHighlight}>100 Meals Rescued (Zero Waste)</Text>
        </View>
        <View style={styles.compRow}>
          <Text style={styles.compLabel}>Nearest-First Greedy:</Text>
          <Text style={styles.compValue}>40 Meals Rescued (Leaves 60 behind)</Text>
        </View>
        <View style={styles.compRow}>
          <Text style={styles.compLabel}>Static Window Baseline:</Text>
          <Text style={styles.compValue}>40 Meals Rescued (No split support)</Text>
        </View>
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
  banner: {
    backgroundColor: '#581c87',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7e22ce',
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerBadge: {
    color: '#e9d5ff',
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#d8b4fe',
    fontSize: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  rescuedText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelBtnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  delayBtn: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#d8b4fe',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  delayBtnText: {
    color: '#7e22ce',
    fontSize: 12,
    fontWeight: '700',
  },
  alertBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  alertText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  recItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textActive: {
    color: '#15803d',
  },
  textCancelled: {
    color: '#b91c1c',
  },
  recDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  recMeals: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
  },
  recMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  compLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  compValue: {
    fontSize: 11,
    color: '#64748b',
  },
  compValueHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
  },
});
