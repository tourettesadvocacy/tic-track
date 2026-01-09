/**
 * Azure Cosmos DB REST API client wrapper
 * Uses direct REST API calls instead of @azure/cosmos SDK for React Native compatibility
 */
import CryptoJS from 'crypto-js';
import { getAzureConfig, isAzureConfigValid, AzureConfig } from '../config/azure';
import { Event, EventType } from '../types/events';

let azureConfig: AzureConfig | null = null;
let isInitialized = false;

/**
 * Validate that a value is a valid EventType
 */
function isValidEventType(value: string): value is EventType {
  return value === 'tic' || value === 'emotional' || value === 'combined';
}

/**
 * Generate HMAC-SHA256 signature for Azure Cosmos DB REST API authentication
 */
function generateAuthorizationSignature(
  verb: string,
  resourceType: string,
  resourceId: string,
  date: string,
  masterKey: string
): string {
  try {
    // Format: {verb}\n{resourceType}\n{resourceId}\n{date}\n\n
    const text = `${verb.toLowerCase()}\n${resourceType.toLowerCase()}\n${resourceId}\n${date.toLowerCase()}\n\n`;
    
    // Decode base64 master key
    const key = CryptoJS.enc.Base64.parse(masterKey);
    
    // Generate HMAC-SHA256 signature
    const hmac = CryptoJS.HmacSHA256(text, key);
    const signature = CryptoJS.enc.Base64.stringify(hmac);
    
    // Return encoded auth token
    return encodeURIComponent(`type=master&ver=1.0&sig=${signature}`);
  } catch (error) {
    console.error('Error generating authorization signature:', error);
    throw new Error('Failed to generate authorization signature');
  }
}

/**
 * Initialize Cosmos DB client
 */
export const initCosmosClient = async (): Promise<boolean> => {
  try {
    const config = getAzureConfig();
    
    if (!isAzureConfigValid(config)) {
      console.warn('Invalid Azure configuration');
      isInitialized = false;
      return false;
    }
    
    azureConfig = config;
    
    // Test connection
    const testResult = await testCosmosConnection();
    
    if (testResult) {
      isInitialized = true;
      console.log('Cosmos DB REST API client initialized successfully');
      return true;
    } else {
      isInitialized = false;
      return false;
    }
  } catch (error) {
    console.error('Error initializing Cosmos DB client:', error);
    azureConfig = null;
    isInitialized = false;
    return false;
  }
};

/**
 * Check if Cosmos DB client is initialized
 */
export const isCosmosClientInitialized = (): boolean => {
  return isInitialized && azureConfig !== null;
};

/**
 * Upload event to Cosmos DB (Create)
 */
export const uploadEvent = async (event: Event): Promise<boolean> => {
  if (!azureConfig || !isInitialized) {
    console.warn('Cosmos DB not initialized');
    return false;
  }
  
  // Validate event type
  if (!isValidEventType(event.event_type)) {
    console.error(`Invalid event type: ${event.event_type}`);
    return false;
  }
  
  try {
    const { endpoint, key, database, container } = azureConfig;
    const url = `${endpoint}/dbs/${database}/colls/${container}/docs`;
    const date = new Date().toUTCString();
    const resourceId = `dbs/${database}/colls/${container}`;
    
    const authToken = generateAuthorizationSignature(
      'POST',
      'docs',
      resourceId,
      date,
      key
    );
    
    // Cosmos DB uses 'id' as the unique identifier
    const cosmosEvent = {
      ...event,
      // Ensure partition key is set
      event_type: event.event_type,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-partitionkey': JSON.stringify([event.event_type]),
      },
      body: JSON.stringify(cosmosEvent),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to create event: ${response.status} ${error}`);
      
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Azure Cosmos DB credentials');
      } else if (response.status === 404) {
        throw new Error('Database or container not found');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      return false;
    }
    
    console.log(`Event ${event.id} uploaded to Cosmos DB`);
    return true;
  } catch (error) {
    console.error(`Error uploading event ${event.id}:`, error);
    return false;
  }
};

/**
 * Query events from Cosmos DB
 */
async function queryEvents(
  query: string = 'SELECT * FROM c',
  parameters: Array<{ name: string; value: any }> = []
): Promise<Event[]> {
  if (!azureConfig || !isInitialized) {
    console.warn('Cosmos DB not initialized');
    return [];
  }
  
  try {
    const { endpoint, key, database, container } = azureConfig;
    const url = `${endpoint}/dbs/${database}/colls/${container}/docs`;
    const date = new Date().toUTCString();
    const resourceId = `dbs/${database}/colls/${container}`;
    
    const authToken = generateAuthorizationSignature(
      'POST',
      'docs',
      resourceId,
      date,
      key
    );
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/query+json',
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-isquery': 'true',
        'x-ms-documentdb-query-enablecrosspartition': 'true',
      },
      body: JSON.stringify({
        query: query,
        parameters: parameters
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to query events: ${response.status} ${error}`);
      
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Azure Cosmos DB credentials');
      } else if (response.status === 404) {
        throw new Error('Database or container not found');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      return [];
    }
    
    const result = await response.json();
    const events = result.Documents || [];
    
    return events;
  } catch (error) {
    console.error('Error querying events from Cosmos DB:', error);
    return [];
  }
}

