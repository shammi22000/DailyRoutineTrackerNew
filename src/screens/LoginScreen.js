import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDB } from '../db/sqlite';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';

export default function LoginScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const db = await getDB();
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE (userName = ? OR email = ?) AND password = ?',
        [userName, userName, password]
      );

      if (result) {
        Alert.alert('Login Success', `Welcome ${result.firstName}`);
        navigation.replace('Main', { screen: 'Home', params: { user: result } });
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error', err);
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background video */}
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

      <View style={styles.innerContainer}>

        <View style={styles.gifContainer}>
          <Image
            source={require('../../assets/login_users.gif')}
            style={styles.gif}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.inputContainer}>
   
          <TextInput
            placeholder="Username or Email"
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholderTextColor="#ccc"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={22}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={styles.signUpLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', //video eke darkness eka
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gifContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  gif: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    color: '#fff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 6,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#FFD700',
    fontWeight: '500',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  bottomText: {
    color: '#ddd',
    fontSize: 15,
  },
  signUpLink: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 15,
  },
});
