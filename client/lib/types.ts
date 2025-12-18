export type ActivityType =
  | "homework"
  | "screen_time"
  | "brush_teeth"
  | "bedtime"
  | "playtime"
  | "cleanup"
  | "snack_time"
  | "reading"
  | "exercise"
  | "music"
  | "art"
  | "quiet_time"
  | "custom";

export type ThemeType = "default" | "animals" | "space" | "underwater";

export type SoundToneId = 
  | "chime"
  | "bell"
  | "xylophone"
  | "whistle"
  | "celebration"
  | "gentle"
  | "playful"
  | "magic"
  | "drumroll"
  | "fanfare"
  | "vibrate_only";

export interface SoundTone {
  id: SoundToneId;
  name: string;
  icon: string;
}

export const SOUND_TONES: SoundTone[] = [
  { id: "vibrate_only", name: "Vibrate Only", icon: "phone-portrait-outline" },
  { id: "chime", name: "Chime", icon: "notifications-outline" },
  { id: "bell", name: "Bell", icon: "volume-high-outline" },
  { id: "xylophone", name: "Xylophone", icon: "musical-notes-outline" },
  { id: "whistle", name: "Whistle", icon: "megaphone-outline" },
  { id: "celebration", name: "Celebration", icon: "gift-outline" },
  { id: "gentle", name: "Gentle", icon: "leaf-outline" },
  { id: "playful", name: "Playful", icon: "happy-outline" },
  { id: "magic", name: "Magic", icon: "star-outline" },
  { id: "drumroll", name: "Drumroll", icon: "disc-outline" },
  { id: "fanfare", name: "Fanfare", icon: "ribbon-outline" },
];

export interface Activity {
  id: ActivityType;
  name: string;
  defaultMinutes: number;
  icon: string;
  isCustom?: boolean;
  label?: string;
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
  soundToneId?: SoundToneId;
}

export interface HistoryEntry {
  id: string;
  activityId: ActivityType;
  activityName: string;
  durationSeconds: number;
  completedAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: number;
  requirement: {
    type: "total_timers" | "streak" | "activity_count" | "total_minutes";
    count: number;
    activityId?: ActivityType;
  };
}

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  selectedTheme: ThemeType;
  selectedSoundId: SoundToneId;
}

export interface UserProgress {
  totalTimersCompleted: number;
  totalMinutesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  activityCounts: Record<string, number>;
  earnedBadges: string[];
}

export const ACTIVITIES: Activity[] = [
  { id: "homework", name: "Homework", defaultMinutes: 30, icon: "book-outline" },
  { id: "screen_time", name: "Screen Time", defaultMinutes: 30, icon: "tv-outline" },
  { id: "brush_teeth", name: "Brush Teeth", defaultMinutes: 2, icon: "water-outline" },
  { id: "bedtime", name: "Bedtime", defaultMinutes: 15, icon: "moon-outline" },
  { id: "playtime", name: "Playtime", defaultMinutes: 30, icon: "star-outline" },
  { id: "cleanup", name: "Cleanup", defaultMinutes: 10, icon: "trash-outline" },
  { id: "snack_time", name: "Snack Time", defaultMinutes: 15, icon: "cafe-outline" },
  { id: "reading", name: "Reading", defaultMinutes: 20, icon: "library-outline" },
  { id: "exercise", name: "Exercise", defaultMinutes: 20, icon: "fitness-outline" },
  { id: "music", name: "Music", defaultMinutes: 30, icon: "musical-notes-outline" },
  { id: "art", name: "Art Time", defaultMinutes: 30, icon: "color-palette-outline" },
  { id: "quiet_time", name: "Quiet Time", defaultMinutes: 15, icon: "volume-mute-outline" },
];

export const getActivityById = (id: ActivityType): Activity | undefined => {
  return ACTIVITIES.find((a) => a.id === id);
};

export const BADGES: Badge[] = [
  {
    id: "first_timer",
    name: "First Timer",
    description: "Complete your first timer",
    icon: "ribbon-outline",
    color: "#FFD93D",
    requirement: { type: "total_timers", count: 1 },
  },
  {
    id: "timer_champion",
    name: "Timer Champion",
    description: "Complete 10 timers",
    icon: "ribbon-outline",
    color: "#4ECDC4",
    requirement: { type: "total_timers", count: 10 },
  },
  {
    id: "timer_master",
    name: "Timer Master",
    description: "Complete 50 timers",
    icon: "star-outline",
    color: "#FF6B6B",
    requirement: { type: "total_timers", count: 50 },
  },
  {
    id: "homework_hero",
    name: "Homework Hero",
    description: "Complete 5 homework timers",
    icon: "book-outline",
    color: "#FF6B6B",
    requirement: { type: "activity_count", count: 5, activityId: "homework" },
  },
  {
    id: "clean_machine",
    name: "Clean Machine",
    description: "Complete 5 cleanup timers",
    icon: "trash-outline",
    color: "#FF9F43",
    requirement: { type: "activity_count", count: 5, activityId: "cleanup" },
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Complete 5 reading timers",
    icon: "library-outline",
    color: "#4ECDC4",
    requirement: { type: "activity_count", count: 5, activityId: "reading" },
  },
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Complete timers 3 days in a row",
    icon: "flash-outline",
    color: "#FFD93D",
    requirement: { type: "streak", count: 3 },
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Complete timers 7 days in a row",
    icon: "flash-outline",
    color: "#7C83FD",
    requirement: { type: "streak", count: 7 },
  },
  {
    id: "hour_hero",
    name: "Hour Hero",
    description: "Complete 60 minutes of timers",
    icon: "time-outline",
    color: "#95E1D3",
    requirement: { type: "total_minutes", count: 60 },
  },
  {
    id: "time_titan",
    name: "Time Titan",
    description: "Complete 300 minutes of timers",
    icon: "time-outline",
    color: "#FF6B6B",
    requirement: { type: "total_minutes", count: 300 },
  },
];

export const THEMES: Record<ThemeType, { name: string; colors: { primary: string; secondary: string; accent: string; background: string } }> = {
  default: {
    name: "Classic",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
      accent: "#FFD93D",
      background: "#FFF9F0",
    },
  },
  animals: {
    name: "Safari",
    colors: {
      primary: "#8B4513",
      secondary: "#228B22",
      accent: "#FFD700",
      background: "#FFF8DC",
    },
  },
  space: {
    name: "Space",
    colors: {
      primary: "#9B59B6",
      secondary: "#3498DB",
      accent: "#F39C12",
      background: "#1A1A2E",
    },
  },
  underwater: {
    name: "Ocean",
    colors: {
      primary: "#00CED1",
      secondary: "#20B2AA",
      accent: "#FF7F50",
      background: "#E0FFFF",
    },
  },
};
