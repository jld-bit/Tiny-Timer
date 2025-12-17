export type ActivityType =
  | "homework"
  | "screen_time"
  | "brush_teeth"
  | "bedtime"
  | "playtime"
  | "cleanup"
  | "snack_time"
  | "reading"
  | "custom";

export interface Activity {
  id: ActivityType;
  name: string;
  defaultMinutes: number;
  icon: string;
}

export interface Timer {
  id: string;
  activityId: ActivityType;
  activityName: string;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface HistoryEntry {
  id: string;
  activityId: ActivityType;
  activityName: string;
  durationSeconds: number;
  completedAt: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const ACTIVITIES: Activity[] = [
  { id: "homework", name: "Homework", defaultMinutes: 30, icon: "book" },
  { id: "screen_time", name: "Screen Time", defaultMinutes: 30, icon: "monitor" },
  { id: "brush_teeth", name: "Brush Teeth", defaultMinutes: 2, icon: "droplet" },
  { id: "bedtime", name: "Bedtime", defaultMinutes: 15, icon: "moon" },
  { id: "playtime", name: "Playtime", defaultMinutes: 30, icon: "star" },
  { id: "cleanup", name: "Cleanup", defaultMinutes: 10, icon: "trash-2" },
  { id: "snack_time", name: "Snack Time", defaultMinutes: 15, icon: "coffee" },
  { id: "reading", name: "Reading", defaultMinutes: 20, icon: "book-open" },
];

export const getActivityById = (id: ActivityType): Activity | undefined => {
  return ACTIVITIES.find((a) => a.id === id);
};
