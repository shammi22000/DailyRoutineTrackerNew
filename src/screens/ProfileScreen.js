import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFirstUser, deleteAllUsers, saveUser } from '../db/sqlite';
import { useTheme } from '../components/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({});
  const [showDate, setShowDate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getFirstUser();
      if (userData) setUser(userData);
    } catch (error) {
      console.error('Error fetching user data from SQLite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleEdit = () => {
    setForm({ ...user });
    setEditModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled) {
      setForm({ ...form, photoUri: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!form.firstName || !form.userName || !form.password) {
      Alert.alert('Validation', 'First name, username, and password are required.');
      return;
    }

    try {
      await saveUser({ ...form, id: user.id });
      setUser({ ...form, id: user.id });
      setEditModal(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      console.error('Error saving user:', e);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No user data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }} 
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={[styles.edit, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={
            user.photoUri
              ? { uri: user.photoUri }
              : require('../../assets/default_avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: colors.text }]}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={[styles.email, { color: colors.subtext }]}>{user.email}</Text>
      </View>

      <ProfileItem icon="call-outline" label="Mobile" value={user.mobileNumber} colors={colors} />
      <ProfileItem icon="calendar-outline" label="Birthday" value={user.birthDay} colors={colors} />
      <ProfileItem
        icon={user.gender === 'Male' ? 'male-outline' : 'female-outline'}
        label="Gender"
        value={user.gender}
        colors={colors}
      />
      <ProfileItem icon="at-outline" label="Username" value={user.userName} colors={colors} />

     
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.primary }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

   
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>

              <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center', marginBottom: 15 }}>
                <Image
                  source={form.photoUri ? { uri: form.photoUri } : require('../../assets/default_avatar.png')}
                  style={styles.editAvatar}
                />
                <Text style={{ color: colors.primary, marginTop: 6 }}>Change Photo</Text>
              </TouchableOpacity>

              <Input label="First Name" value={form.firstName} onChange={(t) => setForm({ ...form, firstName: t })} colors={colors} />
              <Input label="Last Name" value={form.lastName} onChange={(t) => setForm({ ...form, lastName: t })} colors={colors} />
              <Input label="Email" value={form.email} onChange={(t) => setForm({ ...form, email: t })} colors={colors} />
              <Input label="Mobile Number" value={form.mobileNumber} onChange={(t) => setForm({ ...form, mobileNumber: t })} colors={colors} />
              <Input label="Username" value={form.userName} onChange={(t) => setForm({ ...form, userName: t })} colors={colors} />

              <Text style={[styles.label, { color: colors.subtext }]}>Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.input, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={form.password}
                  onChangeText={(t) => setForm({ ...form, password: t })}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.subtext}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.subtext}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.subtext }]}>Birthday</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border }]}
                onPress={() => setShowDate(true)}
              >
                <Text style={{ color: colors.text }}>{form.birthDay || 'Select Birthday'}</Text>
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker
                  mode="date"
                  value={form.birthDay ? new Date(form.birthDay) : new Date()}
                  onChange={(_, date) => {
                    setShowDate(false);
                    if (date) setForm({ ...form, birthDay: date.toISOString().split('T')[0] });
                  }}
                />
              )}

              <Text style={[styles.label, { color: colors.subtext, marginTop: 10 }]}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderOption,
                      { backgroundColor: form.gender === g ? colors.primary : colors.input },
                    ]}
                    onPress={() => setForm({ ...form, gender: g })}
                  >
                    <Text
                      style={{
                        color: form.gender === g ? '#fff' : colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: '#ccc' }]}
                  onPress={() => setEditModal(false)}
                >
                  <Text style={[styles.saveText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const ProfileItem = ({ icon, label, value, colors }) => (
  <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
    <Ionicons name={icon} size={24} color={colors.primary} style={styles.icon} />
    <View>
      <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value || '-'}</Text>
    </View>
  </View>
);

const Input = ({ label, value, onChange, colors }) => (
  <>
    <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        { backgroundColor: colors.input, color: colors.text, borderColor: colors.border },
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={label}
      placeholderTextColor={colors.subtext}
    />
  </>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '700' },
  edit: { fontSize: 16, fontWeight: '500' },
  avatarContainer: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#ccc' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  email: { fontSize: 15 },
  infoCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { marginRight: 15, padding: 8, borderRadius: 10, backgroundColor: 'rgba(0,122,255,0.1)' },
  label: { fontSize: 13 },
  value: { fontSize: 16, fontWeight: '500' },
  logoutButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginVertical: 30 },
  logoutText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', borderRadius: 20, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15 },
  input: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, marginBottom: 10 },
  passwordInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  genderOption: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveBtn: { flex: 1, marginHorizontal: 5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  editAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' },
});
