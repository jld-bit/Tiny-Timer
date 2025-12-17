import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Timer, HistoryEntry, AppSettings, ActivityType, getActivityById, UserProgress, BADGES, Activity } from "./types";
import { storage } from "./storage";
import { playCompletionSound } from "./sounds";

interface TimerContextType {
  timers: Timer[];
  settings: AppSettings;
  progress: UserProgress;
  customActivities: Activity[];
  isLoading: boolean;
  newBadge: string | null;
  clearNewBadge: () => void;
  addTimer: (activityId: ActivityType, durationMinutes: number, customName?: string) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addCustomActivity: (activity: Activity) => void;
  removeCustomActivity: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const defaultProgress: UserProgress = {
  totalTimersCompleted: 0,
  totalMinutesCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  activityCounts: {},
  earnedBadges: [],
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ soundEnabled: true, hapticsEnabled: true, selectedTheme: "default", selectedSoundId: "chime" });
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [timers]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      loadData();
    }
  };

  const loadData = async () => {
    const [savedTimers, savedSettings, savedProgress, savedCustomActivities] = await Promise.all([
      storage.getTimers(),
      storage.getSettings(),
      storage.getProgress(),
      storage.getCustomActivities(),
    ]);
    setTimers(savedTimers);
    setSettings(savedSettings);
    setProgress(savedProgress);
    setCustomActivities(savedCustomActivities);
    setIsLoading(false);
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const hasRunningTimers = timers.some((t) => t.isRunning && !t.isPaused);
    
    if (hasRunningTimers) {
      intervalRef.current = setInterval(() => {
        setTimers((prev) => {
          const updated = prev.map((timer) => {
            if (!timer.isRunning || timer.isPaused) return timer;
            const newRemaining = timer.remainingSeconds - 1;
            if (newRemaining <= 0) {
              handleTimerComplete(timer);
              return { ...timer, remainingSeconds: 0, isRunning: false, completedAt: Date.now() };
            }
            return { ...timer, remainingSeconds: newRemaining };
          });
          storage.saveTimers(updated);
          return updated;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timers.some((t) => t.isRunning && !t.isPaused), settings]);

  const checkAndAwardBadges = (updatedProgress: UserProgress): string | null => {
    let newlyEarnedBadge: string | null = null;

    for (const badge of BADGES) {
      if (updatedProgress.earnedBadges.includes(badge.id)) continue;

      let earned = false;
      switch (badge.requirement.type) {
        case "total_timers":
          earned = updatedProgress.totalTimersCompleted >= badge.requirement.count;
          break;
        case "total_minutes":
          earned = updatedProgress.totalMinutesCompleted >= badge.requirement.count;
          break;
        case "streak":
          earned = updatedProgress.currentStreak >= badge.requirement.count;
          break;
        case "activity_count":
          if (badge.requirement.activityId) {
            const count = updatedProgress.activityCounts[badge.requirement.activityId] || 0;
            earned = count >= badge.requirement.count;
          }
          break;
      }

      if (earned) {
        updatedProgress.earnedBadges.push(badge.id);
        newlyEarnedBadge = badge.id;
      }
    }

    return newlyEarnedBadge;
  };

  const handleTimerComplete = async (timer: Timer) => {
    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (settings.soundEnabled) {
      playCompletionSound(settings.selectedSoundId);
    }

    const historyEntry: HistoryEntry = {
      id: `history_${Date.now()}`,
      activityId: timer.activityId,
      activityName: timer.activityName,
      durationSeconds: timer.durationSeconds,
      completedAt: Date.now(),
    };
    storage.addHistoryEntry(historyEntry);

    const today = new Date().toDateString();
    const updatedProgress = { ...progress };
    
    updatedProgress.totalTimersCompleted += 1;
    updatedProgress.totalMinutesCompleted += Math.floor(timer.durationSeconds / 60);
    updatedProgress.activityCounts[timer.activityId] = (updatedProgress.activityCounts[timer.activityId] || 0) + 1;

    if (updatedProgress.lastCompletedDate === today) {
    } else if (updatedProgress.lastCompletedDate) {
      const lastDate = new Date(updatedProgress.lastCompletedDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        updatedProgress.currentStreak += 1;
      } else {
        updatedProgress.currentStreak = 1;
      }
    } else {
      updatedProgress.currentStreak = 1;
    }

    updatedProgress.lastCompletedDate = today;
    if (updatedProgress.currentStreak > updatedProgress.longestStreak) {
      updatedProgress.longestStreak = updatedProgress.currentStreak;
    }

    const earnedBadgeId = checkAndAwardBadges(updatedProgress);
    if (earnedBadgeId) {
      setNewBadge(earnedBadgeId);
    }

    setProgress(updatedProgress);
    storage.saveProgress(updatedProgress);
  };

  const clearNewBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  const addTimer = useCallback((activityId: ActivityType, durationMinutes: number, customName?: string) => {
    const activity = getActivityById(activityId);
    const customActivity = customActivities.find((a) => a.id === activityId);
    const name = customName || customActivity?.name || activity?.name || "Timer";
    const durationSeconds = durationMinutes * 60;
    
    const newTimer: Timer = {
      id: `timer_${Date.now()}`,
      activityId,
      activityName: name,
      durationSeconds,
      remainingSeconds: durationSeconds,
      isRunning: true,
      isPaused: false,
      createdAt: Date.now(),
    };

    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setTimers((prev) => {
      const updated = [newTimer, ...prev];
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled, customActivities]);

  const removeTimer = useCallback((id: string) => {
    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled]);

  const toggleTimer = useCallback((id: string) => {
    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, isPaused: !t.isPaused } : t
      );
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled]);

  const resetTimer = useCallback((id: string) => {
    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: t.durationSeconds, isRunning: true, isPaused: false, completedAt: undefined }
          : t
      );
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.saveSettings(updated);
      return updated;
    });
  }, []);

  const addCustomActivity = useCallback((activity: Activity) => {
    setCustomActivities((prev) => {
      const updated = [...prev, { ...activity, isCustom: true }];
      storage.saveCustomActivities(updated);
      return updated;
    });
  }, []);

  const removeCustomActivity = useCallback((id: string) => {
    setCustomActivities((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      storage.saveCustomActivities(updated);
      return updated;
    });
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timers,
        settings,
        progress,
        customActivities,
        isLoading,
        newBadge,
        clearNewBadge,
        addTimer,
        removeTimer,
        toggleTimer,
        resetTimer,
        updateSettings,
        addCustomActivity,
        removeCustomActivity,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimers must be used within a TimerProvider");
  }
  return context;
}
