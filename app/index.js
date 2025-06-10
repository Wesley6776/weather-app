// Import error suppressor first, before any other imports
import '../errorSuppressor';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';

// Import screens
import AboutScreen from '../components/screens/AboutScreen';
import SettingsScreen from '../components/screens/SettingsScreen';
import WeatherScreen from '../components/screens/WeatherScreen';

const Tab = createBottomTabNavigator();

// Safely wrapped icon component
const TabIcon = ({ name, color, size }) => (
  <View>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

// Safely wrapped label component
const TabLabel = ({ label, color }) => (
  <Text style={{ color, fontSize: 12 }}>{label}</Text>
);

export default function App() {
  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#0096c7',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen 
            name="Weather" 
            component={WeatherScreen} 
            options={{
              tabBarIcon: ({color, size, focused}) => (
                <TabIcon name={focused ? "cloud" : "cloud-outline"} color={color} size={size} />
              ),
              tabBarLabel: ({color}) => <TabLabel label="Weather" color={color} />
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{
              tabBarIcon: ({color, size, focused}) => (
                <TabIcon name={focused ? "settings" : "settings-outline"} color={color} size={size} />
              ),
              tabBarLabel: ({color}) => <TabLabel label="Settings" color={color} />
            }}
          />
          <Tab.Screen 
            name="About" 
            component={AboutScreen} 
            options={{
              tabBarIcon: ({color, size, focused}) => (
                <TabIcon name={focused ? "information-circle" : "information-circle-outline"} color={color} size={size} />
              ),
              tabBarLabel: ({color}) => <TabLabel label="About" color={color} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
