import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-get-random-values';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddTicScreen } from './src/screens/AddTicScreen';
import { AddEmotionScreen } from './src/screens/AddEmotionScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { azureStorageService } from './src/services/AzureStorageService';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  useEffect(() => {
    // Initialize Azure Storage Service
    azureStorageService.initialize().catch(error => {
      console.log('Azure Storage not configured yet:', error);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Tic Track' }}
        />
        <Stack.Screen
          name="AddTic"
          component={AddTicScreen}
          options={{ title: 'Add Tic' }}
        />
        <Stack.Screen
          name="AddEmotion"
          component={AddEmotionScreen}
          options={{ title: 'Add Emotion' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
