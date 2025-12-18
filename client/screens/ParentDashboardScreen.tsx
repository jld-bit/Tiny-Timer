import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Pressable, TextInput, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { Activity, ActivityType } from "@/lib/types";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AVAILABLE_ICONS = [
  "heart-outline", "musical-notes-outline", "camera-outline", "sunny-outline", "cloud-outline", "umbrella-outline", "gift-outline", "flag-outline",
  "notifications-outline", "disc-outline", "compass-outline", "leaf-outline", "cut-outline", "construct-outline", "watch-outline", "wifi-outline",
  "headset-outline", "mic-outline", "radio-outline", "tv-outline", "phone-portrait-outline", "tablet-portrait-outline", "volume-high-outline", "battery-full-outline",
  "fitness-outline", "ribbon-outline", "briefcase-outline", "calendar-outline", "folder-outline", "document-outline", "create-outline", "brush-outline",
];

const DEFAULT_DURATIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function IconButton({
  icon,
  isSelected,
  onPress,
}: {
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.iconButton,
        {
          backgroundColor: isSelected ? Colors.light.primary + "20" : theme.backgroundDefault,
          borderColor: isSelected ? Colors.light.primary : "transparent",
          borderWidth: 2,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={icon as any}
        size={22}
        color={isSelected ? Colors.light.primary : theme.textSecondary}
      />
    </AnimatedPressable>
  );
}

function DurationButton({
  duration,
  isSelected,
  onPress,
}: {
  duration: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.durationButton,
        {
          backgroundColor: isSelected ? Colors.light.primary : theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="small"
        style={{ color: isSelected ? "#FFFFFF" : theme.text }}
      >
        {duration}m
      </ThemedText>
    </AnimatedPressable>
  );
}

function CustomActivityCard({
  activity,
  onRemove,
}: {
  activity: Activity;
  onRemove: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.customActivityCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.activityIconContainer, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={activity.icon as any} size={20} color={Colors.light.primary} />
      </View>
      <View style={styles.activityInfo}>
        <ThemedText type="bodyMedium">{activity.name}</ThemedText>
        {activity.label ? (
          <ThemedText type="caption" style={{ color: Colors.light.primary }}>
            {activity.label}
          </ThemedText>
        ) : null}
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Default: {activity.defaultMinutes} min
        </ThemedText>
      </View>
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [
          styles.removeButton,
          { opacity: pressed ? 0.7 : 1, backgroundColor: Colors.light.error + "15" },
        ]}
      >
        <Feather name="trash-2" size={18} color={Colors.light.error} />
      </Pressable>
    </View>
  );
}

export default function ParentDashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { customActivities, addCustomActivity, removeCustomActivity } = useTimers();

  const [activityName, setActivityName] = useState("");
  const [activityLabel, setActivityLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [showForm, setShowForm] = useState(false);

  const handleAddActivity = () => {
    if (!activityName.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter an activity name");
      } else {
        Alert.alert("Missing Name", "Please enter an activity name");
      }
      return;
    }

    const newActivity: Activity = {
      id: `custom_${Date.now()}` as ActivityType,
      name: activityName.trim(),
      icon: selectedIcon,
      defaultMinutes: selectedDuration,
      isCustom: true,
      label: activityLabel.trim() || undefined,
    };

    addCustomActivity(newActivity);
    setActivityName("");
    setActivityLabel("");
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setSelectedDuration(15);
    setShowForm(false);
  };

  const handleRemoveActivity = (id: string, name: string) => {
    if (Platform.OS === "web") {
      if (confirm(`Remove "${name}" activity?`)) {
        removeCustomActivity(id);
      }
    } else {
      Alert.alert(
        "Remove Activity",
        `Are you sure you want to remove "${name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: () => removeCustomActivity(id) },
        ]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Custom Activities</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {customActivities.length} created
            </ThemedText>
          </View>

          {customActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {customActivities.map((activity) => (
                <CustomActivityCard
                  key={activity.id}
                  activity={activity}
                  onRemove={() => handleRemoveActivity(activity.id, activity.name)}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="plus-circle" size={40} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                No custom activities yet.{"\n"}Create one below!
              </ThemedText>
            </View>
          )}
        </View>

        {showForm ? (
          <View style={[styles.formSection, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.formHeader}>
              <ThemedText type="h4">New Activity</ThemedText>
              <Pressable
                onPress={() => setShowForm(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="bodyMedium" style={styles.inputLabel}>
                Activity Name
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={activityName}
                onChangeText={setActivityName}
                placeholder="e.g., Piano Practice"
                placeholderTextColor={theme.textSecondary}
                maxLength={30}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="bodyMedium" style={styles.inputLabel}>
                Custom Label (optional)
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={activityLabel}
                onChangeText={setActivityLabel}
                placeholder="e.g., For weekdays only"
                placeholderTextColor={theme.textSecondary}
                maxLength={40}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="bodyMedium" style={styles.inputLabel}>
                Choose Icon
              </ThemedText>
              <View style={styles.iconsGrid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <IconButton
                    key={icon}
                    icon={icon}
                    isSelected={selectedIcon === icon}
                    onPress={() => setSelectedIcon(icon)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="bodyMedium" style={styles.inputLabel}>
                Default Duration
              </ThemedText>
              <View style={styles.durationsRow}>
                {DEFAULT_DURATIONS.map((duration) => (
                  <DurationButton
                    key={duration}
                    duration={duration}
                    isSelected={selectedDuration === duration}
                    onPress={() => setSelectedDuration(duration)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <Pressable
                onPress={() => setShowForm(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1, backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ThemedText type="bodyMedium">Cancel</ThemedText>
              </Pressable>
              <Button onPress={handleAddActivity} style={styles.saveButton}>
                Add Activity
              </Button>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowForm(true)}
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.9 : 1, backgroundColor: Colors.light.primary },
            ]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <ThemedText type="bodyMedium" style={{ color: "#FFFFFF" }}>
              Create New Activity
            </ThemedText>
          </Pressable>
        )}

        <View style={styles.tipSection}>
          <View style={[styles.tipCard, { backgroundColor: Colors.light.accent + "20" }]}>
            <Feather name="info" size={20} color={Colors.light.primary} />
            <View style={styles.tipContent}>
              <ThemedText type="bodyMedium">Parent Tip</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Custom activities appear alongside the preset activities when creating new timers. Your child can easily find and use them!
              </ThemedText>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  activitiesList: {
    gap: Spacing.sm,
  },
  customActivityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  formSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    marginLeft: Spacing.xs,
  },
  textInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  durationsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  durationButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 48,
    alignItems: "center",
  },
  formActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  tipSection: {
    marginTop: Spacing.md,
  },
  tipCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  tipContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
