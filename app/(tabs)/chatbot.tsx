import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, Bot } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import FoxMascot from '@/components/FoxMascot';
import { useAppStore } from '@/src/store/useAppStore';

// ─── Fully local AI responses – no API needed ───
const REPLY_DB: Record<string, string[]> = {
  greeting: [
    'Hallo, Held! 🦊 Schön, dass du da bist! Was steht heute auf deinem Abenteuerplan?',
    'Hey Champion! 🌟 Bereit für den nächsten Quest? Ich helfe dir, den Tag zu rocken!',
    'Willkommen zurück! 🎮 Dein Fuchs-Buddy ist startklar. Was hast du heute vor?',
  ],
  motivation: [
    'Du bist stärker als du denkst! 💪 Fang mit einer kleinen Quest an – der Rest kommt von allein!',
    'Jeder Held hat mal einen schwierigen Tag. Aber weißt du was? Du bist trotzdem hier! Das zählt! 🔥',
    'Dein zukünftiges Ich wird dir danken! Eine Quest reicht – los gehts! 🚀',
    'Motivation kommt nicht vor dem Start, sondern danach! Mach einfach den ersten Schritt! ⭐',
    'Erinnere dich: Kleine Schritte führen zu großen Abenteuern! Du schaffst das! 🦊✨',
  ],
  quest_help: [
    'Tipp: Starte mit einer Easy-Quest! So baust du Schwung auf für die härteren! 🎯',
    'Versuch mal, deine Quests am Morgen zu erledigen – da ist die Willenskraft am stärksten! ⏰',
    'Pro-Tipp: Kombiniere Quests! Sport + Social = Zusammen joggen gehen! 🏃‍♂️👫',
    'Mach ein Foto als Beweis – das gibt dir ein extra Erfolgsgefühl! 📸✨',
  ],
  streak: [
    'Dein Streak ist dein mächtigstes Werkzeug! Halte ihn am Leben, egal wie klein die Quest ist! 🔥',
    'Streaks bauen Gewohnheiten auf. Und Gewohnheiten bauen Helden! Bleib dran! ⚡',
    'Selbst 1 Quest pro Tag hält deinen Streak. Qualität > Quantität! 🌟',
  ],
  xp_coins: [
    'XP sammeln? Erledige Quests aus verschiedenen Kategorien – das gibt Bonus-XP! 💰',
    'Tipp: Der tägliche Login-Bonus gibt dir gratis Blitze und XP! Komm jeden Tag vorbei! 🎁',
    'Spare Blitze für den XP-Booster im Shop – damit levelst du doppelt so schnell! ⚡',
    'Schwere Quests geben mehr XP und Blitze. Trau dich an die Medium/Hard Quests! 💎',
  ],
  sport: [
    'Sport-Quests sind mega für XP! Versuch mal 15 Minuten Yoga oder einen kurzen Spaziergang! 🧘',
    'Du musst kein Athlet sein! Schon 10 Minuten Bewegung am Tag machen einen riesigen Unterschied! 🏃',
    'Tipp: Mach Sport-Quests mit Freunden – zusammen macht es viel mehr Spaß! 💪',
  ],
  lernen: [
    'Lern-Quests bringen mega XP! 30 Minuten lesen oder ein Tutorial schauen reicht schon! 📚',
    'Tipp: Nutze die Pomodoro-Technik – 25 Min lernen, 5 Min Pause. Super effektiv! ⏱️',
    'Flashcards sind dein bester Freund beim Lernen. Klein, schnell, effektiv! 🧠',
  ],
  shop_info: [
    'Im Shop findest du coole Items! Der XP-Booster ist mega wertvoll – spar dafür! 🛒✨',
    'Der Streak-Schild schützt deinen Streak für einen Tag – perfekt für stressige Tage! 🛡️',
    'Das Neon-Theme im Shop sieht absolut episch aus! Spar dir 200 Blitze dafür! 🎨',
  ],
  social: [
    'Lade Freunde ein! Gemeinsam questen macht viel mehr Spaß und motiviert! 👫🦊',
    'Teile deinen Gilden-Code mit Freunden – zusammen seid ihr unschlagbar! ⚔️',
    'Check das Gilde-Ranking – ein bisschen Wettbewerb spornt an! 🏆',
  ],
  night: [
    'Es ist spät! Gönn dir Ruhe – morgen warten neue Abenteuer auf dich! 🌙💤',
    'Schlaf ist die beste Regeneration für jeden Helden! Gute Nacht, Champion! 😴⭐',
  ],
  thanks: [
    'Gerne! Dafür bin ich ja da! 🦊💛 Zusammen schaffen wir alles!',
    'Immer gern! Dein Fuchs-Buddy ist 24/7 für dich da! 🌟',
    'Kein Ding! Melde dich jederzeit, wenn du Hilfe brauchst! 💪🦊',
  ],
  joke: [
    'Warum joggen Programmierer nicht gern? Weil sie keine Bugs in der Natur fangen wollen! 😄🦊',
    'Was sagt ein Fuchs zum anderen? "Lass uns eine Quest machen!" 🎮🦊',
    'Mein Lieblingswitz: Knock knock! Wer da? XP! XP wer? XP-ert für Abenteuer! 😂',
  ],
  fallback: [
    'Das klingt spannend! 🦊 Vielleicht lässt sich daraus eine coole Quest basteln?',
    'Interessant! Bleib am Ball – jeder Tag bringt dich deinem Level-Up näher! 🚀',
    'Gute Gedanken! Denk dran: Ein Held ruht sich nie auf seinen Lorbeeren aus! ⚔️✨',
    'Genau die richtige Einstellung! Weiter so, Champion! 💪🔥',
    'Das könnte ein perfektes Thema für eine neue Quest sein! Was meinst du? 🎯',
    'Stark! So macht das Abenteuer Spaß. Dein Fuchs ist stolz auf dich! 🦊⭐',
    'Lass uns das gemeinsam angehen! Schritt für Schritt zum Ziel! 🏆',
  ],
};

