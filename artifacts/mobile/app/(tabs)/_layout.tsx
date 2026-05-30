import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
  color: string;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Dashboard', icon: 'home-outline', activeIcon: 'home', color: '#00d4ff' },
  { name: 'income', title: 'Pemasukan', icon: 'trending-up-outline', activeIcon: 'trending-up', color: '#00ff88' },
  { name: 'expenses', title: 'Pengeluaran', icon: 'trending-down-outline', activeIcon: 'trending-down', color: '#ff3366' },
  { name: 'analytics', title: 'Analitik', icon: 'bar-chart-outline', activeIcon: 'bar-chart', color: '#8b00ff' },
  { name: 'more', title: 'Lainnya', icon: 'grid-outline', activeIcon: 'grid', color: '#ffdd00' },
];

export default function TabLayout() {
  const isIOS = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#3a5a6a',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : '#0c0c20',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,212,255,0.15)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0c0c20' }]} />
          ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarActiveTintColor: tab.color,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
