import React from "react";
import { StyleSheet, ScrollView, View, Switch, Pressable, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { storage } from "@/lib/storage";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { THEMES, ThemeType, SOUND_TONES, SoundToneId } from "@/lib/types";
import { previewSound } from "@/lib/sounds";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
        <Ionicons name={icon as any} size={20} color={Colors.light.primary} />
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
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
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

function ThemeCard({
  themeKey,
  isSelected,
  onSelect,
}: {
  themeKey: ThemeType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();
  const themeConfig = THEMES[themeKey];

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.themeCard,
        {
          backgroundColor: themeConfig.colors.background,
          borderColor: isSelected ? themeConfig.colors.primary : "transparent",
          borderWidth: 3,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.themeColorRow}>
        <View style={[styles.themeColorDot, { backgroundColor: themeConfig.colors.primary }]} />
        <View style={[styles.themeColorDot, { backgroundColor: themeConfig.colors.secondary }]} />
        <View style={[styles.themeColorDot, { backgroundColor: themeConfig.colors.accent }]} />
      </View>
      <ThemedText
        type="caption"
        style={[
          styles.themeName,
          { color: themeKey === "space" ? "#FFFFFF" : theme.text },
        ]}
      >
        {themeConfig.name}
      </ThemedText>
      {isSelected ? (
        <View style={[styles.checkBadge, { backgroundColor: themeConfig.colors.primary }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

function SoundToneCard({
  toneId,
  isSelected,
  onSelect,
  hapticsEnabled,
}: {
  toneId: SoundToneId;
  isSelected: boolean;
  onSelect: () => void;
  hapticsEnabled: boolean;
}) {
  const { theme } = useTheme();
  const tone = SOUND_TONES.find((t) => t.id === toneId);
  if (!tone) return null;

  const handlePress = () => {
    onSelect();
    previewSound(toneId, hapticsEnabled);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.soundToneCard,
        {
          backgroundColor: isSelected ? Colors.light.primary + "15" : theme.backgroundDefault,
          borderColor: isSelected ? Colors.light.primary : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.soundIconContainer, { backgroundColor: isSelected ? Colors.light.primary : theme.backgroundTertiary }]}>
        <Ionicons name={tone.icon as any} size={16} color={isSelected ? "#FFFFFF" : theme.textSecondary} />
      </View>
      <ThemedText type="caption" style={{ color: isSelected ? Colors.light.primary : theme.text }}>
        {tone.name}
      </ThemedText>
      {isSelected ? (
        <Ionicons name="checkmark" size={14} color={Colors.light.primary} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, customActivities } = useTimers();

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
            PARENT CONTROLS
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="people-outline"
              title="Parent Dashboard"
              subtitle={`Manage custom activities (${customActivities.length} created)`}
              type="button"
              onPress={() => navigation.navigate("ParentDashboard")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            PREFERENCES
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="volume-high-outline"
              title="Sound Effects"
              subtitle="Play sounds when timers complete"
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
            />
            {Platform.OS !== "web" ? (
              <SettingRow
                icon="phone-portrait-outline"
                title="Haptic Feedback"
                subtitle="Vibrate on timer actions"
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              />
            ) : null}
          </View>
        </View>

        {settings.soundEnabled ? (
          <View style={styles.section}>
            <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              TIMER SOUND
            </ThemedText>
            <View style={styles.soundTonesGrid}>
              {SOUND_TONES.map((tone) => (
                <SoundToneCard
                  key={tone.id}
                  toneId={tone.id}
                  isSelected={settings.selectedSoundId === tone.id}
                  onSelect={() => updateSettings({ selectedSoundId: tone.id })}
                  hapticsEnabled={settings.hapticsEnabled}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            TIMER THEME
          </ThemedText>
          <View style={styles.themeGrid}>
            {(Object.keys(THEMES) as ThemeType[]).map((themeKey) => (
              <ThemeCard
                key={themeKey}
                themeKey={themeKey}
                isSelected={settings.selectedTheme === themeKey}
                onSelect={() => updateSettings({ selectedTheme: themeKey })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DATA
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="trash-outline"
              title="Clear History"
              subtitle="Remove all completed timer records"
              type="button"
              onPress={handleClearHistory}
            />
            <SettingRow
              icon="close-circle-outline"
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
                <Ionicons name="information-circle-outline" size={20} color={Colors.light.secondary} />
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
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  themeCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  themeColorRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeName: {
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  checkBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  soundTonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  soundToneCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  soundIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
