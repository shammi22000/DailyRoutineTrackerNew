import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";


export async function initNotifications() {
  if (!Device.isDevice) return;

  // Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Foreground handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/* ------------------------------ Helpers ------------------------------ */
function toLocalDate(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    let hh = 0,
      mm = 0;
    if (timeStr && timeStr.includes(":")) {
      const [h, min] = timeStr.split(":").map(Number);
      hh = h;
      mm = min;
    }
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  } catch {
    return null;
  }
}

async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}


export async function scheduleActivityNotification(activity) {
  if (!Device.isDevice) return { startId: undefined, endId: undefined };

  const ok = await ensurePermission();
  if (!ok) return { startId: undefined, endId: undefined };

  const now = new Date();
  const startAt = toLocalDate(activity?.date, activity?.startTime);
  const endAt = toLocalDate(activity?.date, activity?.endTime);

  let startId;
  let endId;

  // Schedule "Activity Started"
  if (startAt && startAt > now) {
    startId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Activity Started",
        body: `${activity?.name || "Your activity"} has started.`,
        sound: true,
      },
      trigger: { date: startAt },
    });
  }

  // Schedule "Activity Expired" or show immediately
  if (endAt) {
    if (endAt > now) {
      endId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Activity Expired",
          body: `${activity?.name || "Your activity"} has expired.`,
          sound: true,
        },
        trigger: { date: endAt },
      });
    } else {
      await Notifications.presentNotificationAsync({
        content: {
          title: "Activity Expired",
          body: `${activity?.name || "Your activity"} has expired.`,
          sound: true,
        },
      });
    }
  }

  return { startId, endId };
}

/* --------------------------- Utilities --------------------------- */
export async function cancelActivityNotifications(ids) {
  if (ids?.startId)
    try {
      await Notifications.cancelScheduledNotificationAsync(ids.startId);
    } catch {}
  if (ids?.endId)
    try {
      await Notifications.cancelScheduledNotificationAsync(ids.endId);
    } catch {}
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function listScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
