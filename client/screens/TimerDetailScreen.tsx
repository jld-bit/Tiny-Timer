import React, { useEffect } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  withTiming,
} from "react-native-reanimated";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProgressRing } from "@/components/ProgressRing";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { Spacing, Colors, BorderRadius, ActivityColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  ClockIcon,
  TrashIcon,
  RefreshIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
} from "@/components/Icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, "TimerDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function ControlButton({
  icon,
  color,
  backgroundColor,
  onPress,
  size = 60,
}: {
  icon: "refresh" | "check" | "play" | "pause" | "close";
  color: string;
  backgroundColor: string;
  onPress: () => void;
  size?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconSize = size * 0.4;

  const renderIcon = () => {
    switch (icon) {
      case "refresh":
        return <RefreshIcon size={iconSize} color={color} />;
      case "check":
        return <CheckIcon size={iconSize} color={color} />;
      case "play":
        return <PlayIcon size={iconSize} color={color} />;
      case "pause":
        return <PauseIcon size={iconSize} color={color} />;
      case "close":
        return <CloseIcon size={iconSize} color={color} />;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.controlButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        animatedStyle,
      ]}
    >
      {renderIcon()}
    </AnimatedPressable>
  );
}

export default function TimerDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { timers, toggleTimer, resetTimer, removeTimer } = useTimers();

  const timer = timers.find((t) => t.id === route.params.timerId);
  const celebrationScale = useSharedValue(1);
  const activityColor = timer ? (ActivityColors[timer.activityId] || Colors.light.primary) : Colors.light.primary;

  useEffect(() => {
    if (timer?.remainingSeconds === 0) {
      celebrationScale.value = withSequence(
        withTiming(1.1, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) })
      );
    }
  }, [timer?.remainingSeconds]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (timer) {
              removeTimer(timer.id);
              navigation.goBack();
            }
          }}
          style={styles.headerButton}
        >
          <TrashIcon size={22} color={Colors.light.error} />
        </Pressable>
      ),
    });
  }, [navigation, timer]);

  if (!timer) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText type="h3">Timer not found</ThemedText>
          <Pressable onPress={() => navigation.goBack()}>
            <ThemedText type="link">Go Back</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const progress = timer.remainingSeconds / timer.durationSeconds;
  const isCompleted = timer.remainingSeconds <= 0;
  const isPaused = timer.isPaused;

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <View style={styles.activityHeader}>
          <View style={[styles.activityIcon, { backgroundColor: activityColor + "20" }]}>
            <ClockIcon size={28} color={activityColor} />
          </View>
          <ThemedText type="h2">{timer.activityName}</ThemedText>
        </View>

        <Animated.View style={[styles.progressWrapper, celebrationStyle]}>
          <ProgressRing
            progress={progress}
            size={280}
            strokeWidth={16}
            color={isCompleted ? Colors.light.success : activityColor}
          />
          <View style={styles.timeOverlay}>
            <ThemedText type="display" style={[styles.time, { color: theme.text }]}>
              {formatTime(timer.remainingSeconds)}
            </ThemedText>
            {isCompleted ? (
              <View style={[styles.completeBadge, { backgroundColor: Colors.light.success }]}>
                <CheckIcon size={20} color="#FFFFFF" />
                <ThemedText style={styles.completeText}>Complete!</ThemedText>
              </View>
            ) : isPaused ? (
              <ThemedText type="bodyMedium" style={{ color: Colors.light.accent }}>
                Paused
              </ThemedText>
            ) : (
              <ThemedText type="bodyMedium" style={{ color: activityColor }}>
                Running
              </ThemedText>
            )}
          </View>
        </Animated.View>
      </View>

      <View
        style={[
          styles.controls,
          {
            paddingBottom: insets.bottom + Spacing.xl,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
        ]}
      >
        <ControlButton
          icon="refresh"
          color={theme.text}
          backgroundColor={theme.backgroundDefault}
          onPress={() => resetTimer(timer.id)}
          size={56}
        />
        
        {isCompleted ? (
          <ControlButton
            icon="check"
            color="#FFFFFF"
            backgroundColor={Colors.light.success}
            onPress={() => navigation.goBack()}
            size={80}
          />
        ) : (
          <ControlButton
            icon={isPaused ? "play" : "pause"}
            color="#FFFFFF"
            backgroundColor={activityColor}
            onPress={() => toggleTimer(timer.id)}
            size={80}
          />
        )}

        <ControlButton
          icon="close"
          color={Colors.light.error}
          backgroundColor={Colors.light.error + "20"}
          onPress={() => {
            removeTimer(timer.id);
            navigation.goBack();
          }}
          size={56}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  activityHeader: {
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  time: {
    fontWeight: "700",
  },
  completeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  completeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
