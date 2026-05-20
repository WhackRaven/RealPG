import FoxMascot from '@/components/FoxMascot';
import { aiService } from '@/src/services/ai';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalysisScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  useEffect(() => {
    async function performAnalysis() {
      try {
        const profile = await getUserProfile();
        if (!profile) {
          router.replace('/welcome');
          return;
        }

        const result = await aiService.analyzeProfile(profile);
        if (result) {
          await saveUserProfile({
            hero_title: result.heroTitle,
            personality_type: result.personalityType,
            welcome_message: result.welcomeMessage,
            primary_category: result.primaryCategory,
            ...result.suggestedLevels
          });
        }
        
        // Kleine Verzögerung für das Feeling
        setTimeout(() => {
          router.replace('/summary');
        }, 2000);
      } catch (err) {
        console.error('Analysis failed:', err);
        router.replace('/summary');
      }
    }

    performAnalysis();
  }, []);

  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <FoxMascot 
          message="Momentchen... ich analysiere deine Antworten und bastel dir dein Helden-Profil! 🦊✨"
          expression="thinking"
        />
        <Text style={s.title}>KI-Analyse läuft...</Text>
        <ActivityIndicator size="large" color="#FF7F24" style={{ marginTop: 20 }} />
      </View>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#4B4B4B', marginTop: 24 },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#F1F5F9', marginTop: 24 },
});
