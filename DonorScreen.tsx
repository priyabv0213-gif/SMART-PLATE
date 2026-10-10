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
import { FoodDonation, FoodCategory, StorageCondition } from '../types';
import { submitDonation } from '../api/client';

interface DonorScreenProps {
  donations: FoodDonation[];
  onRefresh: () => void;
}

export const DonorScreen: React.FC<DonorScreenProps> = ({ donations, onRefresh }) => {
  // Donor Profile
  const [donorProfile, setDonorProfile] = useState({
    name: 'Annapoorna Gowrishankar',
    branch: 'RS Puram, Coimbatore',
    contact: '+91 94432 10890',
    fssaiLicense: '12418003000421',
  });

  // Food batch registration form state
  const [foodName, setFoodName] = useState('Surplus Dinner Meals (Veg Biryani & Sambar)');
  const [category, setCategory] = useState<FoodCategory>('Cooked meals');
  const [quantity, setQuantity] = useState('60');
  const [storage, setStorage] = useState<StorageCondition>('hot-holding');
  const [safeHours, setSafeHours] = useState('3.5');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const myDonations = donations.filter(
    (d) => d.donorName.includes('Annapoorna') || d.id.startsWith('DON-MOB')
  );

  const handleRegisterBatch = async () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid meal quantity.');
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const deadlineHours = parseFloat(safeHours) || 3.5;
    const deadline = new Date(now.getTime() + deadlineHours * 3600000);

    const newDonation: Partial<FoodDonation> = {
      donorName: donorProfile.name,
      donorType: 'Restaurant',
      foodCategory: category,
      description: foodName,
      quantity: qty,
      unit: 'meals',
      preparedAt: now.toISOString(),
      storageCondition: storage,
      currentTempC: storage === 'hot-holding' ? 68 : 4,
      verifiedSafeDeadline: deadline.toISOString(),
      safetyRuleId: 'FSSAI-SURPLUS-COOKED',
      safetyVerified: true,
      location: {
        lat: 11.0062,
        lng: 76.9535,
        name: donorProfile.branch,
        address: 'Diwan Bahadur Rd, RS Puram, Coimbatore',
      },
      pickupReadinessTime: new Date(now.getTime() + 10 * 60000).toISOString(),
      specialHandling: [
        storage === 'hot-holding' ? 'Keep warm > 60°C' : 'Maintain cold chain < 5°C',
        'FSSAI insulated container',
      ],
      imageUrl: hasPhoto ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' : undefined,
    };

    await submitDonation(newDonation);
    setSubmitting(false);
    Alert.alert('Success', `Registered ${qty} surplus meals with SpoilClock! Dispatch engine is matching Coimbatore recipients.`);
    onRefresh();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Donor Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Donor Profile</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>FSSAI Verified</Text>
          </View>
        </View>
        <Text style={styles.donorName}>{donorProfile.name}</Text>
        <Text style={styles.metaText}>📍 {donorProfile.branch}</Text>
        <Text style={styles.metaText}>📜 License: {donorProfile.fssaiLicense}</Text>
      </View>

      {/* Register Food Batch Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register Surplus Food Batch</Text>
        <Text style={styles.cardSubtitle}>
          FSSAI decay-aware registration for safe human redistribution
        </Text>

        <Text style={styles.label}>Food Description</Text>
        <TextInput
          style={styles.input}
          value={foodName}
          onChangeText={setFoodName}
          placeholder="e.g., 50 Meals Sambar Rice & Poriyal"
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Quantity (Meals)</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Quantity"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Safe Window (Hours)</Text>
            <TextInput
              style={styles.input}
              value={safeHours}
              onChangeText={setSafeHours}
              keyboardType="numeric"
              placeholder="e.g. 3.5"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Photo Upload Attachment */}
        <TouchableOpacity
          onPress={() => setHasPhoto(!hasPhoto)}
          style={[styles.photoButton, hasPhoto && styles.photoButtonActive]}
          activeOpacity={0.8}
        >
          <Text style={styles.photoButtonText}>
            {hasPhoto ? '📸 Food Photo Attached (Verified Quality)' : '📷 Attach Food Quality Photo'}
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleRegisterBatch}
          disabled={submitting}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Registering Batch...' : 'Publish Surplus Batch'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Batches & Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Active Surplus Batches ({myDonations.length})</Text>
        <Text style={styles.cardSubtitle}>Real-time allocation & transit monitoring</Text>

        {myDonations.map((item) => (
          <View key={item.id} style={styles.batchItem}>
            <View style={styles.batchTop}>
              <Text style={styles.batchDescription}>{item.description}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.batchQty}>{item.quantity} {item.unit}</Text>
            <Text style={styles.batchTime}>
              ⏳ Safe until: {new Date(item.verifiedSafeDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}

        {myDonations.length === 0 && (
          <Text style={styles.emptyText}>No registered batches yet today.</Text>
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
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  verifiedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  donorName: {
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  photoButton: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  photoButtonActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderStyle: 'solid',
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  batchItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  batchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  statusPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '700',
  },
  batchQty: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
  },
  batchTime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
});
