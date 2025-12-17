import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AddTimerScreen from "@/screens/AddTimerScreen";
import TimerDetailScreen from "@/screens/TimerDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ParentDashboardScreen from "@/screens/ParentDashboardScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

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
        options={{
          presentation: "modal",
          headerTitle: "New Timer",
        }}
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
