import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';
import { ShieldAlert, Zap, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CustomAlert() {
  const { isDark, isNeon } = useTheme();
  const { alertState, hideAlert } = useAppStore();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (alertState.visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      ]).start();
    }
  }, [alertState.visible]);

  if (!alertState.visible) return null;

  const s = isNeon ? stylesNeon : (isDark ? stylesDark : stylesLight);
  const isError = alertState.title.toLowerCase().includes('fehler') || alertState.title.toLowerCase().includes('nicht');
  const isSuccess = alertState.title.toLowerCase().includes('erfolg') || alertState.title.toLowerCase().includes('aktiv');

  return (
    <Modal transparent visible={true} animationType="none">
      <View style={s.overlay}>
        <Animated.View style={[s.alertBox, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={s.iconContainer}>
            {isError ? (
              <ShieldAlert color={isNeon ? '#FF00E4' : '#EF4444'} size={32} />
            ) : isSuccess ? (
              <Zap color={isNeon ? '#00F0FF' : '#10B981'} size={32} />
            ) : (
              <AlertCircle color={isNeon ? '#FF00E4' : '#FF7F24'} size={32} />
            )}
          </View>
          
          <Text style={s.title}>{alertState.title}</Text>
          {!!alertState.message && <Text style={s.message}>{alertState.message}</Text>}
          
          <View style={s.buttonContainer}>
            {alertState.buttons && alertState.buttons.length > 0 ? (
              alertState.buttons.map((btn, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[s.button, btn.style === 'cancel' ? s.cancelButton : s.confirmButton]} 
                  onPress={() => {
                    hideAlert();
                    if (btn.onPress) btn.onPress();
                  }}
                >
                  <Text style={[s.buttonText, btn.style === 'cancel' ? s.cancelText : s.confirmText]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={[s.button, s.confirmButton]} onPress={hideAlert}>
                <Text style={[s.buttonText, s.confirmText]}>Verstanden</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const baseStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: width - 40,
    maxWidth: 340,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'System',
  },
};

const stylesLight = StyleSheet.create({
  ...baseStyles as any,
  alertBox: { ...baseStyles.alertBox, backgroundColor: '#FFFFFF', borderColor: '#F2F2F2', shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20 },
  iconContainer: { ...baseStyles.iconContainer, backgroundColor: '#FFF5EE', borderColor: '#FFE4D6' },
  title: { ...baseStyles.title, color: '#4B4B4B' },
  message: { ...baseStyles.message, color: '#AFAFAF' },
  cancelButton: { backgroundColor: '#F9F9F9' },
  confirmButton: { backgroundColor: '#FF7F24' },
  cancelText: { color: '#AFAFAF' },
  confirmText: { color: '#FFFFFF' },
});

const stylesDark = StyleSheet.create({
  ...baseStyles as any,
  alertBox: { ...baseStyles.alertBox, backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 20 },
  iconContainer: { ...baseStyles.iconContainer, backgroundColor: '#2D1B0E', borderColor: '#472B15' },
  title: { ...baseStyles.title, color: '#F1F5F9' },
  message: { ...baseStyles.message, color: '#94A3B8' },
  cancelButton: { backgroundColor: '#334155' },
  confirmButton: { backgroundColor: '#FF7F24' },
  cancelText: { color: '#94A3B8' },
  confirmText: { color: '#FFFFFF' },
});

const stylesNeon = StyleSheet.create({
  ...baseStyles as any,
  alertBox: { ...baseStyles.alertBox, backgroundColor: '#0D0221', borderColor: '#FF00E4', shadowColor: '#FF00E4', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.4, shadowRadius: 20 },
  iconContainer: { ...baseStyles.iconContainer, backgroundColor: '#261447', borderColor: '#00F0FF' },
  title: { ...baseStyles.title, color: '#FFFFFF', textShadowColor: '#00F0FF', textShadowRadius: 5 },
  message: { ...baseStyles.message, color: '#FF00E4' },
  cancelButton: { backgroundColor: '#261447', borderWidth: 1, borderColor: '#00F0FF' },
  confirmButton: { backgroundColor: '#FF00E4' },
  cancelText: { color: '#00F0FF' },
  confirmText: { color: '#FFFFFF' },
});
