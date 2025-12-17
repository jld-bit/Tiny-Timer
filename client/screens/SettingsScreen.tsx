import React from "react";
import { StyleSheet, ScrollView, View, Switch, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { storage } from "@/lib/storage";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  type = "toggle",
  onPress,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  type?: "toggle" | "button";
  onPress?: () => void;
}) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={20} color={Colors.light.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="bodyMedium">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {type === "toggle" && onValueChange ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.backgroundTertiary, true: Colors.light.primary + "50" }}
          thumbColor={value ? Colors.light.primary : theme.backgroundSecondary}
          ios_backgroundColor={theme.backgroundTertiary}
        />
      ) : (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </View>
  );

  if (type === "button" && onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useTimers();

  const handleClearHistory = async () => {
    await storage.saveHistory([]);
  };

  const handleClearTimers = async () => {
    await storage.saveTimers([]);
  };

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
        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            PREFERENCES
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="volume-2"
              title="Sound Effects"
              subtitle="Play sounds when timers complete"
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
            />
            {Platform.OS !== "web" ? (
              <SettingRow
                icon="smartphone"
                title="Haptic Feedback"
                subtitle="Vibrate on timer actions"
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DATA
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="trash-2"
              title="Clear History"
              subtitle="Remove all completed timer records"
              type="button"
              onPress={handleClearHistory}
            />
            <SettingRow
              icon="x-circle"
              title="Clear All Timers"
              subtitle="Remove all active and completed timers"
              type="button"
              onPress={handleClearTimers}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ABOUT
          </ThemedText>
          <View style={styles.sectionContent}>
            <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary + "15" }]}>
                <Feather name="info" size={20} color={Colors.light.secondary} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText type="bodyMedium">Kids Timer</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Version 1.0.0
                </ThemedText>
              </View>
            </View>
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
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    gap: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
});
