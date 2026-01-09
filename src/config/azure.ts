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
  const key = Constants.expoConfig?.extra?.azureCosmosKey;
  
  if (!endpoint || !key) {
    console.warn('Azure Cosmos DB not fully configured');
    return null;
  }
  
  return {
    endpoint,
    key,
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
