/**
 * EventViewer component - Event history list
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Event, EventType } from '../types/events';
import { formatDateTimeShort, formatDuration } from '../utils/datetime';

const COLORS = {
  background: '#C1D9D6',
  text: '#0D0D0D',
  buttonText: '#F2F2F2',
  primaryButton: '#D99923',
  dangerButton: '#DB3238',
  accentActive: '#FFC300',
  placeholder: 'rgba(13, 13, 13, 0.45)',
};

interface EventViewerProps {
  events: Event[];
  isLoading: boolean;
  onRefresh: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onClose: () => void;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  tic: '#4A90E2',
  emotional: '#E24A6C',
  combined: '#9B59B6',
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  tic: 'Tic',
  emotional: 'Emotional',
  combined: 'Combined',
};

const SYNC_STATUS_LABELS = {
  pending: 'Local',
  synced: 'Synced',
  error: 'Error',
};

const SYNC_STATUS_COLORS = {
  pending: COLORS.accentActive,
  synced: '#4CAF50',
  error: COLORS.dangerButton,
};

export const EventViewer: React.FC<EventViewerProps> = ({
  events,
  isLoading,
  onRefresh,
  onSync,
  isSyncing,
  onClose,
}) => {
  const renderEventCard = ({ item: event }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View
          style={[
            styles.eventTypeBadge,
            { backgroundColor: EVENT_TYPE_COLORS[event.event_type] },
          ]}
        >
          <Text style={styles.eventTypeBadgeText}>
            {EVENT_TYPE_LABELS[event.event_type]}
          </Text>
        </View>
        <View
          style={[
            styles.syncBadge,
            { backgroundColor: SYNC_STATUS_COLORS[event.sync_status] },
          ]}
        >
          <Text style={styles.syncBadgeText}>
            {SYNC_STATUS_LABELS[event.sync_status]}
          </Text>
        </View>
      </View>

      <Text style={styles.eventTime}>{formatDateTimeShort(event.started_at)}</Text>

      {event.description && (
        <Text style={styles.eventDescription}>{event.description}</Text>
      )}

      {event.triggers && (
        <View style={styles.eventDetail}>
          <MaterialIcons name="warning" size={16} color={COLORS.placeholder} />
          <Text style={styles.eventDetailText}>Triggers: {event.triggers}</Text>
        </View>
      )}

      {event.duration_seconds !== null && event.duration_seconds !== undefined && (
        <View style={styles.eventDetail}>
          <MaterialIcons name="timer" size={16} color={COLORS.placeholder} />
          <Text style={styles.eventDetailText}>
            Duration: {formatDuration(event.duration_seconds)}
          </Text>
        </View>
      )}

      {event.notes && (
        <View style={styles.eventDetail}>
          <MaterialIcons name="note" size={16} color={COLORS.placeholder} />
          <Text style={styles.eventDetailText}>Notes: {event.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-note" size={64} color={COLORS.placeholder} />
      <Text style={styles.emptyStateText}>No events recorded yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap "I'm Having an Event!" to start tracking
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Event History</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, isSyncing && styles.actionButtonDisabled]}
          onPress={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={COLORS.buttonText} />
          ) : (
            <MaterialIcons name="cloud-upload" size={20} color={COLORS.buttonText} />
          )}
          <Text style={styles.actionButtonText}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.buttonText} />
          ) : (
            <MaterialIcons name="refresh" size={20} color={COLORS.buttonText} />
          )}
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading && events.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryButton} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.placeholder,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryButton,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  eventCard: {
    backgroundColor: 'rgba(32, 115, 106, 0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.placeholder,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventTypeBadgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  syncBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncBadgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  eventTime: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  eventDetailText: {
    color: COLORS.placeholder,
    fontSize: 13,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptyStateSubtext: {
    color: COLORS.placeholder,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
});
