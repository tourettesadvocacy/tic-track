import { database } from '../database';
import { azureStorageService } from './AzureStorageService';
import { Q } from '@nozbe/watermelondb';

export class SyncService {
  async syncTics(): Promise<void> {
    try {
      const ticsCollection = database.get('tics');
      const unsyncedTics = await ticsCollection
        .query(Q.where('synced', false))
        .fetch();

      if (unsyncedTics.length === 0) {
        console.log('No tics to sync');
        return;
      }

      const ticsData = unsyncedTics.map((tic: any) => ({
        id: tic.id,
        type: tic.type,
        severity: tic.severity,
        description: tic.description,
        timestamp: tic.timestamp,
        createdAt: tic.createdAt,
      }));

      const uploadUrl = await azureStorageService.uploadTics(ticsData);

      if (uploadUrl) {
        // Mark tics as synced
        await database.write(async () => {
          for (const tic of unsyncedTics) {
            await tic.update((t: any) => {
              t.synced = true;
            });
          }
        });
        console.log(`Synced ${unsyncedTics.length} tics to Azure`);
      }
    } catch (error) {
      console.error('Failed to sync tics:', error);
      throw error;
    }
  }

  async syncEmotions(): Promise<void> {
    try {
      const emotionsCollection = database.get('emotions');
      const unsyncedEmotions = await emotionsCollection
        .query(Q.where('synced', false))
        .fetch();

      if (unsyncedEmotions.length === 0) {
        console.log('No emotions to sync');
        return;
      }

      const emotionsData = unsyncedEmotions.map((emotion: any) => ({
        id: emotion.id,
        emotionType: emotion.emotionType,
        intensity: emotion.intensity,
        notes: emotion.notes,
        timestamp: emotion.timestamp,
        createdAt: emotion.createdAt,
      }));

      const uploadUrl = await azureStorageService.uploadEmotions(emotionsData);

      if (uploadUrl) {
        // Mark emotions as synced
        await database.write(async () => {
          for (const emotion of unsyncedEmotions) {
            await emotion.update((e: any) => {
              e.synced = true;
            });
          }
        });
        console.log(`Synced ${unsyncedEmotions.length} emotions to Azure`);
      }
    } catch (error) {
      console.error('Failed to sync emotions:', error);
      throw error;
    }
  }

  async syncAll(): Promise<void> {
    if (!azureStorageService.isInitialized()) {
      console.warn('Azure Storage not configured, skipping sync');
      return;
    }

    await this.syncTics();
    await this.syncEmotions();
  }
}

export const syncService = new SyncService();
