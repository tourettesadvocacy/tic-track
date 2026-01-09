import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { database } from '../database';
import { syncService } from '../services/SyncService';

interface TicItem {
  id: string;
  type: string;
  severity: number;
  description?: string;
  timestamp: number;
  synced: boolean;
}

export const HomeScreen = ({ navigation }: any) => {
  const [tics, setTics] = useState<TicItem[]>([]);
  const [emotions, setEmotions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ticsCollection = database.get('tics');
      const emotionsCollection = database.get('emotions');
      
      const allTics = await ticsCollection.query().fetch();
      const allEmotions = await emotionsCollection.query().fetch();
      
      setTics(allTics.map((tic: any) => ({
        id: tic.id,
        type: tic.type,
        severity: tic.severity,
        description: tic.description,
        timestamp: tic.timestamp,
        synced: tic.synced,
      })));
      
      setEmotions(allEmotions.map((emotion: any) => ({
        id: emotion.id,
        emotionType: emotion.emotionType,
        intensity: emotion.intensity,
        notes: emotion.notes,
        timestamp: emotion.timestamp,
        synced: emotion.synced,
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSync = async () => {
    try {
      await syncService.syncAll();
      Alert.alert('Success', 'Data synced to Azure');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const renderTicItem = ({ item }: { item: TicItem }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.type}</Text>
      <Text style={styles.itemDetail}>Severity: {item.severity}/10</Text>
      {item.description && <Text style={styles.itemDetail}>{item.description}</Text>}
      <Text style={styles.itemDate}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={[styles.syncStatus, item.synced && styles.synced]}>
        {item.synced ? '✓ Synced' : '○ Not synced'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Tic Track</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddTic')}>
          <Text style={styles.buttonText}>Add Tic</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddEmotion')}>
          <Text style={styles.buttonText}>Add Emotion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={handleSync}>
          <Text style={styles.buttonText}>Sync to Azure</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{tics.length}</Text>
          <Text style={styles.statLabel}>Tics</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{emotions.length}</Text>
          <Text style={styles.statLabel}>Emotions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {tics.filter(t => !t.synced).length + emotions.filter(e => !e.synced).length}
          </Text>
          <Text style={styles.statLabel}>Unsynced</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Recent Tics</Text>
      <FlatList
        data={tics.slice(0, 5)}
        renderItem={renderTicItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tics recorded yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  syncButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  syncStatus: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
  },
  synced: {
    color: '#34C759',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
  },
});
