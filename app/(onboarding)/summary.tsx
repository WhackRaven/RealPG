import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { getUserProfile, saveUserProfile, UserProfile } from '@/src/services/db';
import { useAppStore } from '@/src/store/useAppStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Summary() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const router = useRouter();
  const { aiMode } = useAppStore();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setInitLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveUserProfile({ onboarding_completed: true });
      if (aiMode === null) {
        router.replace('/(onboarding)/ai-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F24" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Zusammenfassung</Text>
        
        <FoxMascot 
          message={profile?.welcome_message || "Das sieht super aus! Bist du bereit für dein erstes Abenteuer?"} 
          expression="success" 
        />

        <View style={styles.card}>
          <SummaryItem label="Heldentitel" value={profile?.hero_title || 'Held des Alltags'} isHero />
          <SummaryItem label="Nickname" value={profile?.nickname || 'Held'} />
          <SummaryItem label="Persönlichkeit" value={profile?.personality_type || 'Abenteurer'} />
          <SummaryItem label="Primär-Fokus" value={profile?.primary_category || '-'} />
          <SummaryItem label="Sport-Level" value={profile?.sport_level || 'beginner'} />
          <SummaryItem label="Lern-Level" value={profile?.learning_level || 'beginner'} />
        </View>

      </ScrollView>
      <View style={styles.footer}>
        <CustomButton 
          title="Abenteuer starten" 
          onPress={handleFinish} 
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, isHero }: { label: string, value: string, isHero?: boolean }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isHero && styles.heroValue]}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'System',
    color: '#4B4B4B',
    textAlign: 'center',
    marginVertical: 10,
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 20,
    marginTop: 10,
  },
  item: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#AFAFAF',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#4B4B4B',
  },
  heroValue: {
    color: '#FF7F24',
    fontSize: 22,
    fontWeight: '900',
  },
  footer: {
    padding: 24,
  },
});
