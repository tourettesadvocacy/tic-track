/**
 * Azure Cosmos DB client wrapper
 */
import { CosmosClient, Container } from '@azure/cosmos';
import { getAzureConfig, isAzureConfigValid } from '../config/azure';
import { Event } from '../types/events';

let cosmosClient: CosmosClient | null = null;
let container: Container | null = null;

/**
 * Initialize Cosmos DB client
 */
export const initCosmosClient = async (): Promise<boolean> => {
  try {
    const config = getAzureConfig();
    
    if (!isAzureConfigValid(config)) {
      console.warn('Invalid Azure configuration');
      return false;
    }
    
    if (!config) {
      return false;
    }
    
    cosmosClient = new CosmosClient({
      endpoint: config.endpoint,
      key: config.key,
    });
    
    // Get or create database
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: config.database,
    });
    
    // Get or create container with partition key
    const { container: cont } = await database.containers.createIfNotExists({
      id: config.container,
      partitionKey: {
        paths: ['/event_type'],
      },
    });
    
    container = cont;
    
    console.log('Cosmos DB client initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Cosmos DB client:', error);
    cosmosClient = null;
    container = null;
    return false;
  }
};

/**
 * Check if Cosmos DB client is initialized
 */
export const isCosmosClientInitialized = (): boolean => {
  return container !== null;
};

/**
 * Upload event to Cosmos DB
 */
export const uploadEvent = async (event: Event): Promise<boolean> => {
  if (!container) {
    console.warn('Cosmos DB container not initialized');
    return false;
  }
  
  try {
    // Cosmos DB uses 'id' as the unique identifier
    const cosmosEvent = {
      ...event,
      // Ensure partition key is set
      event_type: event.event_type,
    };
    
    await container.items.create(cosmosEvent);
    console.log(`Event ${event.id} uploaded to Cosmos DB`);
    return true;
  } catch (error) {
    console.error(`Error uploading event ${event.id}:`, error);
    return false;
  }
};

/**
 * Fetch all events from Cosmos DB
 */
export const fetchAllEvents = async (): Promise<Event[]> => {
  if (!container) {
    console.warn('Cosmos DB container not initialized');
    return [];
  }
  
  try {
    const querySpec = {
      query: 'SELECT * FROM c ORDER BY c.started_at DESC',
    };
    
    const { resources } = await container.items.query<Event>(querySpec).fetchAll();
    
    console.log(`Fetched ${resources.length} events from Cosmos DB`);
    return resources;
  } catch (error) {
    console.error('Error fetching events from Cosmos DB:', error);
    return [];
  }
};

/**
 * Fetch events by type from Cosmos DB
 */
export const fetchEventsByType = async (eventType: string): Promise<Event[]> => {
  if (!container) {
    console.warn('Cosmos DB container not initialized');
    return [];
  }
  
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.event_type = @eventType ORDER BY c.started_at DESC',
      parameters: [
        {
          name: '@eventType',
          value: eventType,
        },
      ],
    };
    
    const { resources } = await container.items.query<Event>(querySpec).fetchAll();
    
    console.log(`Fetched ${resources.length} ${eventType} events from Cosmos DB`);
    return resources;
  } catch (error) {
    console.error(`Error fetching ${eventType} events from Cosmos DB:`, error);
    return [];
  }
};

/**
 * Delete event from Cosmos DB
 */
export const deleteEventFromCosmos = async (id: string, eventType: string): Promise<boolean> => {
  if (!container) {
    console.warn('Cosmos DB container not initialized');
    return false;
  }
  
  try {
    await container.item(id, eventType).delete();
    console.log(`Event ${id} deleted from Cosmos DB`);
    return true;
  } catch (error) {
    console.error(`Error deleting event ${id} from Cosmos DB:`, error);
    return false;
  }
};

/**
 * Test Cosmos DB connection
 */
export const testCosmosConnection = async (): Promise<boolean> => {
  try {
    if (!container) {
      console.warn('Cosmos DB container not initialized');
      return false;
    }
    
    // Try a simple query to test connection
    const querySpec = {
      query: 'SELECT TOP 1 * FROM c',
    };
    
    await container.items.query(querySpec).fetchAll();
    console.log('Cosmos DB connection test successful');
    return true;
  } catch (error) {
    console.error('Cosmos DB connection test failed:', error);
    return false;
  }
};
