import React from "react";
import { StyleSheet, Pressable, View, Image, ImageSourcePropType } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, ActivityColors } from "@/constants/theme";
import { Activity } from "@/lib/types";

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
  image?: ImageSourcePropType;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActivityCard({ activity, onPress, image }: ActivityCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const activityColor = ActivityColors[activity.id] || Colors.light.primary;

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
      <View style={[styles.iconContainer, { backgroundColor: activityColor + "20" }]}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="contain" />
        ) : (
          <Ionicons name={activity.icon as any} size={32} color={activityColor} />
        )}
      </View>
      <ThemedText type="bodyMedium" style={styles.name} numberOfLines={1}>
        {activity.name}
      </ThemedText>
      <ThemedText type="caption" style={[styles.duration, { color: theme.textSecondary }]}>
        {activity.defaultMinutes} min
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 48,
    height: 48,
  },
  name: {
    textAlign: "center",
  },
  duration: {
    textAlign: "center",
  },
});
