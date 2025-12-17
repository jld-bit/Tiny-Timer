import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ProgressRing } from "@/components/ProgressRing";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, ActivityColors, Typography } from "@/constants/theme";
import { Timer } from "@/lib/types";

interface TimerCardProps {
  timer: Timer;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TimerCard({ timer, onPress }: TimerCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const progress = timer.remainingSeconds / timer.durationSeconds;
  const activityColor = ActivityColors[timer.activityId] || Colors.light.primary;
  const isCompleted = timer.remainingSeconds <= 0;
  const isPaused = timer.isPaused;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <ProgressRing
            progress={progress}
            size={80}
            strokeWidth={8}
            color={isCompleted ? Colors.light.success : activityColor}
          />
          <View style={styles.timeOverlay}>
            <ThemedText style={[styles.time, { color: theme.text }]}>
              {formatTime(timer.remainingSeconds)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.info}>
          <ThemedText type="h4" numberOfLines={1}>
            {timer.activityName}
          </ThemedText>
          <View style={styles.statusRow}>
            {isCompleted ? (
              <View style={[styles.statusBadge, { backgroundColor: Colors.light.success + "20" }]}>
                <Feather name="check" size={14} color={Colors.light.success} />
                <ThemedText style={[styles.statusText, { color: Colors.light.success }]}>
                  Complete
                </ThemedText>
              </View>
            ) : isPaused ? (
              <View style={[styles.statusBadge, { backgroundColor: Colors.light.accent + "20" }]}>
                <Feather name="pause" size={14} color={Colors.light.accent} />
                <ThemedText style={[styles.statusText, { color: Colors.light.accent }]}>
                  Paused
                </ThemedText>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: activityColor + "20" }]}>
                <Feather name="play" size={14} color={activityColor} />
                <ThemedText style={[styles.statusText, { color: activityColor }]}>
                  Running
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        <Feather name="chevron-right" size={24} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
