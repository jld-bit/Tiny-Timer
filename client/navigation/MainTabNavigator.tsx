import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import TimersScreen from "@/screens/TimersScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import BadgesScreen from "@/screens/BadgesScreen";
import Svg, { Circle, Path, Rect, Line } from "react-native-svg";

function ClockIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function PlusCircleIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

function HistoryIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 7v5l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export type MainTabParamList = {
  TimersTab: undefined;
  AddTimerTab: undefined;
  BadgesTab: undefined;
  HistoryTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function AddTimerPlaceholder() {
  return <View />;
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="TimersTab"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="TimersTab"
        component={TimersScreen}
        options={{
          title: "Timers",
          tabBarIcon: ({ color, size }) => (
            <ClockIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTimerTab"
        component={AddTimerPlaceholder}
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <PlusCircleIcon size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("AddTimerModal");
          },
        })}
      />
      <Tab.Screen
        name="BadgesTab"
        component={BadgesScreen}
        options={{
          title: "Badges",
          tabBarIcon: ({ color, size }) => (
            <AwardIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <HistoryIcon size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});
