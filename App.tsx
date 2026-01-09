/**
 * Tic Track - Main App Component
 * Mobile app for tracking Tourette's syndrome events
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { LinearGradient } from 'expo-linear-gradient';

import { Event, SyncState } from './src/types/events';
import { initDatabase } from './src/services/localStorage';
import { initCosmosClient, storeCosmosKey, getCosmosKey } from './src/services/cosmosClient';
import { getMergedEvents, syncPendingEvents, getSyncState, startAutoSync } from './src/services/eventSync';
import { EventLogger } from './src/components/EventLogger';
import { EventViewer } from './src/components/EventViewer';
import { SyncPanel } from './src/components/SyncPanel';

const COLORS = {
  background: '#20736A',
  text: '#F2F2F2',
  primaryButton: '#D99923',
  dangerButton: '#DB3238',
  accentActive: '#FFC300',
  placeholder: 'rgba(242, 242, 242, 0.55)',
};

type Screen = 'home' | 'logger' | 'viewer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [events, setEvents] = useState<Event[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncAt: null,
    pendingCount: 0,
    errorCount: 0,
    message: 'Initializing...',
  });
  const [isCosmosConfigured, setIsCosmosConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Update sync state periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateSyncState = async () => {
      const state = await getSyncState();
      setSyncState(state);
    };

    updateSyncState();
    const interval = setInterval(updateSyncState, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  const initializeApp = async () => {
    try {
      console.log('Initializing Tic Track...');

      // Initialize local database
      await initDatabase();
      console.log('Local database initialized');

      // Try to initialize Cosmos DB
      const cosmosKey = await getCosmosKey();
      let cosmosInitialized = false;

      if (cosmosKey) {
        cosmosInitialized = await initCosmosClient();
        setIsCosmosConfigured(cosmosInitialized);
      } else {
        console.log('No Cosmos DB key found - will run in offline mode');
        // Optionally prompt user to configure Azure
        // For now, we'll just continue in offline mode
      }

      // Start auto-sync if Cosmos is configured
      if (cosmosInitialized) {
        startAutoSync();
      }

      // Load events
      await loadEvents();

      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize app. Please restart.');
    }
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const mergedEvents = await getMergedEvents();
      setEvents(mergedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSaved = async () => {
    setCurrentScreen('home');
    await loadEvents();

    // Update sync state
    const state = await getSyncState();
    setSyncState(state);
  };

  const handleSync = async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true, message: 'Syncing...' }));
      const result = await syncPendingEvents();
      
      // Update sync state
      const state = await getSyncState();
      setSyncState(state);

      // Reload events to reflect sync status
      await loadEvents();

      if (!result.success && result.errorCount > 0) {
        Alert.alert('Sync Warning', result.message);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Sync Error', 'Failed to sync events. Please try again.');
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  const handleConfigureAzure = () => {
    Alert.prompt(
      'Configure Azure Cosmos DB',
      'Enter your Azure Cosmos DB primary key:',
      async (key) => {
        if (key && key.trim()) {
          try {
            await storeCosmosKey(key.trim());
            const initialized = await initCosmosClient();
            setIsCosmosConfigured(initialized);

            if (initialized) {
              startAutoSync();
              Alert.alert('Success', 'Azure Cosmos DB configured successfully!');
            } else {
              Alert.alert('Error', 'Failed to initialize Cosmos DB. Please check your key.');
            }
          } catch (error) {
            console.error('Error configuring Azure:', error);
            Alert.alert('Error', 'Failed to configure Azure Cosmos DB.');
          }
        }
      },
      'secure-text'
    );
  };

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />

      {currentScreen === 'home' && (
        <LinearGradient
          colors={['#20736A', '#1a5f57']}
          style={styles.homeContainer}
        >
          <View style={styles.homeContent}>
            <Text style={styles.appTitle}>Tic Track</Text>
            <Text style={styles.appSubtitle}>Track your events with confidence</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCurrentScreen('logger')}
            >
              <MaterialIcons name="add-circle" size={28} color={COLORS.text} />
              <Text style={styles.primaryButtonText}>I'm Having an Event!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('viewer')}
            >
              <MaterialIcons name="history" size={24} color={COLORS.text} />
              <Text style={styles.secondaryButtonText}>View History</Text>
            </TouchableOpacity>

            <SyncPanel
              syncState={syncState}
              onSync={handleSync}
              isCosmosConfigured={isCosmosConfigured}
            />

            {!isCosmosConfigured && (
              <TouchableOpacity
                style={styles.configButton}
                onPress={handleConfigureAzure}
              >
                <MaterialIcons name="settings" size={20} color={COLORS.text} />
                <Text style={styles.configButtonText}>Configure Cloud Sync</Text>
              </TouchableOpacity>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {events.length} event{events.length !== 1 ? 's' : ''} tracked
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {currentScreen === 'logger' && (
        <EventLogger
          onEventSaved={handleEventSaved}
          onCancel={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'viewer' && (
        <EventViewer
          events={events}
          isLoading={isLoading}
          onRefresh={loadEvents}
          onSync={handleSync}
          isSyncing={syncState.isSyncing}
          onClose={() => setCurrentScreen('home')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
  },
  homeContainer: {
    flex: 1,
  },
  homeContent: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    justifyContent: 'center',
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 48,
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  appSubtitle: {
    color: COLORS.placeholder,
    fontSize: 18,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    marginBottom: 50,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryButton,
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 242, 242, 0.15)',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.placeholder,
    marginBottom: 20,
    gap: 10,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 242, 242, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  configButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.placeholder,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
});
