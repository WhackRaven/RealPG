import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, BackHandler, Platform } from 'react-native';
import { ThemeProvider as AppThemeProvider } from '@/src/context/ThemeContext';
import { useEffect } from 'react';
import CustomAlert from '@/components/CustomAlert';
import { notificationService } from '@/src/services/notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    notificationService.requestPermissions();
  }, []);

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)/welcome" />
          <Stack.Screen name="(onboarding)/step/[step]" />
          <Stack.Screen name="(onboarding)/summary" />
          <Stack.Screen name="(onboarding)/ai-setup" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/avatar" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/inventory" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/ai-models" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/nickname" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/security" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/about" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <CustomAlert />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
