import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    onLogin(email, password);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.emojiLogo}>
            <Text style={styles.emoji}>👍</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder=""
              style={styles.input}
              placeholderTextColor="#999"
            />

            <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder=""
              style={styles.input}
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Pressable onPress={() => Alert.alert('Forgot password', 'Reset flow') }>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.normal}>Don't have an account? </Text>
              <Pressable onPress={onShowRegister}>
                <Text style={styles.signup}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#dfffe8', paddingBottom: 56 },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 36,
    paddingBottom: 56,
  },
  emojiLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  form: {
    width: '86%',
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b3b17',
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  button: {
    width: '60%',
    height: 44,
    backgroundColor: '#3f5a24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    color: '#0b3b17',
    marginTop: 18,
    textDecorationLine: 'none',
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
  },
  normal: {
    color: '#0b3b17',
  },
  signup: {
    color: '#0b3b17',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7fff7',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 26,
    color: '#222',
  },
});
