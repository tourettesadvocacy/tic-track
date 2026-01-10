/**
 * Tic Track - Main App Component
 * Mobile app for tracking Tourette's syndrome events
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { LinearGradient } from 'expo-linear-gradient';

import { Event, SyncState } from './src/types/events';
import { initDatabase } from './src/services/localStorage';
import { initCosmosClient } from './src/services/cosmosClient';
import { getMergedEvents, syncPendingEvents, getSyncState, startAutoSync } from './src/services/eventSync';
import { EventLogger } from './src/components/EventLogger';
import { EventViewer } from './src/components/EventViewer';
import { SyncPanel } from './src/components/SyncPanel';

const COLORS = {
  background: '#C1D9D6',
  text: '#20736A',
  buttonText: '#F2F2F2',
  primaryButton: '#D99923',
  dangerButton: '#DB3238',
  accentActive: '#FFC300',
  placeholder: 'rgba(32, 115, 106, 0.55)',
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
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

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
  async function setup() {
    try {
      await initDatabase();
    } catch (error) {
      console.log('Database initialization skipped:', error);
    }
  }
  setup();
}, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing Tic Track...');

      // Initialize local database
      await initDatabase();
      console.log('Local database initialized');

      // Try to initialize Cosmos DB
      const cosmosInitialized = await initCosmosClient();
      setIsCosmosConfigured(cosmosInitialized);

      if (!cosmosInitialized) {
        console.log('Cosmos DB not configured - running in offline mode');
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
    Alert.alert(
      'Configure Cloud Sync',
      'To configure cloud sync:\n\n1. Add your Azure Cosmos DB key to .env file\n2. Set AZURE_COSMOS_KEY variable\n3. Restart the app\n\nSee README.md for detailed instructions.',
      [{ text: 'OK' }]
    );
  };

  const handleCloudStatusPress = () => {
    const message = isCosmosConfigured
      ? 'Cloud sync is configured and running.'
      : 'Cloud sync is currently not configured. Events will be stored locally.';
    Alert.alert('Cloud Sync Status', message, [{ text: 'OK' }]);
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
      <ExpoStatusBar style="dark" />

      {currentScreen === 'home' && (
        <LinearGradient
          colors={[COLORS.background, COLORS.background]}
          style={styles.homeContainer}
        >
          <View style={styles.homeContent}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.settingsTrigger}
                onPress={() => setIsSettingsVisible(true)}
                accessibilityLabel="Open settings"
              >
                <MaterialIcons name="settings" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.homeBody}>
              <Text style={styles.appTitle}>Tic Track</Text>
              <Text style={styles.appSubtitle}>Track your events with confidence</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setCurrentScreen('logger')}
              >
                <MaterialIcons name="add-circle" size={28} color={COLORS.buttonText} />
                <Text style={styles.primaryButtonText}>I'm Having an Event!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setCurrentScreen('viewer')}
              >
                <MaterialIcons name="history" size={24} color={COLORS.buttonText} />
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
                  <MaterialIcons name="settings" size={20} color={COLORS.buttonText} />
                  <Text style={styles.configButtonText}>Configure Cloud Sync</Text>
                </TouchableOpacity>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {events.length} event{events.length !== 1 ? 's' : ''} tracked
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      )}

      {currentScreen === 'home' && (
        <Modal
          transparent
          animationType="fade"
          visible={isSettingsVisible}
          onRequestClose={() => setIsSettingsVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.settingsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity
                  onPress={() => setIsSettingsVisible(false)}
                  accessibilityLabel="Close settings"
                >
                  <MaterialIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloudStatusPress}
              >
                <Text style={styles.modalButtonText}>Cloud sync not configured</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => {
                  handleConfigureAzure();
                  setIsSettingsVisible(false);
                }}
              >
                <Text style={styles.modalPrimaryButtonText}>Configure Cloud Sync</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  settingsTrigger: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(32, 115, 106, 0.15)',
  },
  homeBody: {
    flex: 1,
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
    borderRadius: 999,
    marginBottom: 15,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 115, 106, 0.15)',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.placeholder,
    marginBottom: 20,
    gap: 10,
  },
  secondaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontFamily: 'Manrope_600SemiBold',
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 115, 106, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  configButtonText: {
    color: COLORS.buttonText,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.text,
    backgroundColor: COLORS.text,
  },
  modalButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primaryButton,
    borderColor: COLORS.primaryButton,
  },
  modalPrimaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
  },
});
