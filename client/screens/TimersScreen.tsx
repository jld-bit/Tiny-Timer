import React from "react";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { TimerCard } from "@/components/TimerCard";
import { ActivityCard } from "@/components/ActivityCard";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTimers } from "@/lib/timerContext";
import { ACTIVITIES, Activity } from "@/lib/types";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { SettingsIcon } from "@/components/Icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const activityImages: Record<string, any> = {
  homework: require("@/assets/activities/homework_activity_icon.png"),
  screen_time: require("@/assets/activities/screen_time_activity_icon.png"),
  brush_teeth: require("@/assets/activities/brush_teeth_activity_icon.png"),
  bedtime: require("@/assets/activities/bedtime_activity_icon.png"),
  playtime: require("@/assets/activities/playtime_activity_icon.png"),
  cleanup: require("@/assets/activities/cleanup_activity_icon.png"),
  snack_time: require("@/assets/activities/snack_time_activity_icon.png"),
  reading: require("@/assets/activities/reading_time_activity_icon.png"),
};

export default function TimersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { timers, addTimer, removeTimer } = useTimers();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle />,
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={styles.headerButton}
        >
          <SettingsIcon size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const activeTimers = timers
    .filter((t) => t.isRunning || t.remainingSeconds > 0)
    .sort((a, b) => a.remainingSeconds - b.remainingSeconds);
  const completedTimers = timers.filter((t) => t.remainingSeconds <= 0);

  const handleActivityPress = (activity: Activity) => {
    addTimer(activity.id, activity.defaultMinutes);
  };

  const handleTimerPress = (timerId: string) => {
    navigation.navigate("TimerDetail", { timerId });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTimers.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Running Timers
            </ThemedText>
            <View style={styles.timersList}>
              {activeTimers.map((timer) => (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  onPress={() => handleTimerPress(timer.id)}
                  onSwipeDelete={() => removeTimer(timer.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {completedTimers.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Completed
            </ThemedText>
            <View style={styles.timersList}>
              {completedTimers.slice(0, 3).map((timer) => (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  onPress={() => handleTimerPress(timer.id)}
                  onSwipeDelete={() => removeTimer(timer.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Quick Start
          </ThemedText>
          <View style={styles.activitiesGrid}>
            {ACTIVITIES.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                image={activityImages[activity.id]}
                onPress={() => handleActivityPress(activity)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  timersList: {
    gap: Spacing.md,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