function classifyMessage(msg: string): string {
  const lower = msg.toLowerCase().trim();

  if (/^(hallo|hi|hey|moin|servus|guten|morgen|abend|tag)/.test(lower)) return 'greeting';
  if (/danke|thx|thanks|dankeschön|merci/.test(lower)) return 'thanks';
  if (/(witz|joke|lach|lustig|humor|spaß)/.test(lower)) return 'joke';
  if (/(motiv|keine lust|faul|schaff|müde|schwer|aufgeb|stress|überfordert|unmotiv|antrieb)/.test(lower)) return 'motivation';
  if (/(quest|tipp|hilf|rat|was soll|wie|strateg|empfehl|vorschlag)/.test(lower)) return 'quest_help';
  if (/(streak|serie|tag.*folge|am ball|durchhalten)/.test(lower)) return 'streak';
  if (/(xp|coin|münz|gold|level|punkt|belohn)/.test(lower)) return 'xp_coins';
  if (/(sport|train|lauf|jog|fit|gym|yoga|push|liegestütz|bewegung)/.test(lower)) return 'sport';
  if (/(lern|buch|les|studi|schul|uni|kurs|bildung|wissen)/.test(lower)) return 'lernen';
  if (/(shop|kauf|markt|item|laden|booster|boost)/.test(lower)) return 'shop_info';
  if (/(freund|gilde|social|zusammen|team|einlad|code)/.test(lower)) return 'social';
  if (/(nacht|schlaf|spät|müde|bett|gute nacht|gn)/.test(lower)) return 'night';

  return 'fallback';
}

