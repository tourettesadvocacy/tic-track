import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Tic Track',
  slug: 'tic-track',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: process.env.APP_SCHEME || 'tictrack',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#20736A',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tourettesadvocacy.tictrack',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#20736A',
    },
    package: 'com.tourettesadvocacy.tictrack',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [],
  extra: {
    azureCosmosEndpoint: process.env.AZURE_COSMOS_ENDPOINT,
    azureCosmosDatabase: process.env.AZURE_COSMOS_DATABASE || 'tic-track',
    azureCosmosContainer: process.env.AZURE_COSMOS_CONTAINER || 'events',
  },
});
