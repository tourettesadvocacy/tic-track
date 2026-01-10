/**
 * EventLogger component - Event capture form
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { EventType } from '../types/events';
import { createEvent } from '../services/localStorage';
import { toISOString, formatDuration, calculateDuration } from '../utils/datetime';

const COLORS = {
  background: '#C1D9D6',
  text: '#20736A',
  buttonText: '#F2F2F2',
  primaryButton: '#D99923',
  dangerButton: '#DB3238',
  accentActive: '#FFC300',
  placeholder: 'rgba(32, 115, 106, 0.55)',
};

interface EventLoggerProps {
  onEventSaved: () => void;
  onCancel: () => void;
}

export const EventLogger: React.FC<EventLoggerProps> = ({ onEventSaved, onCancel }) => {
  const [eventType, setEventType] = useState<EventType>('tic');
  const [description, setDescription] = useState('');
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update live duration counter for active events
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - startDate.getTime()) / 1000);
        setCurrentDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isActive, startDate]);

  const handleEndEvent = () => {
    setEndDate(new Date());
    setIsActive(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const started_at = toISOString(startDate);
      const ended_at = endDate ? toISOString(endDate) : null;
      const duration_seconds = ended_at
        ? calculateDuration(started_at, ended_at)
        : null;

      await createEvent(
        eventType,
        started_at,
        ended_at,
        description || null,
        triggers || null,
        notes || null,
        duration_seconds
      );

      onEventSaved();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Event Type Selector */}
        <Text style={styles.label}>Event Type *</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, eventType === 'tic' && styles.radioButtonActive]}
            onPress={() => setEventType('tic')}
          >
            <Text style={[styles.radioText, eventType === 'tic' && styles.radioTextActive]}>
              Tic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, eventType === 'emotional' && styles.radioButtonActive]}
            onPress={() => setEventType('emotional')}
          >
            <Text style={[styles.radioText, eventType === 'emotional' && styles.radioTextActive]}>
              Emotional
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, eventType === 'combined' && styles.radioButtonActive]}
            onPress={() => setEventType('combined')}
          >
            <Text style={[styles.radioText, eventType === 'combined' && styles.radioTextActive]}>
              Combined
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start Time */}
        <Text style={styles.label}>Start Time *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {startDate.toLocaleString()}
          </Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) {
                setStartDate(date);
              }
            }}
          />
        )}

        {/* Duration Display */}
        {isActive && (
          <View style={styles.durationDisplay}>
            <MaterialIcons name="timer" size={24} color={COLORS.accentActive} />
            <Text style={styles.durationText}>
              Duration: {formatDuration(currentDuration)}
            </Text>
          </View>
        )}

        {/* End Event Button */}
        {isActive && (
          <TouchableOpacity style={styles.endButton} onPress={handleEndEvent}>
            <MaterialIcons name="stop" size={20} color={COLORS.buttonText} />
            <Text style={styles.endButtonText}>End Event</Text>
          </TouchableOpacity>
        )}

        {/* End Time (if ended) */}
        {endDate && (
          <>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {endDate.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event, date) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (date) {
                    setEndDate(date);
                  }
                }}
              />
            )}

            <View style={styles.durationDisplay}>
              <Text style={styles.durationText}>
                Duration: {formatDuration(calculateDuration(toISOString(startDate), toISOString(endDate)))}
              </Text>
            </View>
          </>
        )}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the event..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          numberOfLines={3}
        />

        {/* Triggers */}
        <Text style={styles.label}>Triggers</Text>
        <TextInput
          style={styles.input}
          value={triggers}
          onChangeText={setTriggers}
          placeholder="What set off this event?"
          placeholderTextColor={COLORS.placeholder}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          numberOfLines={3}
        />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <MaterialIcons name="save" size={20} color={COLORS.buttonText} />
            <Text style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.placeholder,
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: COLORS.accentActive,
    backgroundColor: 'rgba(255, 195, 0, 0.2)',
  },
  radioText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  radioTextActive: {
    color: COLORS.accentActive,
    fontWeight: '700',
  },
  dateButton: {
    backgroundColor: 'rgba(32, 115, 106, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.placeholder,
  },
  dateButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(32, 115, 106, 0.1)',
    color: COLORS.text,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.placeholder,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 195, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  durationText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerButton,
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  endButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(32, 115, 106, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(32, 115, 106, 0.4)',
  },
  saveButton: {
    backgroundColor: COLORS.primaryButton,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});
