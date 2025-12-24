import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Svg, { Line } from "react-native-svg";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AddTimerScreen from "@/screens/AddTimerScreen";
import TimerDetailScreen from "@/screens/TimerDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ParentDashboardScreen from "@/screens/ParentDashboardScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

function CloseButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <Pressable 
      onPress={onPress} 
      style={styles.closeButton}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

export type RootStackParamList = {
  Main: undefined;
  AddTimerModal: undefined;
  TimerDetail: { timerId: string };
  Settings: undefined;
  ParentDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTimerModal"
        component={AddTimerScreen}
        options={({ navigation }) => ({
          presentation: "fullScreenModal",
          headerTitle: "New Timer",
          headerLeft: () => (
            <CloseButton 
              onPress={() => navigation.goBack()} 
              color={theme.text} 
            />
          ),
        })}
      />
      <Stack.Screen
        name="TimerDetail"
        component={TimerDetailScreen}
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="ParentDashboard"
        component={ParentDashboardScreen}
        options={{
          headerTitle: "Parent Dashboard",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
