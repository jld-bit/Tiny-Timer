import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Timer, getActivityById } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleTimerNotification(timer: Timer): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  const activity = getActivityById(timer.activityId);
  const activityName = activity?.name || timer.activityName;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timer Complete!",
        body: `Your ${activityName} timer is done!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { timerId: timer.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
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
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn("Failed to cancel notification:", error);
  }
}

export async function cancelAllTimerNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Failed to cancel all notifications:", error);
  }
}
