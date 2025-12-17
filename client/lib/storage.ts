import AsyncStorage from "@react-native-async-storage/async-storage";
import { Timer, HistoryEntry, AppSettings, UserProgress, Activity } from "./types";

const TIMERS_KEY = "@kids_timer:timers";
const HISTORY_KEY = "@kids_timer:history";
const SETTINGS_KEY = "@kids_timer:settings";
const PROGRESS_KEY = "@kids_timer:progress";
const CUSTOM_ACTIVITIES_KEY = "@kids_timer:custom_activities";

const defaultSettings: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  selectedTheme: "default",
  selectedSoundId: "chime",
};

const defaultProgress: UserProgress = {
  totalTimersCompleted: 0,
  totalMinutesCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  activityCounts: {},
  earnedBadges: [],
};

export const storage = {
  async getTimers(): Promise<Timer[]> {
    try {
      const data = await AsyncStorage.getItem(TIMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveTimers(timers: Timer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
    } catch (e) {
      console.error("Failed to save timers:", e);
    }
  },

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  },

  async addHistoryEntry(entry: HistoryEntry): Promise<void> {
    const history = await this.getHistory();
    history.unshift(entry);
    const trimmed = history.slice(0, 100);
    await this.saveHistory(trimmed);
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  },

  async getProgress(): Promise<UserProgress> {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      return data ? { ...defaultProgress, ...JSON.parse(data) } : defaultProgress;
    } catch {
      return defaultProgress;
    }
  },

  async saveProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  },

  async getCustomActivities(): Promise<Activity[]> {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_ACTIVITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCustomActivities(activities: Activity[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error("Failed to save custom activities:", e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TIMERS_KEY, HISTORY_KEY, SETTINGS_KEY, PROGRESS_KEY, CUSTOM_ACTIVITIES_KEY]);
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  },
};
