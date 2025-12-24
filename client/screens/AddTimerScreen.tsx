import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Pressable, Platform, TextInput, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Line, Rect, Polygon } from "react-native-svg";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useTimers } from "@/lib/timerContext";
import { ACTIVITIES, Activity, ActivityType, SOUND_TONES, SoundToneId } from "@/lib/types";
import { previewSound } from "@/lib/sounds";
import { Spacing, Colors, BorderRadius, ActivityColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

function CloseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SmartphoneIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="18" x2="12" y2="18.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function BellIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VolumeIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function MusicIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
      <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function SpeakerIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="6" x2="12" y2="6.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function GiftIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="8" width="18" height="4" stroke={color} strokeWidth="2" />
      <Rect x="5" y="12" width="14" height="9" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="8" x2="12" y2="21" stroke={color} strokeWidth="2" />
      <Path d="M12 8C12 8 12 5 9 5C6 5 6 8 9 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 8C12 8 12 5 15 5C18 5 18 8 15 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function FeatherIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="16" y1="8" x2="2" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="17.5" y1="15" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function SmileIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="9" y1="9" x2="9.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="15" y1="9" x2="15.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DiscIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function AwardIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" />
      <Path d="M9 13.5L7 22l5-3 5 3-2-8.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const SoundIconMap: Record<string, React.FC<{ size: number; color: string }>> = {
  smartphone: SmartphoneIcon,
  bell: BellIcon,
  "volume-2": VolumeIcon,
  music: MusicIcon,
  speaker: SpeakerIcon,
  gift: GiftIcon,
  feather: FeatherIcon,
  smile: SmileIcon,
  star: StarIcon,
  disc: DiscIcon,
  award: AwardIcon,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const activityImages: Record<string, any> = {
  homework: require("@/assets/activities/homework_activity_icon.png"),
  screen_time: require("@/assets/activities/screen_time_activity_icon.png"),
  brush_teeth: require("@/assets/activities/brush_teeth_activity_icon.png"),
  bedtime: require("@/assets/activities/bedtime_activity_icon.png"),
  playtime: require("@/assets/activities/playtime_activity_icon.png"),
  cleanup: require("@/assets/activities/cleanup_activity_icon.png"),
  snack_time: require("@/assets/activities/snack_time_activity_icon.png"),
  reading: require("@/assets/activities/reading_time_activity_icon.png"),
  exercise: require("@/assets/activities/playtime_activity_icon.png"),
  music: require("@/assets/activities/playtime_activity_icon.png"),
  art: require("@/assets/activities/homework_activity_icon.png"),
  quiet_time: require("@/assets/activities/bedtime_activity_icon.png"),
};

const MINUTE_OPTIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActivityOption({
  activity,
  isSelected,
  onPress,
}: {
  activity: Activity;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const activityColor = ActivityColors[activity.id] || Colors.light.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.activityOption,
        {
          backgroundColor: isSelected ? activityColor + "20" : theme.backgroundDefault,
          borderColor: isSelected ? activityColor : "transparent",
          borderWidth: 2,
        },
        animatedStyle,
      ]}
    >
      {activityImages[activity.id] ? (
        <Image
          source={activityImages[activity.id]}
          style={[
            styles.activityImage,
            { tintColor: isSelected ? activityColor : theme.textSecondary }
          ]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.activityIconFallback, { backgroundColor: activityColor + "30" }]}>
          <ThemedText type="bodyMedium" style={{ color: activityColor }}>
            {activity.name.charAt(0)}
          </ThemedText>
        </View>
      )}
      <ThemedText
        type="small"
        style={[
          styles.activityName,
          { color: isSelected ? activityColor : theme.text },
        ]}
        numberOfLines={1}
      >
        {activity.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

function MinuteOption({
  minutes,
  isSelected,
  onPress,
  selectedActivityColor,
}: {
  minutes: number;
  isSelected: boolean;
  onPress: () => void;
  selectedActivityColor: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.minuteOption,
        {
          backgroundColor: isSelected ? selectedActivityColor : theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="h4"
        style={[
          styles.minuteText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {minutes}
      </ThemedText>
      <ThemedText
        type="caption"
        style={[
          styles.minuteLabel,
          { color: isSelected ? "#FFFFFF" : theme.textSecondary },
        ]}
      >
        min
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function AddTimerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addTimer, customActivities, settings } = useTimers();
  
  const allActivities = [...ACTIVITIES, ...customActivities];
  
  const [selectedActivity, setSelectedActivity] = useState<Activity>(ACTIVITIES[0]);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    ACTIVITIES[0].defaultMinutes
  );
  const [customTimerName, setCustomTimerName] = useState("");
  const [selectedSoundId, setSelectedSoundId] = useState<SoundToneId>(settings.selectedSoundId);
  
  const selectedActivityColor = ActivityColors[selectedActivity.id] || Colors.light.primary;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <CloseIcon size={24} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedMinutes(activity.defaultMinutes);
  };

  const handleStartTimer = () => {
    const customName = customTimerName.trim() || (selectedActivity.isCustom ? selectedActivity.name : undefined);
    addTimer(selectedActivity.id as ActivityType, selectedMinutes, customName, selectedSoundId);
    navigation.goBack();
  };

  const handleSoundSelect = (soundId: SoundToneId) => {
    setSelectedSoundId(soundId);
    previewSound(soundId, settings.hapticsEnabled);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Choose Activity
          </ThemedText>
          <View style={styles.activitiesGrid}>
            {allActivities.map((activity) => (
              <ActivityOption
                key={activity.id}
                activity={activity}
                isSelected={selectedActivity.id === activity.id}
                onPress={() => handleActivitySelect(activity)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Timer Name (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={customTimerName}
            onChangeText={setCustomTimerName}
            placeholder={`e.g., Math homework, Piano practice`}
            placeholderTextColor={theme.textSecondary}
            maxLength={40}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Set Duration
          </ThemedText>
          <View style={styles.minutesGrid}>
            {MINUTE_OPTIONS.map((minutes) => (
              <MinuteOption
                key={minutes}
                minutes={minutes}
                isSelected={selectedMinutes === minutes}
                onPress={() => setSelectedMinutes(minutes)}
                selectedActivityColor={selectedActivityColor}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Completion Sound
          </ThemedText>
          <View style={styles.soundsGrid}>
            {SOUND_TONES.map((tone) => {
              const isSelected = selectedSoundId === tone.id;
              const IconComponent = SoundIconMap[tone.icon] || BellIcon;
              return (
                <Pressable
                  key={tone.id}
                  onPress={() => handleSoundSelect(tone.id)}
                  style={[
                    styles.soundOption,
                    {
                      backgroundColor: isSelected ? selectedActivityColor + "20" : theme.backgroundDefault,
                      borderColor: isSelected ? selectedActivityColor : "transparent",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.soundIconContainer,
                      { backgroundColor: isSelected ? selectedActivityColor : theme.backgroundTertiary },
                    ]}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? "#FFFFFF" : theme.textSecondary}
                    />
                  </View>
                  <ThemedText
                    type="small"
                    style={{ color: isSelected ? selectedActivityColor : theme.text }}
                  >
                    {tone.name}
                  </ThemedText>
                  {isSelected ? (
                    <CheckIcon size={14} color={selectedActivityColor} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Button onPress={handleStartTimer} style={[styles.startButton, { backgroundColor: selectedActivityColor }]}>
          {customTimerName.trim() ? "Start Timer" : `Start ${selectedActivity.name} Timer`}
        </Button>
      </View>
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
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  activityOption: {
    width: "30%",
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  activityName: {
    textAlign: "center",
  },
  activityImage: {
    width: 32,
    height: 32,
  },
  activityIconFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  minutesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  minuteOption: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  minuteText: {
    textAlign: "center",
  },
  minuteLabel: {
    textAlign: "center",
  },
  nameInput: {
    fontSize: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  startButton: {
    backgroundColor: Colors.light.primary,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  soundsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  soundOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
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
