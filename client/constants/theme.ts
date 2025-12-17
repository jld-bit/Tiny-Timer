import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2D3436",
    textSecondary: "#636E72",
    buttonText: "#FFFFFF",
    tabIconDefault: "#636E72",
    tabIconSelected: "#FF6B6B",
    link: "#4ECDC4",
    backgroundRoot: "#FFF9F0",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F8F8F8",
    backgroundTertiary: "#F0F0F0",
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFD93D",
    success: "#95E1D3",
    error: "#FF6B6B",
    border: "#E8E8E8",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF6B6B",
    link: "#4ECDC4",
    backgroundRoot: "#1F2123",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFD93D",
    success: "#95E1D3",
    error: "#FF6B6B",
    border: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 60,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 72,
    fontWeight: "700" as const,
  },
  displayLarge: {
    fontSize: 96,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const ActivityColors: Record<string, string> = {
  homework: "#FF6B6B",
  screen_time: "#4ECDC4",
  brush_teeth: "#95E1D3",
  bedtime: "#7C83FD",
  playtime: "#FFD93D",
  cleanup: "#FF9F43",
  snack_time: "#F8B500",
  reading: "#4ECDC4",
  exercise: "#FF6B9D",
  music: "#9B59B6",
  art: "#E74C3C",
  quiet_time: "#3498DB",
  custom: "#B8B8B8",
};
