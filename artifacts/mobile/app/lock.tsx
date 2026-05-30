import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useSecurity } from '@/context/SecurityContext';
import { useApp } from '@/context/AppContext';

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock, checkPin } = useSecurity();
  const { t } = useApp();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const ND = Platform.OS !== 'web';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: ND }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: ND }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  const tryBiometric = async () => {
    if (Platform.OS === 'web') { unlock(); return; }
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: t('unlockApp'),
        fallbackLabel: t('usePIN'),
      });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        unlock();
      }
    } catch {
      setShowPin(true);
    }
  };

  useEffect(() => { tryBiometric(); }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: ND }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: ND }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: ND }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: ND }),
    ]).start();
  };

  const handlePinDigit = (d: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = pin + d;
    setPin(next);
    setError('');
    if (next.length >= 6) {
      if (checkPin(next)) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        unlock();
      } else {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(t('wrongPIN'));
        shakeError();
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
    setError('');
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const top = Platform.OS === 'web' ? 67 : insets.top;

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#04041a', '#080818', '#04041a']} style={StyleSheet.absoluteFill} />
      {/* Neon grid background */}
      <View style={styles.gridBg} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${i * 14}%` as `${number}%` }]} />
        ))}
      </View>

      <View style={[styles.container, { paddingTop: top + 20 }]}>
        {/* Logo/Title */}
        <View style={styles.topSection}>
          <Animated.View style={[styles.fingerGlow, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.fingerContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient colors={['#00d4ff20', '#8b00ff20']} style={styles.fingerBg}>
              <Ionicons name="finger-print" size={64} color="#00d4ff" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.appName}>MENTERI KEUANGAN</Text>
          <Text style={styles.appSubName}>RUMAH TANGGA</Text>
          <Text style={styles.watermark}>WAROHATHUN NI'MAH</Text>
        </View>

        {!showPin ? (
          <View style={styles.biometricSection}>
            <Text style={styles.hint}>{t('touchFingerprint')}</Text>
            <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometric}>
              <LinearGradient colors={['#00d4ff', '#0080aa']} style={styles.biometricGrad}>
                <Ionicons name="finger-print" size={28} color="#080818" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPin(true)} style={styles.pinLink}>
              <Text style={styles.pinLinkText}>{t('usePIN')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>{t('enterPIN')}</Text>
            <Animated.View style={[styles.pinDots, { transform: [{ translateX: shakeAnim }] }]}>
              {[0,1,2,3,4,5].map(i => (
                <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
              ))}
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.keypad}>
              {DIGITS.map((d, i) => (
                d === '' ? <View key={i} style={styles.keyEmpty} /> :
                d === '⌫' ? (
                  <TouchableOpacity key={i} style={styles.keyBtn} onPress={handleBackspace}>
                    <Ionicons name="backspace" size={22} color="#6b9bb8" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={i} style={styles.keyBtn} onPress={() => handlePinDigit(d)}>
                    <Text style={styles.keyText}>{d}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
            <TouchableOpacity onPress={() => { setShowPin(false); setPin(''); }} style={styles.pinLink}>
              <Text style={styles.pinLinkText}>Gunakan Biometrik</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  gridBg: { position: 'absolute', width: '100%', height: '100%' },
  gridLine: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(0,212,255,0.05)' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 40 },
  topSection: { alignItems: 'center', marginBottom: 40 },
  fingerGlow: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,212,255,0.15)',
    top: -20,
  },
  fingerContainer: {
    marginBottom: 16,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  fingerBg: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)',
  },
  appName: { color: '#00d4ff', fontSize: 20, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  appSubName: { color: '#8b00ff', fontSize: 14, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  watermark: { color: 'rgba(139,0,255,0.6)', fontSize: 11, letterSpacing: 2, fontStyle: 'italic' },
  biometricSection: { alignItems: 'center', gap: 16 },
  hint: { color: '#6b9bb8', fontSize: 14, textAlign: 'center' },
  biometricBtn: {
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  biometricGrad: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  pinLink: { paddingVertical: 8 },
  pinLinkText: { color: '#00d4ff', fontSize: 14, fontWeight: '600' },
  pinSection: { alignItems: 'center', gap: 16, width: '100%' },
  pinLabel: { color: '#e0f7ff', fontSize: 16, fontWeight: '600' },
  pinDots: { flexDirection: 'row', gap: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: 'rgba(0,212,255,0.4)' },
  dotFilled: { backgroundColor: '#00d4ff', borderColor: '#00d4ff' },
  errorText: { color: '#ff3366', fontSize: 13, fontWeight: '600' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 12, justifyContent: 'center' },
  keyBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  keyEmpty: { width: 68, height: 68 },
  keyText: { color: '#e0f7ff', fontSize: 22, fontWeight: '600' },
});
