import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDB } from '../db/sqlite';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';

export default function LoginScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [userData, setUserData] = useState(null);

  const showSuccessAlert = (message, user) => {
    setModalMessage(message);
    setUserData(user);
    setSuccessModal(true);
  };

  const showErrorAlert = (message) => {
    setModalMessage(message);
    setErrorModal(true);
  };

  const handleLogin = async () => {
    try {
      const db = await getDB();
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE (userName = ? OR email = ?) AND password = ?',
        [userName, userName, password]
      );

      if (result) {
        showSuccessAlert(`Welcome ${result.firstName}!`, result);
      } else {
        showErrorAlert('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error', err);
      showErrorAlert('Failed to login. Please try again.');
    }
  };

  const handleSuccessContinue = () => {
    setSuccessModal(false);
    navigation.replace('Main', { screen: 'Home', params: { user: userData } });
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
          <Text style={styles.bottomText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={styles.signUpLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={successModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleSuccessContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#4CD964" />
              </View>
            </View>
            
            <Text style={styles.successModalTitle}>
              Login Success!
            </Text>
            
            <Text style={styles.successModalMessage}>
              {modalMessage}
            </Text>

            <TouchableOpacity
              style={styles.successModalButton}
              onPress={handleSuccessContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.successModalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={errorModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContainer}>
            <View style={styles.errorIconContainer}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="alert-circle" size={48} color="#FF3B30" />
              </View>
            </View>
            
            <Text style={styles.errorModalTitle}>
              Login Failed
            </Text>
            
            <Text style={styles.errorModalMessage}>
              {modalMessage}
            </Text>

            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setErrorModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.errorModalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Success Modal Styles
  successModalContainer: {
    width: '85%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.2)',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(76, 217, 100, 0.3)',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  successModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    color: '#CCCCCC',
  },
  successModalButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Error Modal Styles.
  errorModalContainer: {
    width: '85%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  errorModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    color: '#CCCCCC',
  },
  errorModalButton: {
    width: '100%',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
