import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { storage } from "@/lib/storage";
import { HistoryEntry } from "@/lib/types";
import { Spacing, Colors, BorderRadius, ActivityColors } from "@/constants/theme";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { theme } = useTheme();
  const activityColor = ActivityColors[entry.activityId] || Colors.light.primary;

  return (
    <View style={[styles.historyCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.light.success + "20" }]}>
        <Feather name="check-circle" size={24} color={Colors.light.success} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="bodyMedium">{entry.activityName}</ThemedText>
        <View style={styles.cardDetails}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatTime(entry.durationSeconds)}
          </ThemedText>
          <View style={styles.dot} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatDate(entry.completedAt)}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: activityColor + "20" }]}>
        <Feather name="star" size={16} color={activityColor} />
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await storage.getHistory();
    setHistory(data);
    setIsLoading(false);
  };

  const todayCount = history.filter((h) => {
    const today = new Date();
    const entryDate = new Date(h.completedAt);
    return entryDate.toDateString() === today.toDateString();
  }).length;

  const thisWeekCount = history.filter((h) => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return h.completedAt > weekAgo.getTime();
  }).length;

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
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.light.success + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.success }}>
              {todayCount}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.success }}>
              Today
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.secondary + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.secondary }}>
              {thisWeekCount}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.secondary }}>
              This Week
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.accent + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.accent }}>
              {history.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.accent }}>
              All Time
            </ThemedText>
          </View>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="clock" size={48} color={theme.textSecondary} />
            </View>
            <ThemedText type="h3" style={styles.emptyTitle}>
              No completed timers yet
            </ThemedText>
            <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
              Complete your first timer to see your progress here!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <View style={styles.historyList}>
              {history.map((entry) => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
            </View>
          </View>
        )}
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
  historyList: {
    gap: Spacing.md,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.textSecondary,
    opacity: 0.5,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
  },
});
