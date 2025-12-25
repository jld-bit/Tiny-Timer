import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Timer, HistoryEntry, AppSettings, ActivityType, getActivityById, UserProgress, BADGES, Activity } from "./types";
import { storage } from "./storage";
import { playCompletionSound, stopCompletionSound } from "./sounds";
import { scheduleTimerNotification, cancelTimerNotification, requestNotificationPermissions } from "./notifications";

interface TimerContextType {
  timers: Timer[];
  settings: AppSettings;
  progress: UserProgress;
  customActivities: Activity[];
  isLoading: boolean;
  newBadge: string | null;
  clearNewBadge: () => void;
  addTimer: (activityId: ActivityType, durationMinutes: number, customName?: string, soundToneId?: import("./types").SoundToneId) => void;
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

  const appStateRef = useRef(AppState.currentState);
  
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        reconcileTimersFromBackground();
      }
      appStateRef.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const reconcileTimersFromBackground = useCallback(async () => {
    const savedTimers = await storage.getTimers();
    const now = Date.now();
    
    const reconciledTimers = savedTimers.map((timer) => {
      if (!timer.isRunning || timer.isPaused || !timer.endTime) {
        return timer;
      }
      
      const remainingMs = timer.endTime - now;
      if (remainingMs <= 0) {
        handleTimerComplete(timer);
        return { 
          ...timer, 
          remainingSeconds: 0, 
          isRunning: false, 
          completedAt: timer.endTime,
          endTime: undefined,
          notificationId: null 
        };
      }
      
      return { ...timer, remainingSeconds: Math.ceil(remainingMs / 1000) };
    });
    
    setTimers(reconciledTimers);
    await storage.saveTimers(reconciledTimers);
  }, []);

  const loadData = async () => {
    const [savedTimers, savedSettings, savedProgress, savedCustomActivities] = await Promise.all([
      storage.getTimers(),
      storage.getSettings(),
      storage.getProgress(),
      storage.getCustomActivities(),
    ]);
    
    const now = Date.now();
    const reconciledTimers = savedTimers.map((timer) => {
      if (!timer.isRunning || timer.isPaused || !timer.endTime) {
        return timer;
      }
      
      const remainingMs = timer.endTime - now;
      if (remainingMs <= 0) {
        handleTimerComplete(timer);
        return { 
          ...timer, 
          remainingSeconds: 0, 
          isRunning: false, 
          completedAt: timer.endTime,
          endTime: undefined,
          notificationId: null 
        };
      }
      
      return { ...timer, remainingSeconds: Math.ceil(remainingMs / 1000) };
    });
    
    setTimers(reconciledTimers);
    setSettings(savedSettings);
    setProgress(savedProgress);
    setCustomActivities(savedCustomActivities);
    
    if (JSON.stringify(reconciledTimers) !== JSON.stringify(savedTimers)) {
      await storage.saveTimers(reconciledTimers);
    }
    
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
    if (settings.soundEnabled) {
      const soundToPlay = timer.soundToneId || settings.selectedSoundId;
      playCompletionSound(soundToPlay, { hapticsEnabled: settings.hapticsEnabled });
    } else if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const addTimer = useCallback(async (activityId: ActivityType, durationMinutes: number, customName?: string, soundToneId?: import("./types").SoundToneId) => {
    const activity = getActivityById(activityId);
    const customActivity = customActivities.find((a) => a.id === activityId);
    const name = customName || customActivity?.name || activity?.name || "Timer";
    const durationSeconds = durationMinutes * 60;
    const now = Date.now();
    
    const newTimer: Timer = {
      id: `timer_${now}`,
      activityId,
      activityName: name,
      durationSeconds,
      remainingSeconds: durationSeconds,
      isRunning: true,
      isPaused: false,
      createdAt: now,
      soundToneId: soundToneId || settings.selectedSoundId,
      endTime: now + (durationSeconds * 1000),
      notificationId: null,
    };

    const notificationId = await scheduleTimerNotification(newTimer);
    newTimer.notificationId = notificationId;

    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setTimers((prev) => {
      const updated = [newTimer, ...prev];
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled, customActivities, settings.selectedSoundId]);

  const removeTimer = useCallback(async (id: string) => {
    stopCompletionSound();
    const timerToRemove = timers.find((t) => t.id === id);
    if (timerToRemove?.notificationId) {
      await cancelTimerNotification(timerToRemove.notificationId);
    }
    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled, timers]);

  const toggleTimer = useCallback(async (id: string) => {
    const timer = timers.find((t) => t.id === id);
    if (!timer) return;

    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (timer.isPaused) {
      const now = Date.now();
      const newEndTime = now + (timer.remainingSeconds * 1000);
      const notificationId = await scheduleTimerNotification({ ...timer, remainingSeconds: timer.remainingSeconds });
      
      setTimers((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, isPaused: false, endTime: newEndTime, notificationId } : t
        );
        storage.saveTimers(updated);
        return updated;
      });
    } else {
      if (timer.notificationId) {
        await cancelTimerNotification(timer.notificationId);
      }
      
      setTimers((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, isPaused: true, endTime: undefined, notificationId: null } : t
        );
        storage.saveTimers(updated);
        return updated;
      });
    }
  }, [settings.hapticsEnabled, timers]);

  const resetTimer = useCallback(async (id: string) => {
    const timer = timers.find((t) => t.id === id);
    if (!timer) return;

    if (timer.notificationId) {
      await cancelTimerNotification(timer.notificationId);
    }

    if (settings.hapticsEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const now = Date.now();
    const newEndTime = now + (timer.durationSeconds * 1000);
    const resetTimerData = { ...timer, remainingSeconds: timer.durationSeconds };
    const notificationId = await scheduleTimerNotification(resetTimerData);

    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: t.durationSeconds, isRunning: true, isPaused: false, completedAt: undefined, endTime: newEndTime, notificationId }
          : t
      );
      storage.saveTimers(updated);
      return updated;
    });
  }, [settings.hapticsEnabled, timers]);

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
