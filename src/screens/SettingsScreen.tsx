import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { azureStorageService } from '../services/AzureStorageService';

export const SettingsScreen = ({ navigation }: any) => {
  const [connectionString, setConnectionString] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('AZURE_CONNECTION_STRING');
      if (stored) {
        setConnectionString(stored);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    if (!connectionString.trim()) {
      Alert.alert('Error', 'Please enter a connection string');
      return;
    }

    try {
      await azureStorageService.setConnectionString(connectionString);
      setIsConfigured(true);
      Alert.alert('Success', 'Azure Storage configured successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to configure Azure Storage');
    }
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear Configuration',
      'Are you sure you want to remove Azure Storage configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('AZURE_CONNECTION_STRING');
              setConnectionString('');
              setIsConfigured(false);
              Alert.alert('Success', 'Configuration cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear configuration');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Azure Storage</Text>
        <Text style={styles.description}>
          Configure Azure Blob Storage to enable cloud sync. Data will be stored
          locally and optionally uploaded to Azure.
        </Text>

        <Text style={styles.label}>Connection String</Text>
        <TextInput
          style={styles.input}
          value={connectionString}
          onChangeText={setConnectionString}
          placeholder="DefaultEndpointsProtocol=https;..."
          multiline
          numberOfLines={4}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>
              {isConfigured ? 'Update' : 'Save'} Configuration
            </Text>
          </TouchableOpacity>

          {isConfigured && (
            <TouchableOpacity
              style={[styles.saveButton, styles.clearButton]}
              onPress={handleClear}>
              <Text style={styles.buttonText}>Clear Configuration</Text>
            </TouchableOpacity>
          )}
        </View>

        {isConfigured && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>✓ Azure Storage Configured</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.infoText}>Tic Track v1.0.0</Text>
        <Text style={styles.infoText}>
          A mobile app to track tics and emotions with local storage and optional
          cloud sync.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  statusText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