/**
 * Fetch all events from Cosmos DB
 */
export const fetchAllEvents = async (): Promise<Event[]> => {
  if (!azureConfig || !isInitialized) {
    console.warn('Cosmos DB not initialized');
    return [];
  }
  
  try {
    const query = 'SELECT * FROM c ORDER BY c.started_at DESC';
    const events = await queryEvents(query);
    
    console.log(`Fetched ${events.length} events from Cosmos DB`);
    return events;
  } catch (error) {
    console.error('Error fetching events from Cosmos DB:', error);
    return [];
  }
};

/**
 * Fetch events by type from Cosmos DB
 */
export const fetchEventsByType = async (eventType: string): Promise<Event[]> => {
  if (!azureConfig || !isInitialized) {
    console.warn('Cosmos DB not initialized');
    return [];
  }
  
  try {
    // Use parameterized query to prevent SQL injection
    const query = 'SELECT * FROM c WHERE c.event_type = @eventType ORDER BY c.started_at DESC';
    const parameters = [
      {
        name: '@eventType',
        value: eventType
      }
    ];
    const events = await queryEvents(query, parameters);
    
    console.log(`Fetched ${events.length} ${eventType} events from Cosmos DB`);
    return events;
  } catch (error) {
    console.error(`Error fetching ${eventType} events from Cosmos DB:`, error);
    return [];
  }
};

/**
 * Delete event from Cosmos DB
 */
export const deleteEventFromCosmos = async (id: string, eventType: string): Promise<boolean> => {
  if (!azureConfig || !isInitialized) {
    console.warn('Cosmos DB not initialized');
    return false;
  }
  
  // Validate event type
  if (!isValidEventType(eventType)) {
    console.error(`Invalid event type: ${eventType}`);
    return false;
  }
  
  try {
    const { endpoint, key, database, container } = azureConfig;
    const url = `${endpoint}/dbs/${database}/colls/${container}/docs/${id}`;
    const date = new Date().toUTCString();
    const resourceId = `dbs/${database}/colls/${container}/docs/${id}`;
    
    const authToken = generateAuthorizationSignature(
      'DELETE',
      'docs',
      resourceId,
      date,
      key
    );
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken,
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-partitionkey': JSON.stringify([eventType]),
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to delete event: ${response.status} ${error}`);
      
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Azure Cosmos DB credentials');
      } else if (response.status === 404) {
        // Treat 404 as success for idempotent delete operations
        // If the event is already deleted, that's the desired state
        console.warn(`Event ${id} not found in Cosmos DB - may already be deleted`);
        return true;
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      return false;
    }
    
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
  if (!azureConfig) {
    console.warn('Azure config not set');
    return false;
  }
  
  try {
    // Try a simple query to test connection
    const query = 'SELECT TOP 1 * FROM c';
    await queryEvents(query);
    
    console.log('Cosmos DB connection test successful');
    return true;
  } catch (error) {
    console.error('Cosmos DB connection test failed:', error);
    return false;
  }
};
