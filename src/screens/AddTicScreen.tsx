import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { database } from '../database';
import Tic from '../database/models/Tic';

type RootStackParamList = {
  Home: undefined;
  AddTic: undefined;
  AddEmotion: undefined;
  Settings: undefined;
};

type AddTicScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTic'>;

interface Props {
  navigation: AddTicScreenNavigationProp;
}

const TIC_TYPES = [
  'Motor - Simple',
  'Motor - Complex',
  'Vocal - Simple',
  'Vocal - Complex',
  'Other',
];

export const AddTicScreen = ({ navigation }: Props) => {
  const [selectedType, setSelectedType] = useState('');
  const [severity, setSeverity] = useState('5');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a tic type');
      return;
    }

    const severityNum = parseInt(severity, 10);
    if (isNaN(severityNum) || severityNum < 1 || severityNum > 10) {
      Alert.alert('Error', 'Severity must be between 1 and 10');
      return;
    }

    try {
      const ticsCollection = database.get<Tic>('tics');
      await database.write(async () => {
        await ticsCollection.create((tic: Tic) => {
          tic.type = selectedType;
          tic.severity = severityNum;
          tic.description = description;
          tic.timestamp = Date.now();
          tic.synced = false;
        });
      });

      Alert.alert('Success', 'Tic recorded successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save tic:', error);
      Alert.alert('Error', 'Failed to save tic');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Record a Tic</Text>

      <Text style={styles.label}>Tic Type *</Text>
      <View style={styles.typeContainer}>
        {TIC_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonSelected,
            ]}
            onPress={() => setSelectedType(type)}>
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextSelected,
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Severity (1-10) *</Text>
      <TextInput
        style={styles.input}
        value={severity}
        onChangeText={setSeverity}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="5"
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholder="Add any additional details..."
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Tic</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  typeContainer: {
    marginBottom: 8,
  },
  typeButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 15,
    color: '#333',
  },
  typeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
