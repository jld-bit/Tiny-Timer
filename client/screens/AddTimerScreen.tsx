import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Pressable, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { ACTIVITIES, Activity, ActivityType } from "@/lib/types";
import { Spacing, Colors, BorderRadius, ActivityColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

const MINUTE_OPTIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActivityOption({
  activity,
  isSelected,
  onPress,
}: {
  activity: Activity;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const activityColor = ActivityColors[activity.id] || Colors.light.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.activityOption,
        {
          backgroundColor: isSelected ? activityColor + "20" : theme.backgroundDefault,
          borderColor: isSelected ? activityColor : "transparent",
          borderWidth: 2,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={activity.icon as any}
        size={28}
        color={isSelected ? activityColor : theme.textSecondary}
      />
      <ThemedText
        type="small"
        style={[
          styles.activityName,
          { color: isSelected ? activityColor : theme.text },
        ]}
        numberOfLines={1}
      >
        {activity.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

function MinuteOption({
  minutes,
  isSelected,
  onPress,
  selectedActivityColor,
}: {
  minutes: number;
  isSelected: boolean;
  onPress: () => void;
  selectedActivityColor: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.minuteOption,
        {
          backgroundColor: isSelected ? selectedActivityColor : theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="h4"
        style={[
          styles.minuteText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {minutes}
      </ThemedText>
      <ThemedText
        type="caption"
        style={[
          styles.minuteLabel,
          { color: isSelected ? "#FFFFFF" : theme.textSecondary },
        ]}
      >
        min
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function AddTimerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addTimer } = useTimers();

  const [selectedActivity, setSelectedActivity] = useState<Activity>(ACTIVITIES[0]);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    ACTIVITIES[0].defaultMinutes
  );
  
  const selectedActivityColor = ActivityColors[selectedActivity.id] || Colors.light.primary;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedMinutes(activity.defaultMinutes);
  };

  const handleStartTimer = () => {
    addTimer(selectedActivity.id as ActivityType, selectedMinutes);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Choose Activity
          </ThemedText>
          <View style={styles.activitiesGrid}>
            {ACTIVITIES.map((activity) => (
              <ActivityOption
                key={activity.id}
                activity={activity}
                isSelected={selectedActivity.id === activity.id}
                onPress={() => handleActivitySelect(activity)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Set Duration
          </ThemedText>
          <View style={styles.minutesGrid}>
            {MINUTE_OPTIONS.map((minutes) => (
              <MinuteOption
                key={minutes}
                minutes={minutes}
                isSelected={selectedMinutes === minutes}
                onPress={() => setSelectedMinutes(minutes)}
                selectedActivityColor={selectedActivityColor}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Button onPress={handleStartTimer} style={[styles.startButton, { backgroundColor: selectedActivityColor }]}>
          Start {selectedActivity.name} Timer
        </Button>
      </View>
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
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  activityOption: {
    width: "30%",
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  activityName: {
    textAlign: "center",
  },
  minutesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  minuteOption: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  minuteText: {
    textAlign: "center",
  },
  minuteLabel: {
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  startButton: {
    backgroundColor: Colors.light.primary,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
