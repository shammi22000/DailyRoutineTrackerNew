import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#cce0ff',
        tabBarBackground: () => (
          <LinearGradient
            colors={['#007AFF', '#005BBB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'android' ? 65 + insets.bottom : 80,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 8,
          backgroundColor: 'transparent',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Activity') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
