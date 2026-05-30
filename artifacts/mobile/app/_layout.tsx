import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/context/AppContext';
import { DBProvider } from '@/context/DBContext';
import { SecurityProvider, useSecurity } from '@/context/SecurityContext';

function LockGuard({ children }: { children: React.ReactNode }) {
  const { isLocked } = useSecurity();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inLockScreen = segments[0] === 'lock';
    if (isLocked && !inLockScreen) {
      router.replace('/lock');
    } else if (!isLocked && inLockScreen) {
      router.replace('/(tabs)');
    }
  }, [isLocked, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <DBProvider>
            <SecurityProvider>
              <StatusBar style="light" backgroundColor="#080818" />
              <LockGuard>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="lock" options={{ animation: 'fade' }} />
                  <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                  <Stack.Screen
                    name="add-income"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="add-expense"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen name="targets" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="recurring" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="export-center" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                </Stack>
              </LockGuard>
            </SecurityProvider>
          </DBProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
