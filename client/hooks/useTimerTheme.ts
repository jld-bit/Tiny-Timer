import { useTimers } from "@/lib/timerContext";
import { THEMES, ThemeType } from "@/lib/types";

export function useTimerTheme() {
  const { settings } = useTimers();
  const selectedTheme = settings.selectedTheme || "default";
  const themeConfig = THEMES[selectedTheme] || THEMES["default"];
  const themeColors = themeConfig.colors;

  return {
    selectedTheme: selectedTheme as ThemeType,
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    accent: themeColors.accent,
    background: themeColors.background,
    themeName: themeConfig.name,
  };
}
