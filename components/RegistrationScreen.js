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

export default function RegistrationScreen({ onBack }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [agree, setAgree] = useState(false);

  function handleSignUp() {
    if (!fullName || !email || !password || !dob || !gender || !agree) {
      Alert.alert('Missing fields', 'Please fill all fields and agree to terms');
      return;
    }
    Alert.alert('Sign Up', `Welcome, ${fullName}!`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.emojiLogo}>
            <Text style={styles.emoji}>👍</Text>
          </View>
          <Text style={styles.title}>Create your account</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholder=""
              placeholderTextColor="#999"
            />
            <View style={styles.genderRow}>
              <TouchableOpacity style={styles.genderOption} onPress={() => setGender('male')}>
                <View style={[styles.radio, gender === 'male' && styles.radioSelected]} />
                <Text style={styles.genderLabel}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.genderOption} onPress={() => setGender('female')}>
                <View style={[styles.radio, gender === 'female' && styles.radioSelected]} />
                <Text style={styles.genderLabel}>Female</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setAgree(!agree)} style={styles.checkboxBox}>
                <View style={[styles.checkbox, agree && styles.checkboxChecked]} />
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>I agree to the Terms of service and Privacy Policy</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <Pressable onPress={onBack} style={styles.backLink}>
              <Text style={styles.signup}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#dfffe8' },
  container: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 36 },
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
  title: { fontSize: 22, fontWeight: '700', color: '#0b3b17', alignSelf: 'center', marginBottom: 12 },
  form: { width: '86%', alignItems: 'center', marginTop: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#0b3b17', alignSelf: 'flex-start', marginLeft: 6, marginTop: 10 },
  input: { width: '100%', height: 44, backgroundColor: '#e6e6e6', borderRadius: 10, paddingHorizontal: 14, marginTop: 6 },
  genderRow: { flexDirection: 'row', justifyContent: 'flex-start', width: '100%', marginTop: 8, marginBottom: 8 },
  genderOption: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#bbb', marginRight: 6, backgroundColor: '#fff' },
  radioSelected: { borderColor: '#3f5a24', backgroundColor: '#cdeac0' },
  genderLabel: { fontSize: 16, color: '#0b3b17' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8, width: '100%' },
  checkboxBox: { marginRight: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#bbb', backgroundColor: '#fff' },
  checkboxChecked: { borderColor: '#3f5a24', backgroundColor: '#cdeac0' },
  checkboxLabel: { fontSize: 14, color: '#222', flex: 1, flexWrap: 'wrap' },
  button: { width: '60%', height: 44, backgroundColor: '#3f5a24', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 18, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 16 },
  signup: { color: '#0b3b17', textDecorationLine: 'underline', fontWeight: '600', marginTop: 18 },
  backLink: { marginTop: 10 },
});
