import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleSwitch = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const faqs = [
    {
      question: 'How can I add a new activity?',
      answer:
        'Go to the “Activities” tab and tap the “Create New Activity” card. Fill in the details such as name, date, and time, then press Save.',
    },
    {
      question: 'Can I change my theme anytime?',
      answer:
        'Yes, you can switch between Light and Dark themes here in Settings. The app updates instantly without restarting.',
    },
    {
      question: 'How to delete or edit an existing activity?',
      answer:
        'In the Activities list, tap the edit (✏️) icon to modify or the trash (🗑️) icon to delete any activity you’ve added.',
    },
    {
      question: 'What does “Pending” and “Done” status mean?',
      answer:
        'Pending means a task is still active. Once you complete it, tap the task to mark it as Done, and it will show as completed in your progress.',
    },
    {
      question: 'Where is my data saved?',
      answer:
        'All data is securely stored locally on your device using SQLite. Future versions will include cloud sync options.',
    },
  ];

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

       
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Ionicons
              name={theme === 'light' ? 'sunny' : 'moon'}
              size={26}
              color={colors.primary}
            />
            <Text style={[styles.label, { color: colors.text }]}>App Theme</Text>
            <View style={{ flex: 1 }} />
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleSwitch}
              thumbColor={theme === 'dark' ? '#fff' : '#007AFF'}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
            />
          </View>
          <Text style={[styles.description, { color: colors.subtext }]}>
            Switch between Light and Dark mode instantly.
          </Text>
        </View>

      
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <Ionicons name="help-circle-outline" size={26} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text }]}>FAQ</Text>
          </View>

          {faqs.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpand(index)}
              >
                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                  {item.question}
                </Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <Text style={[styles.faqAnswer, { color: colors.subtext }]}>
                  {item.answer}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'left',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  description: { fontSize: 13, marginTop: 8 },
  faqItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { fontSize: 15, fontWeight: '600', flex: 1, paddingRight: 10 },
  faqAnswer: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
});
