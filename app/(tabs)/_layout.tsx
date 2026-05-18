import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { LayoutDashboard, MessageCircle, ShoppingBag, Trophy, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, Alert, BackHandler } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';

export default function TabsLayout() {
  const { isDark, isNeon } = useTheme();
  const router = useRouter();
  const { accountType, loadCloudFriendRequests, cloudFriendRequests, aiMode } = useAppStore();
  const previousCount = useRef(0);

  useEffect(() => {
    if (accountType !== 'cloud') return;
    loadCloudFriendRequests();
    const timer = setInterval(() => {
      loadCloudFriendRequests();
    }, 12000);
    return () => clearInterval(timer);
  }, [accountType]);

  useEffect(() => {
    if (accountType !== 'cloud') return;
    const current = cloudFriendRequests.length;
    if (current > previousCount.current && previousCount.current > 0) {
      useAppStore.getState().showAlert(
        'Neue Freundschaftsanfrage',
        'Du hast eine neue Anfrage. Jetzt anzeigen?',
        [
          { text: 'Später', style: 'cancel' },
          { text: 'Öffnen', onPress: () => router.push('/(tabs)/social') },
        ]
      );
    }
    previousCount.current = current;
  }, [cloudFriendRequests.length, accountType]);

  const activeColor = isNeon ? '#FF00E4' : '#FF7F24';
  const inactiveColor = isNeon ? '#FF00E480' : (isDark ? '#64748B' : '#AFAFAF');
  const bgColor = isNeon ? '#0D0221' : (isDark ? '#0F172A' : '#FFFFFF');
  const borderColor = isNeon ? '#FF00E440' : (isDark ? '#334155' : '#F2F2F2');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : bgColor,
          position: 'absolute',
          borderTopColor: borderColor,
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
          borderTopWidth: 2,
          elevation: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          ) : null
        ),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 4,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Held',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'KI',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={26} />,
          tabBarItemStyle: aiMode === 'off' ? { flex: 0, width: 0, height: 0, overflow: 'hidden', padding: 0, margin: 0 } : undefined,
          tabBarButton: aiMode === 'off' ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Erfolge',
          tabBarIcon: ({ color }) => <Trophy color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Gilde',
          tabBarIcon: ({ color }) => <Users color={color} size={26} />,
        }}
      />
    </Tabs>
  );
}
