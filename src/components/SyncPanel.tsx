/**
 * SyncPanel component - Sync controls and status
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SyncState } from '../types/events';
import { getTimeAgo } from '../utils/datetime';

const COLORS = {
  background: '#C1D9D6',
  text: '#0D0D0D',
  buttonText: '#F2F2F2',
  primaryButton: '#D99923',
  dangerButton: '#DB3238',
  accentActive: '#FFC300',
  placeholder: 'rgba(13, 13, 13, 0.45)',
};

interface SyncPanelProps {
  syncState: SyncState;
  onSync: () => void;
  isCosmosConfigured: boolean;
}

export const SyncPanel: React.FC<SyncPanelProps> = ({
  syncState,
  onSync,
  isCosmosConfigured,
}) => {
  const getSyncIcon = () => {
    if (syncState.isSyncing) {
      return 'sync';
    }
    if (syncState.errorCount > 0) {
      return 'sync-problem';
    }
    if (syncState.pendingCount > 0) {
      return 'cloud-queue';
    }
    return 'cloud-done';
  };

  const getSyncColor = () => {
    if (syncState.isSyncing) {
      return COLORS.accentActive;
    }
    if (syncState.errorCount > 0) {
      return COLORS.dangerButton;
    }
    if (syncState.pendingCount > 0) {
      return COLORS.primaryButton;
    }
    return '#4CAF50';
  };

  if (!isCosmosConfigured) {
    return (
      <View style={styles.container}>
        <View style={styles.statusRow}>
          <MaterialIcons name="cloud-off" size={24} color={COLORS.placeholder} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusText}>Cloud sync not configured</Text>
            <Text style={styles.statusSubtext}>
              Events are saved locally only
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <MaterialIcons name={getSyncIcon()} size={24} color={getSyncColor()} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{syncState.message}</Text>
          {syncState.lastSyncAt && (
            <Text style={styles.statusSubtext}>
              Last sync: {getTimeAgo(syncState.lastSyncAt)}
            </Text>
          )}
        </View>
      </View>

      {syncState.pendingCount > 0 && !syncState.isSyncing && (
        <TouchableOpacity style={styles.syncButton} onPress={onSync}>
          <MaterialIcons name="sync" size={20} color={COLORS.buttonText} />
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      )}

      {syncState.errorCount > 0 && !syncState.isSyncing && (
        <View style={styles.errorInfo}>
          <MaterialIcons name="error-outline" size={16} color={COLORS.dangerButton} />
          <Text style={styles.errorText}>
            {syncState.errorCount} event(s) failed to sync
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(242, 242, 242, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.placeholder,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtext: {
    color: COLORS.placeholder,
    fontSize: 13,
    marginTop: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryButton,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  syncButtonText: {
    color: COLORS.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  errorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  errorText: {
    color: COLORS.dangerButton,
    fontSize: 13,
  },
});
