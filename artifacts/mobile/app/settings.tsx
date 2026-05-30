import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '@/context/AppContext';
import { useSecurity } from '@/context/SecurityContext';
import { GlassCard } from '@/components/GlassCard';
import { Language } from '@/constants/translations';

const TIMEOUTS = [
  { label: 'Segera', value: 0 },
  { label: '1 Menit', value: 60000 },
  { label: '5 Menit', value: 300000 },
  { label: '15 Menit', value: 900000 },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useApp();
  const { biometricEnabled, setBiometricEnabled, pin, setPin, lockTimeout, setLockTimeout } = useSecurity();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      LocalAuthentication.hasHardwareAsync().then(setHasBiometric);
    }
  }, []);

  const toggleBiometric = async () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Biometrik tidak tersedia di web');
      return;
    }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Verifikasi biometrik' });
    if (res.success) {
      setBiometricEnabled(true);
      Alert.alert('Berhasil', t('biometricEnabled'));
    }
  };

  const openPinModal = () => {
    setPinInput('');
    setPinConfirm('');
    setPinStep('enter');
    setPinModalVisible(true);
  };

  const handlePinSave = () => {
    if (pinStep === 'enter') {
      if (pinInput.length < 4) {
        Alert.alert('Error', 'PIN minimal 4 digit');
        return;
      }
      setPinStep('confirm');
      setPinConfirm('');
    } else {
      if (pinInput !== pinConfirm) {
        Alert.alert('Error', 'PIN tidak cocok. Coba lagi.');
        setPinStep('enter');
        setPinInput('');
        setPinConfirm('');
        return;
      }
      setPin(pinInput);
      setPinModalVisible(false);
      Alert.alert('Berhasil', 'PIN berhasil diatur');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#00ff88" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + bottom }]}>

        {/* Language */}
        <GlassCard style={styles.section} neonColor="#00d4ff">
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.langRow}>
            {(['id', 'en'] as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langBtn, language === lang && styles.langActive]}
              >
                <Text style={styles.langFlag}>{lang === 'id' ? '🇮🇩' : '🇬🇧'}</Text>
                <Text style={[styles.langText, language === lang && styles.langTextActive]}>
                  {lang === 'id' ? 'Indonesia' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Security */}
        <GlassCard style={styles.section} neonColor="#ff3366">
          <Text style={styles.sectionTitle}>{t('security')}</Text>

          {(hasBiometric || Platform.OS === 'web') && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print" size={20} color="#ff3366" />
                <View>
                  <Text style={styles.settingLabel}>{t('biometric')}</Text>
                  <Text style={styles.settingDesc}>{biometricEnabled ? t('biometricEnabled') : t('biometricDisabled')}</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#333', true: '#ff336640' }}
                thumbColor={biometricEnabled ? '#ff3366' : '#666'}
              />
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="keypad" size={20} color="#8b00ff" />
              <View>
                <Text style={styles.settingLabel}>PIN</Text>
                <Text style={styles.settingDesc}>{pin ? 'PIN telah diatur ✓' : 'Belum ada PIN'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={openPinModal} style={styles.setBtn}>
              <Text style={styles.setBtnText}>Atur</Text>
            </TouchableOpacity>
          </View>

          <View>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={20} color="#00d4ff" />
                <Text style={styles.settingLabel}>{t('lockTimeout')}</Text>
              </View>
            </View>
            <View style={styles.timeoutRow}>
              {TIMEOUTS.map(to => (
                <TouchableOpacity
                  key={to.value}
                  onPress={() => setLockTimeout(to.value)}
                  style={[styles.toBtn, lockTimeout === to.value && styles.toBtnActive]}
                >
                  <Text style={[styles.toText, lockTimeout === to.value && styles.toTextActive]}>{to.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* App Info */}
        <GlassCard style={styles.section} neonColor="#8b00ff">
          <Text style={styles.sectionTitle}>{t('appInfo')}</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('version')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>100% Offline — SQLite</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pemilik</Text>
            <Text style={[styles.infoValue, { color: '#8b00ff' }]}>WAROHATHUN NI'MAH</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('developer')}</Text>
            <Text style={[styles.infoValue, { color: '#00d4ff' }]}>AHMAD AHFANI</Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* PIN Setup Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pinModal}>
            <LinearGradient colors={['#0d0d2b', '#080818']} style={StyleSheet.absoluteFill} />
            <Text style={styles.pinModalTitle}>
              {pinStep === 'enter' ? 'Buat PIN Baru' : 'Konfirmasi PIN'}
            </Text>
            <Text style={styles.pinModalSub}>
              {pinStep === 'enter' ? 'Masukkan PIN 4–6 digit' : 'Masukkan ulang PIN Anda'}
            </Text>
            <TextInput
              value={pinStep === 'enter' ? pinInput : pinConfirm}
              onChangeText={pinStep === 'enter' ? setPinInput : setPinConfirm}
              style={styles.pinInput}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              placeholder="••••••"
              placeholderTextColor="#6b9bb8"
              autoFocus
            />
            <View style={styles.pinBtns}>
              <TouchableOpacity onPress={() => setPinModalVisible(false)} style={styles.pinCancelBtn}>
                <Text style={styles.pinCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePinSave} style={styles.pinSaveBtn}>
                <Text style={styles.pinSaveText}>
                  {pinStep === 'enter' ? 'Lanjut' : t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,255,136,0.2)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#00ff88', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, gap: 12 },
  section: { marginBottom: 4 },
  sectionTitle: { color: '#e0f7ff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  langActive: { backgroundColor: 'rgba(0,212,255,0.2)', borderColor: '#00d4ff' },
  langFlag: { fontSize: 20 },
  langText: { color: '#6b9bb8', fontSize: 13 },
  langTextActive: { color: '#00d4ff', fontWeight: '700' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { color: '#e0f7ff', fontSize: 14, fontWeight: '500' },
  settingDesc: { color: '#6b9bb8', fontSize: 11, marginTop: 1 },
  setBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(139,0,255,0.2)', borderWidth: 1, borderColor: '#8b00ff',
  },
  setBtnText: { color: '#8b00ff', fontSize: 12, fontWeight: '700' },
  timeoutRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingBottom: 4 },
  toBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(0,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  toBtnActive: { backgroundColor: 'rgba(0,212,255,0.2)', borderColor: '#00d4ff' },
  toText: { color: '#6b9bb8', fontSize: 11 },
  toTextActive: { color: '#00d4ff', fontWeight: '700' },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { color: '#6b9bb8', fontSize: 13 },
  infoValue: { color: '#e0f7ff', fontSize: 13, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  pinModal: {
    width: 300, borderRadius: 18, padding: 24,
    borderWidth: 1, borderColor: 'rgba(139,0,255,0.3)',
    overflow: 'hidden', alignItems: 'center', gap: 12,
  },
  pinModalTitle: { color: '#e0f7ff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  pinModalSub: { color: '#6b9bb8', fontSize: 13, textAlign: 'center' },
  pinInput: {
    width: '100%', backgroundColor: 'rgba(139,0,255,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(139,0,255,0.3)',
    color: '#e0f7ff', padding: 12, fontSize: 20, fontWeight: '700',
    textAlign: 'center', letterSpacing: 8,
  },
  pinBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  pinCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  pinCancelText: { color: '#6b9bb8', fontSize: 14, fontWeight: '600' },
  pinSaveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: 'rgba(139,0,255,0.25)', borderWidth: 1, borderColor: '#8b00ff',
    alignItems: 'center',
  },
  pinSaveText: { color: '#8b00ff', fontSize: 14, fontWeight: '700' },
});
