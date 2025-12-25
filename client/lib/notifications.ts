import { Platform } from "react-native";
import { Timer, getActivityById } from "./types";

let Notifications: typeof import("expo-notifications") | null = null;
let notificationsSupported = true;

async function getNotifications() {
  if (Notifications !== null) {
    return notificationsSupported ? Notifications : null;
  }
  
  if (Platform.OS === "web") {
    notificationsSupported = false;
    return null;
  }
  
  try {
    Notifications = await import("expo-notifications");
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    
    return Notifications;
  } catch (error) {
    console.warn("Notifications not supported in this environment:", error);
    notificationsSupported = false;
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const notifications = await getNotifications();
  if (!notifications) {
    return false;
  }

  try {
    const { status: existingStatus } = await notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.warn("Failed to request notification permissions:", error);
    return false;
  }
}

export async function scheduleTimerNotification(timer: Timer): Promise<string | null> {
  const notifications = await getNotifications();
  if (!notifications) {
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  const activity = getActivityById(timer.activityId);
  const activityName = activity?.name || timer.activityName;

  try {
    const notificationId = await notifications.scheduleNotificationAsync({
      content: {
        title: "Timer Complete!",
        body: `Your ${activityName} timer is done!`,
        sound: true,
        priority: notifications.AndroidNotificationPriority.HIGH,
        data: { timerId: timer.id },
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: timer.remainingSeconds,
      },
    });
    return notificationId;
  } catch (error) {
    console.warn("Failed to schedule notification:", error);
    return null;
  }
}

export async function cancelTimerNotification(notificationId: string): Promise<void> {
  const notifications = await getNotifications();
  if (!notifications) {
    return;
  }

  try {
    await notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn("Failed to cancel notification:", error);
  }
}

export async function cancelAllTimerNotifications(): Promise<void> {
  const notifications = await getNotifications();
  if (!notifications) {
    return;
  }

  try {
    await notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Failed to cancel all notifications:", error);
  }
}
