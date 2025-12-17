import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { storage } from "@/lib/storage";
import { HistoryEntry } from "@/lib/types";
import { Spacing, Colors, BorderRadius, ActivityColors } from "@/constants/theme";

type TimeRange = "today" | "week" | "month" | "all";

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

function TimeRangeButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.rangeButton,
        {
          backgroundColor: isSelected ? Colors.light.primary : theme.backgroundDefault,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{ color: isSelected ? "#FFFFFF" : theme.textSecondary }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ActivityBreakdownBar({
  activityId,
  activityName,
  count,
  maxCount,
  totalMinutes,
}: {
  activityId: string;
  activityName: string;
  count: number;
  maxCount: number;
  totalMinutes: number;
}) {
  const { theme } = useTheme();
  const activityColor = ActivityColors[activityId] || Colors.light.primary;
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLabel}>
        <ThemedText type="small" numberOfLines={1}>
          {activityName}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {count} times / {totalMinutes} min
        </ThemedText>
      </View>
      <View style={[styles.breakdownBarContainer, { backgroundColor: theme.backgroundTertiary }]}>
        <View
          style={[
            styles.breakdownBar,
            { width: `${percentage}%`, backgroundColor: activityColor },
          ]}
        />
      </View>
    </View>
  );
}

function WeeklyChart({ history }: { history: HistoryEntry[] }) {
  const { theme } = useTheme();
  
  const weekData = useMemo(() => {
    const days: { label: string; count: number; date: Date }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.push({
        label: dayLabels[date.getDay()],
        count: 0,
        date,
      });
    }
    
    history.forEach((entry) => {
      const entryDate = new Date(entry.completedAt);
      entryDate.setHours(0, 0, 0, 0);
      
      days.forEach((day) => {
        if (day.date.getTime() === entryDate.getTime()) {
          day.count++;
        }
      });
    });
    
    return days;
  }, [history]);

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <View style={styles.weeklyChart}>
      {weekData.map((day, index) => {
        const height = day.count > 0 ? (day.count / maxCount) * 60 + 8 : 8;
        const isToday = index === 6;
        return (
          <View key={index} style={styles.chartDay}>
            <View
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor: isToday ? Colors.light.primary : Colors.light.secondary,
                },
              ]}
            />
            <ThemedText
              type="caption"
              style={[
                styles.chartLabel,
                { color: isToday ? Colors.light.primary : theme.textSecondary },
              ]}
            >
              {day.label}
            </ThemedText>
            {day.count > 0 ? (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {day.count}
              </ThemedText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
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
  const { progress } = useTimers();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await storage.getHistory();
    setHistory(data);
    setIsLoading(false);
  };

  const filteredHistory = useMemo(() => {
    const now = new Date();
    return history.filter((h) => {
      const entryDate = new Date(h.completedAt);
      switch (timeRange) {
        case "today":
          return entryDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return h.completedAt > weekAgo.getTime();
        case "month":
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return h.completedAt > monthAgo.getTime();
        case "all":
        default:
          return true;
      }
    });
  }, [history, timeRange]);

  const stats = useMemo(() => {
    const totalSeconds = filteredHistory.reduce((acc, h) => acc + h.durationSeconds, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalCount = filteredHistory.length;
    
    const activityBreakdown: Record<string, { count: number; seconds: number; name: string }> = {};
    filteredHistory.forEach((entry) => {
      if (!activityBreakdown[entry.activityId]) {
        activityBreakdown[entry.activityId] = { count: 0, seconds: 0, name: entry.activityName };
      }
      activityBreakdown[entry.activityId].count++;
      activityBreakdown[entry.activityId].seconds += entry.durationSeconds;
    });
    
    const breakdownArray = Object.entries(activityBreakdown)
      .map(([id, data]) => ({ id, ...data, minutes: Math.round(data.seconds / 60) }))
      .sort((a, b) => b.count - a.count);
    
    return { totalMinutes, totalCount, breakdown: breakdownArray };
  }, [filteredHistory]);

  const maxBreakdownCount = stats.breakdown.length > 0 ? stats.breakdown[0].count : 0;

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
        <View style={styles.rangeRow}>
          <TimeRangeButton
            label="Today"
            isSelected={timeRange === "today"}
            onPress={() => setTimeRange("today")}
          />
          <TimeRangeButton
            label="Week"
            isSelected={timeRange === "week"}
            onPress={() => setTimeRange("week")}
          />
          <TimeRangeButton
            label="Month"
            isSelected={timeRange === "month"}
            onPress={() => setTimeRange("month")}
          />
          <TimeRangeButton
            label="All"
            isSelected={timeRange === "all"}
            onPress={() => setTimeRange("all")}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.light.success + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.success }}>
              {stats.totalCount}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.success }}>
              Timers
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.secondary + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.secondary }}>
              {stats.totalMinutes}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.secondary }}>
              Minutes
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.accent + "15" }]}>
            <ThemedText type="h1" style={{ color: Colors.light.accent }}>
              {progress.currentStreak}
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.accent }}>
              Day Streak
            </ThemedText>
          </View>
        </View>

        {filteredHistory.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Weekly Overview
            </ThemedText>
            <View style={[styles.chartContainer, { backgroundColor: theme.backgroundDefault }]}>
              <WeeklyChart history={filteredHistory} />
            </View>
          </View>
        ) : null}

        {stats.breakdown.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Activity Breakdown
            </ThemedText>
            <View style={[styles.breakdownContainer, { backgroundColor: theme.backgroundDefault }]}>
              {stats.breakdown.map((item) => (
                <ActivityBreakdownBar
                  key={item.id}
                  activityId={item.id}
                  activityName={item.name}
                  count={item.count}
                  maxCount={maxBreakdownCount}
                  totalMinutes={item.minutes}
                />
              ))}
            </View>
          </View>
        ) : null}

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
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="filter" size={48} color={theme.textSecondary} />
            </View>
            <ThemedText type="h3" style={styles.emptyTitle}>
              No activity in this period
            </ThemedText>
            <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
              Try selecting a different time range
            </ThemedText>
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <View style={styles.historyList}>
              {filteredHistory.slice(0, 10).map((entry) => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
              {filteredHistory.length > 10 ? (
                <ThemedText type="caption" style={[styles.moreText, { color: theme.textSecondary }]}>
                  + {filteredHistory.length - 10} more entries
                </ThemedText>
              ) : null}
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
  rangeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: "center",
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
  moreText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  chartContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  chartDay: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  chartBar: {
    width: 24,
    borderRadius: BorderRadius.sm,
    minHeight: 8,
  },
  chartLabel: {
    fontWeight: "600",
  },
  breakdownContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  breakdownLabel: {
    width: 100,
    gap: 2,
  },
  breakdownBarContainer: {
    flex: 1,
    height: 12,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  breakdownBar: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});
