import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeComplete: () => void;
  actionLabel?: string;
  actionIcon?: keyof typeof Feather.glyphMap;
  actionColor?: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const ACTION_WIDTH = 100;
const DELETE_THRESHOLD = -80;

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 200,
};

export function SwipeableRow({
  children,
  onSwipeComplete,
  actionLabel = "Delete",
  actionIcon = "trash-2",
  actionColor = Colors.light.error,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue<number | undefined>(undefined);

  const handleDelete = () => {
    onSwipeComplete();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        const dampedValue = event.translationX * 0.8;
        translateX.value = Math.max(dampedValue, -ACTION_WIDTH * 1.5);
      }
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0, springConfig);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    overflow: "hidden" as const,
  }));

  const actionStyle = useAnimatedStyle(() => {
    const width = Math.max(Math.abs(translateX.value), ACTION_WIDTH);
    const opacity = Math.min(Math.abs(translateX.value) / 50, 1);
    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.actionContainer, { backgroundColor: actionColor }, actionStyle]}>
        <Feather name={actionIcon} size={20} color="#FFFFFF" />
        <ThemedText style={styles.actionLabel}>{actionLabel}</ThemedText>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
  },
  content: {
    zIndex: 1,
  },
  actionContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