function getSmartReply(message: string, stats: any): string {
  const category = classifyMessage(message);
  const replies = REPLY_DB[category] || REPLY_DB.fallback;
  let reply = replies[Math.floor(Math.random() * replies.length)];

  // Add personalized context based on user stats
  if (stats) {
    if (stats.streak > 5 && category === 'greeting') {
      reply += ` Übrigens: ${stats.streak} Tage Streak – das ist unglaublich! 🔥`;
    }
    if (stats.level >= 10 && category === 'motivation') {
      reply = `Als Level ${stats.level} ${stats.title} weißt du doch, was du drauf hast! ` + reply;
    }
    if (stats.coins > 200 && category === 'shop_info') {
      reply += ` Mit ${stats.coins} Blitze kannst du dir einiges gönnen!`;
    }
  }

  return reply;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { isDark, isNeon } = useTheme();
  const { stats, aiCooldownUntil, startAICooldown } = useAppStore();
  const s = isNeon ? stylesNeon : (isDark ? stylesDark : stylesLight);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hallo! 🦊 Ich bin QuestMaster, dein persönlicher Fuchs-Assistent! Frag mich alles rund um Quests, Motivation, Tipps oder einfach zum Plaudern!',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!aiCooldownUntil) {
      setCountdown(0);
      return;
    }
    const updateTimer = () => {
      const rem = Math.max(0, Math.ceil((aiCooldownUntil - Date.now()) / 1000));
      setCountdown(rem);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [aiCooldownUntil]);

  // Typing animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isLoading]);

  // Keyboard listeners to adjust input position when keyboard opens/closes
  useEffect(() => {
    const onShow = (e: any) => setKeyboardOffset(e.endCoordinates?.height || 250);
    const onHide = () => setKeyboardOffset(0);
    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (aiCooldownUntil && Date.now() < aiCooldownUntil) {
      const remaining = Math.ceil((aiCooldownUntil - Date.now()) / 1000);
      useAppStore.getState().showAlert("KI Cooldown", `Bitte warte noch ${remaining} Sekunden, bevor du die KI erneut nutzt.`);
      return;
    }

    startAICooldown();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Du bist QuestMaster, ein freundlicher Fuchs-Assistent für die Dark-Fantasy Todo App RealPG. Antworte kurz, motivierend und auf Deutsch mit Emojis. Der User hat Level ${stats?.level || 1} und einen Streak von ${stats?.streak || 0}.` },
            ...messages.slice(0, 5).reverse().map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ]
        })
      });
      
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || getSmartReply(userMessage.content, stats);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [assistantMessage, ...prev]);
    } catch (error) {
      console.log('Pollinations AI Error:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSmartReply(userMessage.content, stats),
        timestamp: new Date(),
      };
      setMessages(prev => [fallbackMessage, ...prev]);
    } finally {
      setIsLoading(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[s.messageContainer, item.role === 'user' ? s.userMessage : s.assistantMessage]}>
      {item.role === 'assistant' && (
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>🦊</Text>
        </View>
      )}
      <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.assistantBubble]}>
        <Text style={[s.messageText, item.role === 'user' && s.userText]}>{item.content}</Text>
        <Text style={s.timestamp}>
          {item.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.role === 'user' && (
        <View style={s.userAvatar}>
          <Text style={s.userAvatarEmoji}>⚔️</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Bot color={isNeon ? '#00F0FF' : '#FF7F24'} size={24} />
          </View>
          <View>
            <Text style={s.headerTitle}>QUESTMASTER</Text>
            <Text style={s.headerSub}>Dein Fuchs-Assistent</Text>
          </View>
        </View>
        <View style={[s.aiBadge, countdown > 0 && { backgroundColor: isNeon ? '#3D002E' : (isDark ? '#334155' : '#F2F2F2'), borderColor: isNeon ? '#FF00E4' : '#AFAFAF' }]}>
          <Sparkles size={12} color={countdown > 0 ? (isNeon ? '#FF00E4' : '#AFAFAF') : (isNeon ? '#FF00E4' : '#10B981')} />
          <Text style={[s.aiBadgeText, countdown > 0 && { color: isNeon ? '#FF00E4' : (isDark ? '#94A3B8' : '#AFAFAF') }]}>
            {countdown > 0 ? `COOLDOWN (${countdown}s)` : 'CLOUD-KI'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[s.messageList, { paddingTop: 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          inverted={true}
          ListHeaderComponent={isLoading ? (
            <View style={[s.messageContainer, s.assistantMessage, { marginBottom: 16 }]}>
              <View style={s.avatar}>
                <Text style={s.avatarEmoji}>🦊</Text>
              </View>
              <Animated.View style={[s.bubble, s.assistantBubble, s.typingBubble, { opacity: Animated.add(0.5, Animated.multiply(typingAnim, 0.5)) }]}>
                <Text style={s.typingText}>tippt...</Text>
              </Animated.View>
            </View>
          ) : null}
        />

        <View style={[s.inputContainer, { paddingBottom: 90 }]}>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              placeholder="Frag die KI..."
              placeholderTextColor={isDark ? '#64748B' : '#AFAFAF'}
              value={inputText}
              onChangeText={setInputText}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[s.sendButton, (!inputText.trim() || isLoading) && s.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Send color={inputText.trim() ? '#FFFFFF' : (isDark ? '#475569' : '#AFAFAF')} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Quick reply suggestions (not rendered yet, for future use) ───

const baseStyles = {
  messageList: { padding: 16, paddingBottom: 20 },
  messageContainer: { flexDirection: 'row' as const, marginBottom: 16, alignItems: 'flex-end' as const },
  userMessage: { justifyContent: 'flex-end' as const },
  assistantMessage: { justifyContent: 'flex-start' as const },
  avatarEmoji: { fontSize: 20 },
  userAvatarEmoji: { fontSize: 16 },
  bubble: { maxWidth: '75%' as any, padding: 14, borderRadius: 20, paddingBottom: 8 },
  userText: { color: '#FFFFFF' },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 18 },
};

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F2F2F2' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#4B4B4B', letterSpacing: 1 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#AFAFAF', marginTop: 1 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  aiBadgeText: { fontSize: 10, fontWeight: '900', color: '#10B981' },
  ...baseStyles,
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 2, borderColor: '#F2F2F2' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  assistantBubble: { backgroundColor: '#F9F9F9', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F2F2F2' },
  userBubble: { backgroundColor: '#FF7F24', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#4B4B4B', lineHeight: 22, fontWeight: '600' },
  timestamp: { fontSize: 10, color: '#CFCFCF', marginTop: 6, textAlign: 'right' as any, fontWeight: '600' },
  typingText: { fontSize: 14, color: '#AFAFAF', fontStyle: 'italic', fontWeight: '600' },
  inputContainer: { padding: 16, paddingBottom: 8, backgroundColor: '#FFFFFF', borderTopWidth: 2, borderTopColor: '#F2F2F2' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F9F9F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#F2F2F2' },
  input: { flex: 1, fontSize: 15, color: '#4B4B4B', maxHeight: 100, fontWeight: '500' },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonDisabled: { backgroundColor: '#F2F2F2' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#334155' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#F1F5F9', letterSpacing: 1 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 1 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#052E16', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  aiBadgeText: { fontSize: 10, fontWeight: '900', color: '#10B981' },
  ...baseStyles,
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 2, borderColor: '#334155' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  assistantBubble: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  userBubble: { backgroundColor: '#FF7F24', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#F1F5F9', lineHeight: 22, fontWeight: '600' },
  timestamp: { fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'right' as any, fontWeight: '600' },
  typingText: { fontSize: 14, color: '#64748B', fontStyle: 'italic', fontWeight: '600' },
  inputContainer: { padding: 16, paddingBottom: 8, backgroundColor: '#0F172A', borderTopWidth: 2, borderTopColor: '#334155' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#334155' },
  input: { flex: 1, fontSize: 15, color: '#F1F5F9', maxHeight: 100, fontWeight: '500' },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonDisabled: { backgroundColor: '#334155' },
});

const stylesNeon = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0221' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#FF00E4' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#261447', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00F0FF' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textShadowColor: '#00F0FF', textShadowRadius: 5 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#00F0FF', marginTop: 1 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2D0054', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#FF00E4' },
  aiBadgeText: { fontSize: 10, fontWeight: '900', color: '#FF00E4' },
  ...baseStyles,
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#261447', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 2, borderColor: '#00F0FF' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF00E4', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  assistantBubble: { backgroundColor: '#261447', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#00F0FF' },
  userBubble: { backgroundColor: '#FF00E4', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#FFFFFF', lineHeight: 22, fontWeight: '600' },
  timestamp: { fontSize: 10, color: '#FF00E480', marginTop: 6, textAlign: 'right' as any, fontWeight: '600' },
  typingText: { fontSize: 14, color: '#00F0FF', fontStyle: 'italic', fontWeight: '600' },
  inputContainer: { padding: 16, paddingBottom: 8, backgroundColor: '#0D0221', borderTopWidth: 2, borderTopColor: '#FF00E4' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#261447', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#00F0FF' },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF', maxHeight: 100, fontWeight: '500' },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF00E4', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonDisabled: { backgroundColor: '#2D0054' },
});