import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ventures',
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'Audit Deal',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Syndicate',
        }}
      />
    </Tabs>
  );
}
