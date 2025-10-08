import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ email, onHomePress }) {
  const name = email.split('@')[0];
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={styles.homeHello}>Hello, {name.charAt(0).toUpperCase() + name.slice(1)}</Text>
        <Text style={styles.homeWelcome}>Welcome to</Text>
        <Text style={styles.homeTitle}>Daily Activity Tracker</Text>
        <View style={styles.homeImagePlaceholder} />
        <TouchableOpacity style={styles.homeButton} onPress={onHomePress}>
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
      {/* Bottom Navbar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'🏠'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'💬'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'➕'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'📊'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'📋'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#dfffe8', paddingBottom: 56 },
  homeHello: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b3b17',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 12,
  },
  homeWelcome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b3b17',
    textAlign: 'center',
    marginBottom: 8,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b3b17',
    textAlign: 'center',
    marginBottom: 18,
  },
  homeImagePlaceholder: {
    width: 220,
    height: 140,
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    marginBottom: 24,
    alignSelf: 'center',
  },
  homeButton: {
    width: 120,
    height: 44,
    backgroundColor: '#dfffe8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3f5a24',
  },
  homeButtonText: {
    color: '#0b3b17',
    fontSize: 18,
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
