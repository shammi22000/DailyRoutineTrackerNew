import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { Video } from "expo-av";
import { getAllActivities, updateActivity, deleteActivity } from "../db/sqlite";
import { useTheme } from "../components/ThemeContext";

const { width } = Dimensions.get("window");
const formatDate = (date) => date.toISOString().split("T")[0];
const daysBefore = 180;
const daysAfter = 180;

export default function HomeScreen({ route }) {
  const { user } = route.params;
  const userId = user?.id;
  const { colors } = useTheme();

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [allDates, setAllDates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState("");
  const [monthLabel, setMonthLabel] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showTodayButton, setShowTodayButton] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const quotes = useMemo(
    () => [
      "Great effort! Keep up the streak.",
      "Progress, not perfection.",
      "Small steps every day.",
      "Stay consistent and shine.",
      "Discipline beats motivation.",
    ],
    []
  );

  // ✅ Prepare dates and greeting
  useEffect(() => {
    const today = new Date();
    const hour = today.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const dates = [];
    for (let i = -daysBefore; i <= daysAfter; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(new Date(d));
    }

    setAllDates(dates);
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    
    setTimeout(() => {
      const idx = dates.findIndex((d) => formatDate(d) === todayStr);
      if (flatListRef.current && idx >= 0) {
        flatListRef.current.scrollToIndex({
          index: Math.max(idx - 2, 0),
          animated: false,
        });
      }
    }, 400);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  useEffect(() => {
    filterByDate();
  }, [selectedDate, activities]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const loadActivities = async () => {
    try {
      const data = await getAllActivities(userId);
      setActivities(data || []);
    } catch (e) {
      console.error("loadActivities error:", e);
    }
  };


  const filterByDate = () => {
    const now = new Date();
    const updated = activities.map((a) => {
      if (a.status !== "Done" && a.endTime) {
        const end = new Date(`${a.date}T${a.endTime}`);
        if (end < now) return { ...a, status: "Missed" };
      }
      return a;
    });

    const daily = updated.filter((a) => a.date === selectedDate);
    setFilteredActivities(daily);
    const doneCount = daily.filter((a) => a.status === "Done").length;
    setProgress(daily.length > 0 ? (doneCount / daily.length) * 100 : 0);

    const d = new Date(selectedDate);
    setMonthLabel(
      d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    );
    setShowTodayButton(selectedDate !== formatDate(new Date()));
  };

  const handleStatusToggle = async (item) => {
    if (item.status === "Missed") return;
    const newStatus = item.status === "Pending" ? "Done" : "Pending";
    await updateActivity(item.id, { ...item, status: newStatus });
    await loadActivities();
  };

  const handleDelete = async (item) => {
    Alert.alert("Delete", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity(item.id);
          await loadActivities();
        },
      },
    ]);
  };

  // ✅ Scroll to today & center visually
  const scrollToToday = (animated = true) => {
    if (!flatListRef.current || allDates.length === 0) return;
    const today = new Date();
    const todayStr = formatDate(today);
    const index = allDates.findIndex((d) => formatDate(d) === todayStr);
    if (index >= 0) {
      try {
        flatListRef.current.scrollToIndex({
          index: Math.max(index - 2, 0),
          animated,
        });
        setSelectedDate(todayStr);
      } catch (e) {
        console.warn("scrollToToday failed:", e.message);
      }
    }
  };

  const onScrollToIndexFailed = (info) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: Math.min(info.index, allDates.length - 1),
        animated: true,
      });
    }, 300);
  };

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const ProgressCircle = ({ size = 160, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const animatedStroke = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
    });
    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor="#43e438ff" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Circle
            stroke="#e0e0e0"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            stroke="url(#grad)"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedStroke}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    );
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDelete(item)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderTask = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={[
          styles.taskCard,
          { backgroundColor: colors.card },
          item.status === "Done" && { backgroundColor: "#153C3C" },
          item.status === "Missed" && { backgroundColor: "#3b0a0a" },
        ]}
        onPress={() => handleStatusToggle(item)}
      >
        <View style={styles.taskLeft}>
          <Ionicons
            name={
              item.status === "Done"
                ? "checkmark-circle"
                : item.status === "Missed"
                ? "alert-circle"
                : "time-outline"
            }
            size={26}
            color={
              item.status === "Done"
                ? "#00C853"
                : item.status === "Missed"
                ? "#FF3B30"
                : colors.primary
            }
          />
          <View style={{ marginLeft: 10 }}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color:
                    item.status === "Missed" ? "#FF3B30" : colors.text,
                  textDecorationLine:
                    item.status === "Missed" ? "line-through" : "none",
                },
              ]}
            >
              {item.name}
            </Text>
            <Text style={[styles.taskSub, { color: colors.subtext }]}>
              {item.startTime} - {item.endTime}
            </Text>
            <Text style={[styles.taskSub, { color: colors.subtext }]}>
              {item.category} • {item.priority}
            </Text>
            {item.status === "Missed" && (
              <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                ⚠️ Missed
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderDay = ({ item }) => {
    const dateStr = formatDate(item);
    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === formatDate(new Date());
    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isToday && { borderColor: "#43e438ff", borderWidth: 2 },
          isSelected && { backgroundColor: colors.primary },
        ]}
        onPress={() => setSelectedDate(dateStr)}
      >
        <Text
          style={[
            styles.dayText,
            { color: isSelected ? "#fff" : colors.subtext },
          ]}
        >
          {item.toLocaleDateString("en-US", { weekday: "short" })}
        </Text>
        <Text
          style={[
            styles.dateText,
            { color: isSelected ? "#fff" : colors.text },
          ]}
        >
          {item.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Background Video */}
        <View style={styles.headerContainer}>
          <Video
            source={require("../../assets/bg_home.mp4")}
            style={StyleSheet.absoluteFillObject}
            shouldPlay
            isLooping
            resizeMode="cover"
            isMuted
          />
          <View style={styles.headerOverlay}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.greetingText, { color: "#fff" }]}>
                  {greeting},
                </Text>
                <Text style={[styles.userName, { color: "#fff" }]}>
                  {user.firstName}
                </Text>
              </View>
              <Image
                source={
                  user.photoUri
                    ? { uri: user.photoUri }
                    : require("../../assets/profile.png")
                }
                style={styles.profileImage}
              />
            </View>
          </View>
        </View>

        <Text style={[styles.monthLabel, { color: colors.subtext }]}>
          {monthLabel}
        </Text>

        <View style={styles.calendarContainer}>
          <FlatList
            ref={flatListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allDates}
            keyExtractor={(item) => formatDate(item)}
            renderItem={renderDay}
            getItemLayout={(_, index) => ({
              length: 70,
              offset: 70 * index,
              index,
            })}
            onScrollToIndexFailed={onScrollToIndexFailed}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />
        </View>

        {showTodayButton && (
          <TouchableOpacity
            style={[styles.goTodayButton, { backgroundColor: colors.primary }]}
            onPress={() => scrollToToday(true)}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.goTodayText}> Go to Today</Text>
          </TouchableOpacity>
        )}

        <View style={styles.progressWrapper}>
          <ProgressCircle />
          <Text style={[styles.progressLabel, { color: colors.subtext }]}>
            {quote}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasks</Text>
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/no-data.gif")}
              style={styles.emptyImage}
            />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No tasks for this date.
            </Text>
          </View>
        ) : (
          filteredActivities.map((item) => (
            <View key={item.id}>{renderTask({ item })}</View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  headerContainer: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: { fontSize: 22, fontWeight: "600" },
  userName: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
  },
  monthLabel: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  calendarContainer: {
    marginVertical: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    marginHorizontal: 20,
  },
  dayItem: {
    width: 60,
    height: 75,
    marginHorizontal: 5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 13, fontWeight: "500" },
  dateText: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  goTodayButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  goTodayText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  progressWrapper: { alignItems: "center", marginVertical: 20 },
  progressContainer: { alignItems: "center", justifyContent: "center" },
  progressText: { position: "absolute", fontSize: 26, fontWeight: "700" },
  progressLabel: { fontSize: 15, fontStyle: "italic", textAlign: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  taskLeft: { flexDirection: "row", alignItems: "center" },
  taskTitle: { fontSize: 16, fontWeight: "700" },
  taskSub: { fontSize: 13 },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 14,
  },
  emptyState: { alignItems: "center", marginTop: 20 },
  emptyImage: { width: 150, height: 150, opacity: 0.7, marginBottom: 15 },
  emptyText: { textAlign: "center", fontSize: 16 },
});
