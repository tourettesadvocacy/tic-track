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
import Emotion from '../database/models/Emotion';

type RootStackParamList = {
  Home: undefined;
  AddTic: undefined;
  AddEmotion: undefined;
  Settings: undefined;
};

type AddEmotionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEmotion'>;

interface Props {
  navigation: AddEmotionScreenNavigationProp;
}

const EMOTION_TYPES = [
  'Happy',
  'Sad',
  'Anxious',
  'Angry',
  'Calm',
  'Frustrated',
  'Excited',
  'Stressed',
];

export const AddEmotionScreen = ({ navigation }: Props) => {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [intensity, setIntensity] = useState('5');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!selectedEmotion) {
      Alert.alert('Error', 'Please select an emotion');
      return;
    }

    const intensityNum = parseInt(intensity, 10);
    if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 10) {
      Alert.alert('Error', 'Intensity must be between 1 and 10');
      return;
    }

    try {
      const emotionsCollection = database.get<Emotion>('emotions');
      await database.write(async () => {
        await emotionsCollection.create((emotion: Emotion) => {
          emotion.emotionType = selectedEmotion;
          emotion.intensity = intensityNum;
          emotion.notes = notes;
          emotion.timestamp = Date.now();
          emotion.synced = false;
        });
      });

      Alert.alert('Success', 'Emotion recorded successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save emotion:', error);
      Alert.alert('Error', 'Failed to save emotion');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Record an Emotion</Text>

      <Text style={styles.label}>Emotion Type *</Text>
      <View style={styles.emotionContainer}>
        {EMOTION_TYPES.map((emotion) => (
          <TouchableOpacity
            key={emotion}
            style={[
              styles.emotionButton,
              selectedEmotion === emotion && styles.emotionButtonSelected,
            ]}
            onPress={() => setSelectedEmotion(emotion)}>
            <Text
              style={[
                styles.emotionButtonText,
                selectedEmotion === emotion && styles.emotionButtonTextSelected,
              ]}>
              {emotion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Intensity (1-10) *</Text>
      <TextInput
        style={styles.input}
        value={intensity}
        onChangeText={setIntensity}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="5"
      />

      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        placeholder="Add any additional notes..."
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Emotion</Text>
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
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  emotionButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emotionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emotionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  emotionButtonTextSelected: {
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
