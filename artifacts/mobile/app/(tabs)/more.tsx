import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'flag', label: 'Target Keuangan', color: '#00d4ff', route: '/targets' },
  { icon: 'refresh-circle', label: 'Transaksi Berkala', color: '#8b00ff', route: '/recurring' },
  { icon: 'share-social', label: 'Pusat Ekspor', color: '#ffdd00', route: '/export-center' },
  { icon: 'settings', label: 'Pengaturan', color: '#00ff88', route: '/settings' },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.title}>{t('more')}</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 80 + bottom }]}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => router.push(item.route as never)}
            style={styles.menuItem}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={[item.color + '18', item.color + '08']}
              style={styles.menuGrad}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={item.color + '80'} />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.watermark}>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>MENTERI KEUANGAN RUMAH TANGGA</Text>
            <Text style={styles.appInfoSub}>Aplikasi Keuangan Rumah Tangga</Text>
            <Text style={styles.watermarkText}>WAROHATHUN NI'MAH</Text>
            <Text style={styles.designerText}>Design By AHMAD AHFANI</Text>
            <Text style={styles.version}>v1.0.0 — 100% Offline</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.15)',
  },
  title: { color: '#e0f7ff', fontSize: 22, fontWeight: '800' },
  content: { padding: 16, gap: 10 },
  menuItem: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)' },
  menuGrad: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  watermark: { marginTop: 30, alignItems: 'center' },
  appInfo: {
    alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,212,255,0.05)',
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)',
  },
  appInfoTitle: { color: '#00d4ff', fontSize: 13, fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  appInfoSub: { color: '#6b9bb8', fontSize: 11, marginBottom: 8 },
  watermarkText: { color: '#8b00ff', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  designerText: { color: '#6b9bb8', fontSize: 11 },
  version: { color: '#00ff88', fontSize: 10, marginTop: 4 },
});
