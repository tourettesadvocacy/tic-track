/**
 * Azure Cosmos DB configuration
 */
import Constants from 'expo-constants';

export interface AzureConfig {
  endpoint: string;
  key: string;
  database: string;
  container: string;
}

/**
 * Get Azure Cosmos DB configuration from environment/constants
 */
export const getAzureConfig = (): AzureConfig | null => {
  const endpoint = Constants.expoConfig?.extra?.azureCosmosEndpoint;
  const database = Constants.expoConfig?.extra?.azureCosmosDatabase || 'tic-track';
  const container = Constants.expoConfig?.extra?.azureCosmosContainer || 'events';
  
  // Key should be stored in Expo Secure Store, not in config
  // This is a placeholder - actual key will be retrieved from secure storage
  
  if (!endpoint) {
    console.warn('Azure Cosmos DB endpoint not configured');
    return null;
  }
  
  return {
    endpoint,
    key: '', // Will be loaded from secure store
    database,
    container,
  };
};

/**
 * Validate Azure configuration
 */
export const isAzureConfigValid = (config: AzureConfig | null): boolean => {
  if (!config) return false;
  return !!(config.endpoint && config.key && config.database && config.container);
};
