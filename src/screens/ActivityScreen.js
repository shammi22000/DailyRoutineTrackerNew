import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Notifications from "expo-notifications";
import {
  initDB,
  getAllActivities,
  saveActivity,
  updateActivity,
  deleteActivity,
  getAllCategories,
  saveCategory,
  updateCategory,
  deleteCategory,
  getFirstUser,
} from "../db/sqlite";
import { useTheme } from "../components/ThemeContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ActivityScreen({ route, navigation }) {
  const { theme } = useTheme();
  const routeUser = route?.params?.user || null;
  const [currentUser, setCurrentUser] = useState(routeUser);
  const userId = currentUser?.id || null;
  const [tab, setTab] = useState("activities");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activityModal, setActivityModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formActivity, setFormActivity] = useState(emptyActivity());
  const [formCategory, setFormCategory] = useState(emptyCategory());
  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const mounted = useRef(true);
  const activityAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;

  function emptyActivity() {
    return {
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      status: "Pending",
      category: "",
      priority: "",
      notes: "",
    };
  }

  function emptyCategory() {
    return { name: "", priority: "Medium", notes: "" };
  }

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable notifications.");
      }
    })();
  }, []);

  async function scheduleExpiryNotification(activity) {
    if (!activity.date || !activity.endTime) return;
    try {
      const endDate = new Date(`${activity.date}T${activity.endTime}`);
      const now = new Date();
      if (endDate <= now) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Task Expired",
          body: `"${activity.name}" has expired.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: endDate,
      });
    } catch (e) {
      console.error("Failed to schedule notification:", e);
    }
  }

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        await initDB();
        let u = routeUser;
        if (!u) {
          u = await getFirstUser();
        }
        if (mounted.current) setCurrentUser(u || null);
        if (u?.id) {
          await ensureDefaultCategories(u.id);
          await reloadAll(u.id);
        }
      } catch (e) {
        console.error("ActivityScreen init error:", e);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      reloadAll(userId);
    }, [userId])
  );

  async function ensureDefaultCategories(uid) {
    try {
      const current = await getAllCategories(uid);
      if ((current || []).length === 0) {
        await saveCategory(uid, { name: "Work", priority: "High", notes: "" });
        await saveCategory(uid, { name: "Exercise", priority: "Medium", notes: "" });
        await saveCategory(uid, { name: "Study", priority: "Low", notes: "" });
      }
    } catch (e) {
      console.error("ensureDefaultCategories error", e);
    }
  }

  async function reloadAll(uidParam) {
    const uid = uidParam || userId;
    if (!uid) return;
    try {
      setLoading(true);
      const [acts, cats] = await Promise.all([
        getAllActivities(uid),
        getAllCategories(uid),
      ]);
      if (!mounted.current) return;
      setActivities(Array.isArray(acts) ? acts : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      console.error("reloadAll error", e);
      Alert.alert("Error", "Failed to load local data.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function onSaveActivity() {
    if (!formActivity.name.trim() || !formActivity.date) {
      Alert.alert("Validation", "Activity Name and Date are required.");
      return;
    }
    try {
      if (editing?.type === "activity") {
        await updateActivity(editing.id, formActivity);
      } else {
        await saveActivity(userId, formActivity);
        await scheduleExpiryNotification(formActivity);
      }
      await reloadAll();
      setFormActivity(emptyActivity());
      setEditing(null);
      Animated.timing(activityAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
        setActivityModal(false)
      );
    } catch (e) {
      console.error("onSaveActivity error", e);
      Alert.alert("Error", "Failed to save activity.");
    }
  }

  function onEditActivity(item) {
    setEditing({ type: "activity", id: item.id });
    setFormActivity({
      name: item.name || "",
      date: item.date || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      status: item.status || "Pending",
      category: item.category || "",
      priority: item.priority || "",
      notes: item.notes || "",
    });
    setActivityModal(true);
    Animated.timing(activityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  async function onDeleteActivity(id) {
    Alert.alert("Confirm", "Delete this activity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteActivity(id);
            await reloadAll();
          } catch (e) {
            console.error("deleteActivity error", e);
          }
        },
      },
    ]);
  }

  async function onSaveCategory() {
    if (!formCategory.name.trim()) {
      Alert.alert("Validation", "Category name is required.");
      return;
    }
    try {
      if (editing?.type === "category") {
        await updateCategory(editing.id, formCategory);
      } else {
        await saveCategory(userId, formCategory);
      }
      await reloadAll();
      setFormCategory(emptyCategory());
      setEditing(null);
      Animated.timing(categoryAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
        setCategoryModal(false)
      );
    } catch (e) {
      console.error("onSaveCategory error", e);
      Alert.alert("Error", "Failed to save category.");
    }
  }

  function onEditCategory(item) {
    setEditing({ type: "category", id: item.id });
    setFormCategory({
      name: item.name || "",
      priority: item.priority || "Medium",
      notes: item.notes || "",
    });
    setCategoryModal(true);
    Animated.timing(categoryAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  async function onDeleteCategory(id) {
    Alert.alert("Confirm", "Delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            await reloadAll();
          } catch (e) {
            console.error("deleteCategory error", e);
          }
        },
      },
    ]);
  }

  const onDateChange = (_, d) => {
    setShowDate(false);
    if (d) {
      setFormActivity((a) => ({ ...a, date: d.toISOString().split("T")[0] }));
    }
  };

  const onTimeChange = (field) => (_, t) => {
    if (Platform.OS === "android") {
      field === "startTime" ? setShowStart(false) : setShowEnd(false);
    }
    if (t) {
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      setFormActivity((a) => ({ ...a, [field]: `${hh}:${mm}` }));
    }
  };

  const ActivityItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#333" : "#fff" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            { color: theme === "dark" ? "#fff" : "#000" },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: theme === "dark" ? "#ccc" : "#777" },
          ]}
        >
          {item.date} • {item.startTime || "--"} - {item.endTime || "--"}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: theme === "dark" ? "#aaa" : "#777" },
          ]}
        >
          {item.category || "No category"} • {item.priority || "N/A"} •{" "}
          {item.status || "Pending"}
        </Text>
      </View>
      <View style={styles.cardButtons}>
        <TouchableOpacity onPress={() => onEditActivity(item)}>
          <Ionicons name="create-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteActivity(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CategoryItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#333" : "#fff" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            { color: theme === "dark" ? "#fff" : "#000" },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: theme === "dark" ? "#ccc" : "#777" },
          ]}
        >
          Priority: {item.priority}
        </Text>
        {item.notes ? (
          <Text
            style={[
              styles.cardSubtitle,
              { color: theme === "dark" ? "#aaa" : "#777" },
            ]}
          >
            Notes: {item.notes}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardButtons}>
        <TouchableOpacity onPress={() => onEditCategory(item)}>
          <Ionicons name="create-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteCategory(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme === "dark" ? "#000" : "#f9f9f9",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme === "dark" ? "#000" : "#f9f9f9",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: "#d00", fontWeight: "700", marginBottom: 10 }}>
          No user found. Log in first.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#000" : "#f9f9f9" },
      ]}
    >
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: theme === "dark" ? "#222" : "#fff" },
        ]}
      >
        {["activities", "categories"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text
              style={[
                styles.tabText,
                tab === key && styles.tabTextActive,
                { color: theme === "dark" ? "#fff" : "#000" },
              ]}
            >
              {key === "activities" ? "Activities" : "Categories"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "activities" ? (
        <>
          <TouchableOpacity
            style={styles.newCard}
            onPress={() => {
              setEditing(null);
              setFormActivity(emptyActivity());
              setActivityModal(true);
              activityAnim.setValue(0);
              Animated.timing(activityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            }}
          >
            <Ionicons name="add-circle" size={50} color="#007AFF" />
            <Text style={styles.newTitle}>Add New Activity</Text>
          </TouchableOpacity>

          <FlatList
            data={activities}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item }) => <ActivityItem item={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No activities found.</Text>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.newCard}
            onPress={() => {
              setEditing(null);
              setFormCategory(emptyCategory());
              setCategoryModal(true);
              categoryAnim.setValue(0);
              Animated.timing(categoryAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            }}
          >
            <Ionicons name="add-circle" size={50} color="#007AFF" />
            <Text style={styles.newTitle}>Add New Category</Text>
          </TouchableOpacity>

          <FlatList
            data={categories}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item }) => <CategoryItem item={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No categories found.</Text>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}

      <Modal
        transparent
        visible={activityModal}
        animationType="none"
        onRequestClose={() => {
          Animated.timing(activityAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
            setActivityModal(false)
          );
        }}
      >
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: activityAnim,
                transform: [
                  {
                    scale: activityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  {
                    translateY: activityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalContainerStyled,
                { backgroundColor: theme === "dark" ? "#222" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitleStyled,
                  { color: theme === "dark" ? "#fff" : "#000" },
                ]}
              >
                {editing?.type === "activity" ? "Edit Activity" : "Add Activity"}
              </Text>

              <TextInput
                placeholder="Activity Name"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                style={[
                  styles.inputStyled,
                  {
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8",
                    color: theme === "dark" ? "#fff" : "#000",
                  },
                ]}
                value={formActivity.name}
                onChangeText={(t) => setFormActivity((a) => ({ ...a, name: t }))}
              />

              <TouchableOpacity
                style={[
                  styles.inputStyled,
                  { backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8" },
                ]}
                onPress={() => setShowDate(true)}
              >
                <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  {formActivity.date || "Select Date"}
                </Text>
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker
                  mode="date"
                  value={
                    formActivity.date ? new Date(formActivity.date) : new Date()
                  }
                  onChange={onDateChange}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.inputStyled,
                  { backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8" },
                ]}
                onPress={() => setShowStart(true)}
              >
                <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  {formActivity.startTime || "Select Start Time"}
                </Text>
              </TouchableOpacity>
              {showStart && (
                <DateTimePicker
                  mode="time"
                  is24Hour
                  value={new Date()}
                  onChange={onTimeChange("startTime")}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.inputStyled,
                { backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8" },
                ]}
                onPress={() => setShowEnd(true)}
              >
                <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  {formActivity.endTime || "Select End Time"}
                </Text>
              </TouchableOpacity>
              {showEnd && (
                <DateTimePicker
                  mode="time"
                  is24Hour
                  value={new Date()}
                  onChange={onTimeChange("endTime")}
                />
              )}

              <Text
                style={[
                  styles.label,
                  { color: theme === "dark" ? "#fff" : "#000" },
                ]}
              >
                Select Category
              </Text>
              <View style={styles.dropdown}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.dropdownItem,
                      formActivity.category === c.name && styles.dropdownSelected,
                    ]}
                    onPress={() =>
                      setFormActivity((a) => ({
                        ...a,
                        category: c.name,
                        priority: c.priority,
                      }))
                    }
                  >
                    <Text
                      style={{
                        color:
                          formActivity.category === c.name ? "#fff" : "#007AFF",
                        fontWeight: "600",
                      }}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Priority (auto from category)"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                style={[
                  styles.inputStyled,
                  {
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8",
                    color: theme === "dark" ? "#bbb" : "#666",
                  },
                ]}
                value={formActivity.priority}
                editable={false}
              />

              <TextInput
                placeholder="Notes"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                style={[
                  styles.inputStyled,
                  {
                    height: 80,
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8",
                    color: theme === "dark" ? "#fff" : "#000",
                  },
                ]}
                multiline
                value={formActivity.notes}
                onChangeText={(t) => setFormActivity((a) => ({ ...a, notes: t }))}
              />

              <View style={styles.modalButtonsStyled}>
                <TouchableOpacity style={styles.saveBtnStyled} onPress={onSaveActivity}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtnStyled}
                  onPress={() =>
                    Animated.timing(activityAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
                      setActivityModal(false)
                    )
                  }
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <Modal
        transparent
        visible={categoryModal}
        animationType="none"
        onRequestClose={() => {
          Animated.timing(categoryAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
            setCategoryModal(false)
          );
        }}
      >
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: categoryAnim,
                transform: [
                  {
                    scale: categoryAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  {
                    translateY: categoryAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalContainerStyled,
                { backgroundColor: theme === "dark" ? "#222" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitleStyled,
                  { color: theme === "dark" ? "#fff" : "#000" },
                ]}
              >
                {editing?.type === "category" ? "Edit Category" : "Add Category"}
              </Text>

              <TextInput
                placeholder="Category Name"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                style={[
                  styles.inputStyled,
                  {
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8",
                    color: theme === "dark" ? "#fff" : "#000",
                  },
                ]}
                value={formCategory.name}
                onChangeText={(t) => setFormCategory((c) => ({ ...c, name: t }))}
              />

              <Text
                style={[
                  styles.label,
                  { color: theme === "dark" ? "#fff" : "#000" },
                ]}
              >
                Priority
              </Text>
              <View style={styles.dropdown}>
                {["High", "Medium", "Low"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.dropdownItem,
                      formCategory.priority === p && styles.dropdownSelected,
                    ]}
                    onPress={() =>
                      setFormCategory((c) => ({ ...c, priority: p }))
                    }
                  >
                    <Text
                      style={{
                        color: formCategory.priority === p ? "#fff" : "#007AFF",
                        fontWeight: "600",
                      }}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Notes"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                style={[
                  styles.inputStyled,
                  {
                    height: 80,
                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f8f8",
                    color: theme === "dark" ? "#fff" : "#000",
                  },
                ]}
                multiline
                value={formCategory.notes}
                onChangeText={(t) => setFormCategory((c) => ({ ...c, notes: t }))}
              />

              <View style={styles.modalButtonsStyled}>
                <TouchableOpacity style={styles.saveBtnStyled} onPress={onSaveCategory}>
                  <Text style={styles.saveText}>
                    {editing?.type === "category" ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtnStyled}
                  onPress={() =>
                    Animated.timing(categoryAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
                      setCategoryModal(false)
                    )
                  }
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 30,
    padding: 6,
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 25,
  },
  tabActive: { backgroundColor: "#007AFF" },
  tabText: { fontWeight: "600", fontSize: 15 },
  tabTextActive: { color: "#fff" },
  newCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
  },
  newTitle: { fontSize: 17, fontWeight: "700", color: "#000", marginTop: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSubtitle: { fontSize: 13 },
  cardButtons: { flexDirection: "row", alignItems: "center", gap: 14 },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 30,
    fontSize: 15,
    fontWeight: "500",
  },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainerStyled: {
    width: "92%",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitleStyled: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    color: "#007AFF",
    letterSpacing: 0.3,
  },
  inputStyled: {
    borderRadius: 12,
    padding: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    marginBottom: 10,
  },
  modalButtonsStyled: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  saveBtnStyled: {
    flex: 1,
    marginRight: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  cancelBtnStyled: {
    flex: 1,
    marginLeft: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelText: { color: "#333", fontWeight: "700", fontSize: 16 },
  label: { fontWeight: "600", marginBottom: 5 },
  dropdown: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginRight: 8,
    marginBottom: 8,
  },
  dropdownSelected: { backgroundColor: "#007AFF" },
});
