import AsyncStorage from "@react-native-async-storage/async-storage";
import { Timer, HistoryEntry, AppSettings } from "./types";

const TIMERS_KEY = "@kids_timer:timers";
const HISTORY_KEY = "@kids_timer:history";
const SETTINGS_KEY = "@kids_timer:settings";

const defaultSettings: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
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

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TIMERS_KEY, HISTORY_KEY, SETTINGS_KEY]);
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  },
};
