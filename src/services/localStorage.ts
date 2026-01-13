import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventType } from '../types/events';
import { getCurrentISOString } from '../utils/datetime';

// Database instance
const db = SQLite.openDatabaseSync('tictrack-v2.db');

/**
 * Initialize SQLite database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    // Create events table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        description TEXT,
        triggers TEXT,
        notes TEXT,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        sync_status TEXT DEFAULT 'pending'
      );
    `);

    // Create indexes
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_events_sync_status ON events(sync_status);
      CREATE INDEX IF NOT EXISTS idx_events_started_at ON events(started_at DESC);
    `);

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Save an event to local database
 */
export async function saveEvent(event: Event): Promise<void> {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO events (
        id, event_type, description, triggers, notes,
        started_at, ended_at, duration_seconds,
        created_at, updated_at, synced_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.event_type,
        event.description ?? null,
        event.triggers ?? null,
        event.notes ?? null,
        event.started_at,
        event.ended_at ?? null,
        event.duration_seconds ?? null,
        event.created_at,
        event.updated_at,
        event.synced_at ?? null,
        event.sync_status,
      ]
    );
    console.log('Event saved to local database:', event.id);
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export const createEvent = async (
  eventType: EventType,
  startedAt: string,
  endedAt: string | null,
  description: string | null,
  triggers: string | null,
  notes: string | null,
  durationSeconds: number | null
): Promise<Event> => {
  const timestamp = getCurrentISOString();
  const event: Event = {
    id: uuidv4(),
    event_type: eventType,
    description,
    triggers,
    notes,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    created_at: timestamp,
    updated_at: timestamp,
    synced_at: null,
    sync_status: 'pending',
  };

  await saveEvent(event);
  return event;
};

/**
 * Get all events from local database
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const result = await db.getAllAsync<Event>(
      'SELECT * FROM events ORDER BY started_at DESC'
    );
    return result;
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

/**
 * Get pending events that need to be synced
 */
export async function getPendingEvents(): Promise<Event[]> {
  try {
    const result = await db.getAllAsync<Event>(
      "SELECT * FROM events WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );
    return result;
  } catch (error) {
    console.error('Error getting pending events:', error);
    return [];
  }
}

/**
 * Get events by sync status
 */
export const getEventsBySyncStatus = async (
  status: 'pending' | 'synced' | 'error'
): Promise<Event[]> => {
  try {
    const result = await db.getAllAsync<Event>(
      'SELECT * FROM events WHERE sync_status = ? ORDER BY created_at ASC',
      [status]
    );
    return result;
  } catch (error) {
    console.error('Error getting events by sync status:', error);
    return [];
  }
};

/**
 * Update event sync status
 */
export async function updateEventSyncStatus(
  eventId: string,
  status: 'pending' | 'synced' | 'error',
  syncedAt?:  string
): Promise<void> {
  try {
    await db.runAsync(
      'UPDATE events SET sync_status = ?, synced_at = ?, updated_at = ? WHERE id = ? ',
      [status, syncedAt || null, new Date().toISOString(), eventId]
    );
    console.log(`Event ${eventId} sync status updated to ${status}`);
  } catch (error) {
    console.error('Error updating sync status:', error);
    throw error;
  }
}

/**
 * Delete an event from local database
 */
export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await db.runAsync('DELETE FROM events WHERE id = ?', [eventId]);
    console.log('Event deleted from local database:', eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Clear all events (for testing)
 */
export async function clearAllEvents(): Promise<void> {
  try {
    await db.runAsync('DELETE FROM events');
    console.log('All events cleared from local database');
  } catch (error) {
    console.error('Error clearing events:', error);
    throw error;
  }
}