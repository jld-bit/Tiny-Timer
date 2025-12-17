import React, { useEffect } from "react";
import { StyleSheet, ScrollView, View, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  withTiming,
} from "react-native-reanimated";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { BADGES, Badge } from "@/lib/types";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";

function BadgeCard({ badge, isEarned }: { badge: Badge; isEarned: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.badgeCard,
        {
          backgroundColor: isEarned ? badge.color + "20" : theme.backgroundSecondary,
          opacity: isEarned ? 1 : 0.5,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: isEarned ? badge.color : theme.backgroundTertiary,
          },
        ]}
      >
        <Feather
          name={badge.icon as any}
          size={28}
          color={isEarned ? "#FFFFFF" : theme.textSecondary}
        />
      </View>
      <ThemedText type="bodyMedium" style={styles.badgeName}>
        {badge.name}
      </ThemedText>
      <ThemedText
        type="caption"
        style={[styles.badgeDesc, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {badge.description}
      </ThemedText>
      {isEarned ? (
        <View style={[styles.earnedBadge, { backgroundColor: Colors.light.success }]}>
          <Feather name="check" size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </Animated.View>
  );
}

function NewBadgeModal({
  badgeId,
  visible,
  onClose,
}: {
  badgeId: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const badge = BADGES.find((b) => b.id === badgeId);

  useEffect(() => {
    if (visible && badge) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(100, withTiming(360, { duration: 500, easing: Easing.out(Easing.quad) }))
      );
    }
  }, [visible, badge]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotateZ: `${rotation.value}deg` }],
  }));

  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          <Animated.View
            style={[
              styles.newBadgeIcon,
              { backgroundColor: badge.color },
              animatedStyle,
            ]}
          >
            <Feather name={badge.icon as any} size={48} color="#FFFFFF" />
          </Animated.View>
          <ThemedText type="h2" style={styles.modalTitle}>
            New Badge!
          </ThemedText>
          <ThemedText type="h3" style={[styles.badgeNameModal, { color: badge.color }]}>
            {badge.name}
          </ThemedText>
          <ThemedText type="body" style={[styles.badgeDescModal, { color: theme.textSecondary }]}>
            {badge.description}
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: badge.color }]}
          >
            <ThemedText style={styles.closeButtonText}>Awesome!</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function BadgesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, newBadge, clearNewBadge } = useTimers();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
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
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.light.accent + "20" }]}>
            <Feather name="award" size={24} color={Colors.light.accent} />
            <ThemedText type="h2" style={{ color: Colors.light.accent }}>
              {progress.earnedBadges.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.accent }}>
              Badges Earned
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.primary + "20" }]}>
            <Feather name="zap" size={24} color={Colors.light.primary} />
            <ThemedText type="h2" style={{ color: Colors.light.primary }}>
              {progress.currentStreak}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.primary }}>
              Day Streak
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            All Badges
          </ThemedText>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={progress.earnedBadges.includes(badge.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <NewBadgeModal
        badgeId={newBadge}
        visible={!!newBadge}
        onClose={clearNewBadge}
      />
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  badgeCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
    position: "relative",
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    textAlign: "center",
  },
  badgeDesc: {
    textAlign: "center",
    fontSize: 12,
  },
  earnedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "80%",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  newBadgeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    textAlign: "center",
  },
  badgeNameModal: {
    textAlign: "center",
  },
  badgeDescModal: {
    textAlign: "center",
  },
  closeButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
