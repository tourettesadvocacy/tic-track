/**
 * Event synchronization service (local SQLite ↔ Azure Cosmos DB)
 */
import { Event, SyncState } from '../types/events';
import { getEventsBySyncStatus, updateEventSyncStatus, getAllEvents } from './localStorage';
import { uploadEvent, fetchAllEvents, isCosmosClientInitialized } from './cosmosClient';
import { getCurrentISOString } from '../utils/datetime';

let isSyncing = false;
let lastSyncTimestamp: string | null = null;

/**
 * Sync pending events to Cosmos DB
 */
export const syncPendingEvents = async (): Promise<{
  success: boolean;
  syncedCount: number;
  errorCount: number;
  message: string;
}> => {
  if (isSyncing) {
    return {
      success: false,
      syncedCount: 0,
      errorCount: 0,
      message: 'Sync already in progress',
    };
  }
  
  if (!isCosmosClientInitialized()) {
    return {
      success: false,
      syncedCount: 0,
      errorCount: 0,
      message: 'Cloud storage not configured',
    };
  }
  
  isSyncing = true;
  let syncedCount = 0;
  let errorCount = 0;
  
  try {
    // Get all pending events
    const pendingEvents = await getEventsBySyncStatus('pending');
    
    if (pendingEvents.length === 0) {
      lastSyncTimestamp = getCurrentISOString();
      return {
        success: true,
        syncedCount: 0,
        errorCount: 0,
        message: 'No events to sync',
      };
    }
    
    console.log(`Starting sync of ${pendingEvents.length} pending events`);
    
    // Upload each pending event
    for (const event of pendingEvents) {
      try {
        const uploaded = await uploadEvent(event);
        
        if (uploaded) {
          await updateEventSyncStatus(event.id, 'synced', getCurrentISOString());
          syncedCount++;
        } else {
          await updateEventSyncStatus(event.id, 'error');
          errorCount++;
        }
      } catch (error) {
        console.error(`Error syncing event ${event.id}:`, error);
        await updateEventSyncStatus(event.id, 'error');
        errorCount++;
      }
    }
    
    lastSyncTimestamp = getCurrentISOString();
    
    const message = errorCount > 0
      ? `Synced ${syncedCount} events, ${errorCount} failed`
      : `Synced ${syncedCount} events successfully`;
    
    return {
      success: errorCount === 0,
      syncedCount,
      errorCount,
      message,
    };
  } catch (error) {
    console.error('Error during sync:', error);
    return {
      success: false,
      syncedCount,
      errorCount,
      message: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  } finally {
    isSyncing = false;
  }
};

/**
 * Get merged events (local + cloud, deduplicated)
 */
export const getMergedEvents = async (): Promise<Event[]> => {
  try {
    // Get local events
    const localEvents = await getAllEvents();
    
    // Try to get cloud events if available
    let cloudEvents: Event[] = [];
    if (isCosmosClientInitialized()) {
      try {
        cloudEvents = await fetchAllEvents();
      } catch (error) {
        console.warn('Could not fetch cloud events:', error);
      }
    }
    
    // Deduplicate events by ID (prefer local version for consistency)
    const eventMap = new Map<string, Event>();
    
    // Add cloud events first
    cloudEvents.forEach(event => {
      eventMap.set(event.id, event);
    });
    
    // Override with local events (they are the source of truth)
    localEvents.forEach(event => {
      eventMap.set(event.id, event);
    });
    
    // Convert to array and sort by started_at (most recent first)
    const mergedEvents = Array.from(eventMap.values());
    mergedEvents.sort((a, b) => {
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
    });
    
    return mergedEvents;
  } catch (error) {
    console.error('Error merging events:', error);
    // Fallback to local events only
    return await getAllEvents();
  }
};

/**
 * Get current sync state
 */
export const getSyncState = async (): Promise<SyncState> => {
  try {
    const pendingEvents = await getEventsBySyncStatus('pending');
    const errorEvents = await getEventsBySyncStatus('error');
    
    let message = 'Up to date';
    if (isSyncing) {
      message = 'Syncing...';
    } else if (pendingEvents.length > 0) {
      message = `${pendingEvents.length} event(s) pending sync`;
    } else if (errorEvents.length > 0) {
      message = `${errorEvents.length} event(s) failed to sync`;
    }
    
    return {
      isSyncing,
      lastSyncAt: lastSyncTimestamp,
      pendingCount: pendingEvents.length,
      errorCount: errorEvents.length,
      message,
    };
  } catch (error) {
    console.error('Error getting sync state:', error);
    return {
      isSyncing: false,
      lastSyncAt: null,
      pendingCount: 0,
      errorCount: 0,
      message: 'Error checking sync status',
    };
  }
};

/**
 * Retry failed syncs
 */
export const retryFailedSyncs = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const errorEvents = await getEventsBySyncStatus('error');
    
    if (errorEvents.length === 0) {
      return {
        success: true,
        message: 'No failed events to retry',
      };
    }
    
    // Update error events back to pending
    for (const event of errorEvents) {
      await updateEventSyncStatus(event.id, 'pending');
    }
    
    // Trigger sync
    const result = await syncPendingEvents();
    
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error('Error retrying failed syncs:', error);
    return {
      success: false,
      message: 'Error retrying syncs',
    };
  }
};

/**
 * Start automatic background sync (every 30 seconds)
 */
let syncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = (): void => {
  if (syncInterval) {
    return; // Already running
  }
  
  console.log('Starting automatic sync (every 30 seconds)');
  
  syncInterval = setInterval(async () => {
    if (!isSyncing && isCosmosClientInitialized()) {
      try {
        await syncPendingEvents();
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    }
  }, 30000); // 30 seconds
};

/**
 * Stop automatic background sync
 */
export const stopAutoSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Automatic sync stopped');
  }
};
