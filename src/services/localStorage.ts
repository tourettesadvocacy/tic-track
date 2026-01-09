/**
 * Local SQLite storage service
 */
import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventType, SyncStatus } from '../types/events';
import { getCurrentISOString } from '../utils/datetime';

const DB_NAME = 'tictrack.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize SQLite database
 */
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
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
      
      CREATE INDEX IF NOT EXISTS idx_events_sync_status ON events(sync_status);
      CREATE INDEX IF NOT EXISTS idx_events_started_at ON events(started_at DESC);
    `);
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Get database instance (initialize if needed)
 */
const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    await initDatabase();
  }
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

/**
 * Create a new event in local storage
 */
export const createEvent = async (
  event_type: EventType,
  started_at: string,
  ended_at?: string | null,
  description?: string | null,
  triggers?: string | null,
  notes?: string | null,
  duration_seconds?: number | null
): Promise<Event> => {
  const database = await getDb();
  
  const event: Event = {
    id: uuidv4(),
    event_type,
    description: description || null,
    triggers: triggers || null,
    notes: notes || null,
    started_at,
    ended_at: ended_at || null,
    duration_seconds: duration_seconds || null,
    created_at: getCurrentISOString(),
    updated_at: getCurrentISOString(),
    synced_at: null,
    sync_status: 'pending',
  };
  
  await database.runAsync(
    `INSERT INTO events (
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
  
  console.log('Event created locally:', event.id);
  return event;
};

/**
 * Get all events from local storage
 */
export const getAllEvents = async (): Promise<Event[]> => {
  const database = await getDb();
  
  const result = await database.getAllAsync<Event>(
    'SELECT * FROM events ORDER BY started_at DESC'
  );
  
  return result;
};

/**
 * Get events by sync status
 */
export const getEventsBySyncStatus = async (status: SyncStatus): Promise<Event[]> => {
  const database = await getDb();
  
  const result = await database.getAllAsync<Event>(
    'SELECT * FROM events WHERE sync_status = ? ORDER BY created_at ASC',
    [status]
  );
  
  return result;
};

/**
 * Update event sync status
 */
export const updateEventSyncStatus = async (
  id: string,
  sync_status: SyncStatus,
  synced_at?: string
): Promise<void> => {
  const database = await getDb();
  
  await database.runAsync(
    'UPDATE events SET sync_status = ?, synced_at = ?, updated_at = ? WHERE id = ?',
    [sync_status, synced_at || null, getCurrentISOString(), id]
  );
  
  console.log(`Event ${id} sync status updated to: ${sync_status}`);
};

/**
 * Get event by ID
 */
export const getEventById = async (id: string): Promise<Event | null> => {
  const database = await getDb();
  
  const result = await database.getFirstAsync<Event>(
    'SELECT * FROM events WHERE id = ?',
    [id]
  );
  
  return result || null;
};

/**
 * Delete event by ID
 */
export const deleteEvent = async (id: string): Promise<void> => {
  const database = await getDb();
  
  await database.runAsync('DELETE FROM events WHERE id = ?', [id]);
  
  console.log(`Event ${id} deleted`);
};

/**
 * Get sync statistics
 */
export const getSyncStats = async (): Promise<{
  total: number;
  pending: number;
  synced: number;
  error: number;
}> => {
  const database = await getDb();
  
  const total = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events'
  );
  
  const pending = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events WHERE sync_status = ?',
    ['pending']
  );
  
  const synced = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events WHERE sync_status = ?',
    ['synced']
  );
  
  const error = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM events WHERE sync_status = ?',
    ['error']
  );
  
  return {
    total: total?.count || 0,
    pending: pending?.count || 0,
    synced: synced?.count || 0,
    error: error?.count || 0,
  };
};

/**
 * Clear all events (for testing/debugging)
 */
export const clearAllEvents = async (): Promise<void> => {
  const database = await getDb();
  
  await database.runAsync('DELETE FROM events');
  
  console.log('All events cleared from local storage');
};
