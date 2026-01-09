/**
 * Event type definitions for Tic Track application
 */

export type EventType = 'tic' | 'emotional' | 'combined';

export type SyncStatus = 'pending' | 'synced' | 'error';

export interface Event {
  id: string;                           // UUID (local) or Cosmos DB id
  event_type: EventType;                // Type of event
  description?: string | null;          // Optional description
  triggers?: string | null;             // What set off the event
  notes?: string | null;                // Additional notes
  started_at: string;                   // ISO 8601 datetime
  ended_at?: string | null;             // ISO 8601 datetime (optional)
  duration_seconds?: number | null;     // Calculated duration
  created_at: string;                   // ISO 8601 datetime
  updated_at: string;                   // ISO 8601 datetime
  synced_at?: string | null;            // When synced to cloud
  sync_status: SyncStatus;              // Sync status
}

export interface EventFormData {
  event_type: EventType;
  description: string;
  triggers: string;
  notes: string;
  started_at: Date;
  ended_at: Date | null;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
  errorCount: number;
  message: string;
}
