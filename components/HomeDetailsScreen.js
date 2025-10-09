import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HomeDetailsScreen({ onBack, name, onAddActivity }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.logoText}>DAILY ROUTING TRACKER</Text>
      </View>
      <Text style={styles.hello}>Hello, {name}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonIcon}>{'👤'}</Text>
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddActivity}>
        <Text style={styles.buttonIcon}>{'➕'}</Text>
        <Text style={styles.buttonText}>Add new Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonIcon}>{'🔄'}</Text>
        <Text style={styles.buttonText}>Activity Status</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonIcon}>{'⭐'}</Text>
        <Text style={styles.buttonText}>Activity List</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonIcon}>{'⚙️'}</Text>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4ffd4',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b3b17',
    letterSpacing: 1,
  },
  hello: {
    fontSize: 22,
    fontWeight: '500',
    color: '#222',
    marginBottom: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc40',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 6,
    width: 240,
    justifyContent: 'flex-start',
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#0b3b17',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 18,
    padding: 8,
  },
  backButtonText: {
    color: '#2ecc40',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
