import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AvatarPicker from '../components/AvatarPicker';
import { saveUser } from '../db/sqlite';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    birthDay: '',
    gender: '',
    userName: '',
    password: '',
    confirmPassword: '',
    photoUri: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const progressAnim = new Animated.Value(0);

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;


    const level = score / 5;
    setPasswordStrength(level);

    if (score <= 2) setStrengthLabel('Weak');
    else if (score === 3 || score === 4) setStrengthLabel('Medium');
    else setStrengthLabel('Strong');

    Animated.timing(progressAnim, {
      toValue: level,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleRegister = async () => {
    try {
      if (!form.firstName || !form.userName || !form.password) {
        Alert.alert('Error', 'Please fill all required fields.');
        return;
      }

      if (passwordStrength < 0.6) {
        Alert.alert('Weak Password', 'Please create a stronger password.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }

      await saveUser(form);
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');
    } catch (error) {
      console.error('Register failed', error);
      Alert.alert('Error', 'Failed to register user.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setForm({ ...form, birthDay: formatted });
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('../../assets/bg_7.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

    
      <View style={styles.overlay} />

    
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Create Account</Text>

        <AvatarPicker onPick={(uri) => setForm({ ...form, photoUri: uri })} />

      
        <View style={styles.row}>
          <TextInput
            placeholder="First Name"
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            onChangeText={(v) => setForm({ ...form, firstName: v })}
            placeholderTextColor="#bbb"
          />
          <TextInput
            placeholder="Last Name"
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            onChangeText={(v) => setForm({ ...form, lastName: v })}
            placeholderTextColor="#bbb"
          />
        </View>

        <TextInput
          placeholder="you@example.com"
          style={styles.input}
          keyboardType="email-address"
          onChangeText={(v) => setForm({ ...form, email: v })}
          placeholderTextColor="#bbb"
        />
        <TextInput
          placeholder="+1 (555) 000-0000"
          style={styles.input}
          keyboardType="phone-pad"
          onChangeText={(v) => setForm({ ...form, mobileNumber: v })}
          placeholderTextColor="#bbb"
        />

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            style={[styles.input, { flex: 1, marginRight: 8, justifyContent: 'center' }]}
          >
            <Text style={{ color: form.birthDay ? '#fff' : '#bbb', fontSize: 16 }}>
              {form.birthDay ? form.birthDay : 'Birth date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={form.birthDay ? new Date(form.birthDay) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={[styles.input, { flex: 1, marginLeft: 8, padding: 0 }]}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v })}
              style={{ height: 50, color: '#fff' }}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Gender" value="" color="#bbb" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <TextInput
          placeholder="Username"
          style={styles.input}
          onChangeText={(v) => setForm({ ...form, userName: v })}
          placeholderTextColor="#bbb"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Create a strong password"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            onChangeText={(v) => {
              setForm({ ...form, password: v });
              evaluatePasswordStrength(v);
            }}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#bbb"
            />
          </TouchableOpacity>
        </View>

      
        {form.password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarBackground}>
              <Animated.View
                style={[
                  styles.strengthBarFill,
                  {
                    width: `${passwordStrength * 100}%`,
                    backgroundColor:
                      passwordStrength < 0.4
                        ? '#ff4d4d'
                        : passwordStrength < 0.8
                        ? '#ffd11a'
                        : '#33cc33',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.strengthLabel,
                {
                  color:
                    passwordStrength < 0.4
                      ? '#ff4d4d'
                      : passwordStrength < 0.8
                      ? '#ffd11a'
                      : '#33cc33',
                },
              ]}
            >
              {strengthLabel}
            </Text>
          </View>
        )}

 
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Re-enter password"
            style={styles.passwordInput}
            secureTextEntry={!showConfirmPassword}
            onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#bbb"
            />
          </TouchableOpacity>
        </View>

    
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>


        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  innerContainer: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 40,
    color: '#fff',
  },
  row: { flexDirection: 'row', width: '100%' },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  eyeIcon: { padding: 10 },
  strengthContainer: {
    width: '100%',
    marginBottom: 14,
  },
  strengthBarBackground: {
    width: '100%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 4,
  },
  strengthLabel: {
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'right',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  bottomTextContainer: { flexDirection: 'row', marginTop: 25, marginBottom: 40 },
  bottomText: { color: '#eee', fontSize: 15 },
  loginLink: { color: '#FFD700', fontWeight: '600', fontSize: 15 },
});
