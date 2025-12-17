import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Timer, HistoryEntry, AppSettings, ActivityType, getActivityById } from "./types";
import { storage } from "./storage";

interface TimerContextType {
  timers: Timer[];
  settings: AppSettings;
  isLoading: boolean;
  addTimer: (activityId: ActivityType, durationMinutes: number, customName?: string) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ soundEnabled: true, hapticsEnabled: true });
  const [isLoading, setIsLoading] = useState(true);
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
    const [savedTimers, savedSettings] = await Promise.all([
      storage.getTimers(),
      storage.getSettings(),
    ]);
    setTimers(savedTimers);
    setSettings(savedSettings);
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

  const handleTimerComplete = async (timer: Timer) => {
    if (settings.hapticsEnabled && Platform.OS !== "web") {
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
  };

  const addTimer = useCallback((activityId: ActivityType, durationMinutes: number, customName?: string) => {
    const activity = getActivityById(activityId);
    const name = customName || activity?.name || "Timer";
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
  }, [settings.hapticsEnabled]);

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

  return (
    <TimerContext.Provider
      value={{
        timers,
        settings,
        isLoading,
        addTimer,
        removeTimer,
        toggleTimer,
        resetTimer,
        updateSettings,
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
