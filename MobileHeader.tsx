import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MobileRole } from '../types';

interface MobileHeaderProps {
  currentRole: MobileRole;
  onSelectRole: (role: MobileRole) => void;
  isOnline: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentRole,
  onSelectRole,
  isOnline,
}) => {
  const roles: { id: MobileRole; label: string }[] = [
    { id: 'donor', label: 'Donor' },
    { id: 'ngo', label: 'NGO' },
    { id: 'coordinator', label: 'Ops' },
    { id: 'judge_demo', label: 'Demo' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🍽️</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>SmartPlate</Text>
              <View style={styles.cbeBadge}>
                <Text style={styles.cbeText}>CBE</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Good Food. Better Distribution.</Text>
          </View>
        </View>

        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#10b981' : '#f59e0b' },
            ]}
          />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Role Pill Switcher */}
      <View style={styles.pillContainer}>
        {roles.map((r) => {
          const active = currentRole === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => onSelectRole(r.id)}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cbeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cbeText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 7,
  },
  pillActive: {
    backgroundColor: '#10b981',
  },
  pillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
});
