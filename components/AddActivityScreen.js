import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Picker } from 'react-native';

export default function AddActivityScreen({ onBack }) {
  const [activityName, setActivityName] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [reminder, setReminder] = useState(null);
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backArrow}>
          <Text style={{ fontSize: 22 }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{'✳️ Add New Activity'}</Text>
      </View>
      <Text style={styles.label}>Activity Name</Text>
      <TextInput
        style={styles.input}
        value={activityName}
        onChangeText={setActivityName}
        placeholder="Activity Name"
      />
      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerWrapper}>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Type"
        />
        {/* Replace with Picker if needed */}
      </View>
      <Text style={styles.label}>Duration</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Duration"
      />
      <Text style={styles.label}>Reminder</Text>
      <View style={styles.reminderRow}>
        <TouchableOpacity onPress={() => setReminder(true)} style={styles.radioWrap}>
          <View style={[styles.radio, reminder === true && styles.radioSelected]} />
          <Text style={styles.radioLabel}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setReminder(false)} style={styles.radioWrap}>
          <View style={[styles.radio, reminder === false && styles.radioSelected]} />
          <Text style={styles.radioLabel}>No</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        multiline
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4ffd4',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backArrow: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  pickerWrapper: {
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 6,
  },
  radioSelected: {
    borderColor: '#2ecc40',
    backgroundColor: '#eaffea',
  },
  radioLabel: {
    fontSize: 16,
    color: '#222',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  saveButton: {
    backgroundColor: '#355e1c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
