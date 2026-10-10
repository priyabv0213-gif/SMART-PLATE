import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Recipient, FoodDonation, SingleAssignment } from '../types';
import { updateRecipientDemand, completeDelivery, triggerDisruption } from '../api/client';

interface NgoScreenProps {
  recipients: Recipient[];
  donations: FoodDonation[];
  assignments: SingleAssignment[];
  onRefresh: () => void;
}

export const NgoScreen: React.FC<NgoScreenProps> = ({
  recipients,
  donations,
  assignments,
  onRefresh,
}) => {
  const currentNgo = recipients[0] || {
    id: 'REC-CBE-001',
    name: 'No Food Waste Ukkadam Kitchen',
    demandQuantity: 50,
    maxReceivingCapacity: 60,
    location: { name: 'Ukkadam Hub, Coimbatore' },
  };

  const [demand, setDemand] = useState(currentNgo.demandQuantity.toString());
  const [updatingDemand, setUpdatingDemand] = useState(false);

  // Incoming proposals for this recipient
  const myAssignments = assignments.filter(
    (a) => a.recipientId === currentNgo.id || a.recipientName.includes('No Food Waste')
  );

  const handleSaveDemand = async () => {
    const val = parseInt(demand, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid Demand', 'Please enter a valid numeric meal demand.');
      return;
    }
    setUpdatingDemand(true);
    await updateRecipientDemand(currentNgo.id, val);
    setUpdatingDemand(false);
    Alert.alert('Updated', `Demand updated to ${val} meals. The SpoilClock engine will balance distribution.`);
    onRefresh();
  };

  const handleConfirmReceived = async (assignmentId: string, quantity: number) => {
    await completeDelivery(assignmentId);
    Alert.alert('Delivery Confirmed', `Successfully logged receipt of ${quantity} meals.`);
    onRefresh();
  };

  const handleReportCancellation = async (assignmentId: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you cannot receive this allocation? The SpoilClock engine will immediately reallocate these meals to a standby shelter.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Cancellation',
          style: 'destructive',
          onPress: async () => {
            await triggerDisruption({
              type: 'recipient_cancellation',
              title: `${currentNgo.name} Intake Closure`,
              description: 'Intake facility unable to receive scheduled allocation.',
              targetId: currentNgo.id,
              severity: 'high',
            });
            Alert.alert('Disruption Reported', 'Engine triggered adaptive reallocation.');
            onRefresh();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* NGO Hub Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>NGO Organization Profile</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified Recipient</Text>
          </View>
        </View>
        <Text style={styles.ngoName}>{currentNgo.name}</Text>
        <Text style={styles.metaText}>📍 {currentNgo.location?.name || 'Coimbatore'}</Text>
        <Text style={styles.metaText}>📦 Intake Capacity: {currentNgo.maxReceivingCapacity} meals max</Text>

        <View style={styles.demandSection}>
          <Text style={styles.label}>Today's Requested Meal Demand</Text>
          <View style={styles.demandRow}>
            <TextInput
              style={styles.input}
              value={demand}
              onChangeText={setDemand}
              keyboardType="numeric"
              placeholder="e.g. 50"
            />
            <TouchableOpacity
              onPress={handleSaveDemand}
              disabled={updatingDemand}
              style={[styles.saveButton, updatingDemand && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>{updatingDemand ? 'Saving...' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Allocation Proposals & Active Deliveries */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Allocated Food Deliveries ({myAssignments.length})</Text>
        <Text style={styles.cardSubtitle}>
          Decay-monitored surplus matched to your shelter
        </Text>

        {myAssignments.map((asg) => (
          <View key={asg.id} style={styles.proposalItem}>
            <View style={styles.proposalTop}>
              <Text style={styles.donorName}>{asg.donorName}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{asg.status || 'Assigned'}</Text>
              </View>
            </View>

            <Text style={styles.quantityText}>
              🍽️ {asg.allocatedQuantity} meals ({asg.foodCategory})
            </Text>

            <View style={styles.routeBox}>
              <Text style={styles.routeText}>📍 Distance: {asg.distanceKm} km (~{asg.travelTimeMinutes} mins transit)</Text>
              <Text style={styles.routeText}>⏱️ Safe Arrival Buffer: +{asg.timeMarginMinutes} mins</Text>
              <Text style={styles.explanationText}>💡 {asg.explanation}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleConfirmReceived(asg.id, asg.allocatedQuantity)}
                style={styles.confirmButton}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>✓ Confirm Received</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleReportCancellation(asg.id)}
                style={styles.cancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>✕ Cannot Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {myAssignments.length === 0 && (
          <Text style={styles.emptyText}>No pending allocations for this NGO right now.</Text>
        )}
      </View>

      {/* Available Surplus in Coimbatore */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nearby Available Surplus in CBE ({donations.length})</Text>
        <Text style={styles.cardSubtitle}>Verified safe batches in Coimbatore</Text>

        {donations.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.availableItem}>
            <View style={styles.availableTop}>
              <Text style={styles.availableDonor}>{item.donorName}</Text>
              <Text style={styles.availableQty}>{item.quantity} meals</Text>
            </View>
            <Text style={styles.availableDesc}>{item.description}</Text>
            <Text style={styles.availableDeadline}>
              ⏳ Safe until: {new Date(item.verifiedSafeDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  verifiedText: {
    color: '#2563eb',
    fontSize: 10,
    fontWeight: '700',
  },
  ngoName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  demandSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  demandRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  proposalItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  proposalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#1d4ed8',
    fontSize: 10,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 4,
  },
  routeBox: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 3,
  },
  routeText: {
    fontSize: 11,
    color: '#475569',
  },
  explanationText: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
  availableItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  availableTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableDonor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  availableQty: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  availableDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  availableDeadline: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});
