import React, { useState } from 'react';
import RegistrationScreen from './components/RegistrationScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import HomeDetailsScreen from './components/HomeDetailsScreen';
import AddActivityScreen from './components/AddActivityScreen';

import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const [showHomeDetails, setShowHomeDetails] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  
  const [userEmail, setUserEmail] = useState('');

  function handleLogin(email, password) {
    const validEmail = 'test@gmail.com';
    const validPassword = 'admin123';
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    if (email === validEmail && password === validPassword) {
      setUserEmail(email);
      setShowHome(true);
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  }

  if (showRegister) {
      return <RegistrationScreen onBack={() => setShowRegister(false)} />;
    }

  if (showAddActivity) {
      return <AddActivityScreen onBack={() => setShowAddActivity(false)} />;
    }
  
    if (showHomeDetails) {
      const name = userEmail.split('@')[0].toUpperCase();
      return (
        <HomeDetailsScreen
          name={name}
          onBack={() => setShowHomeDetails(false)}
          onAddActivity={() => setShowAddActivity(true)}
        />
      );
    }
    
  if (showHome) {
    return <HomeScreen email={userEmail} onHomePress={() => setShowHomeDetails(true)} />;
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onShowRegister={() => setShowRegister(true)}
    />
  );
}

