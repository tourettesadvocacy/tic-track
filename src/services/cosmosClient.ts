// TEMPORARY: Azure Cosmos SDK disabled until REST API implementation
import { Event } from '../types/events';

let initialized = false;

export async function initCosmosClient(): Promise<void> {
  console.log('Cosmos DB temporarily disabled - using local storage only');
  initialized = false; // Keep false since we're not really connected
}

export function isCosmosClientInitialized(): boolean {
  return initialized;
}

export const cosmosClient = {
  createEvent:  async (event: Event): Promise<Event> => {
    console.log('Cosmos DB disabled - event saved locally only');
    return event;
  },
  
  queryEvents: async (): Promise<Event[]> => {
    console.log('Cosmos DB disabled - returning empty array');
    return [];
  },
  
  updateEvent: async (event: Event): Promise<Event> => {
    console.log('Cosmos DB disabled - event saved locally only');
    return event;
  },
};