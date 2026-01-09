import { BlobServiceClient } from '@azure/storage-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AZURE_CONNECTION_STRING_KEY = 'AZURE_CONNECTION_STRING';
const AZURE_CONTAINER_NAME = 'tic-track-data';

interface TicData {
  id: string;
  type: string;
  severity: number;
  description?: string;
  timestamp: number;
  createdAt: Date;
}

interface EmotionData {
  id: string;
  emotionType: string;
  intensity: number;
  notes?: string;
  timestamp: number;
  createdAt: Date;
}

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string = AZURE_CONTAINER_NAME;

  async initialize(): Promise<void> {
    try {
      const connectionString = await AsyncStorage.getItem(AZURE_CONNECTION_STRING_KEY);
      if (connectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      }
    } catch (error) {
      console.error('Failed to initialize Azure Storage:', error);
      throw error;
    }
  }

  async setConnectionString(connectionString: string): Promise<void> {
    await AsyncStorage.setItem(AZURE_CONNECTION_STRING_KEY, connectionString);
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadData(data: TicData[] | EmotionData[], fileName: string): Promise<string | null> {
    if (!this.blobServiceClient) {
      console.warn('Azure Storage not initialized');
      return null;
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Create container if it doesn't exist
      await containerClient.createIfNotExists();

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      const jsonData = JSON.stringify(data);
      
      await blockBlobClient.upload(jsonData, jsonData.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Failed to upload data to Azure:', error);
      throw error;
    }
  }

  async uploadTics(tics: TicData[]): Promise<string | null> {
    const fileName = `tics-${Date.now()}.json`;
    return this.uploadData(tics, fileName);
  }

  async uploadEmotions(emotions: EmotionData[]): Promise<string | null> {
    const fileName = `emotions-${Date.now()}.json`;
    return this.uploadData(emotions, fileName);
  }

  isInitialized(): boolean {
    return this.blobServiceClient !== null;
  }
}

export const azureStorageService = new AzureStorageService();
