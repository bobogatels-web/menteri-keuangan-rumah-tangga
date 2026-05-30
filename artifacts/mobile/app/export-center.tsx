import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { exportPDF, exportCSV, exportExcel, createBackup, ExportPeriod } from '@/services/exportService';
import { GlassCard } from '@/components/GlassCard';

const PERIODS: { key: ExportPeriod; label: string }[] = [
  { key: 'all', label: 'Semua Waktu' },
  { key: '30days', label: '30 Hari Terakhir' },
  { key: '3months', label: '3 Bulan Terakhir' },
  { key: 'thisyear', label: 'Tahun Ini' },
];

interface ExportOption {
  icon: string;
  label: string;
  desc: string;
  color: string;
  action: (period: ExportPeriod) => Promise<void>;
}

const OPTIONS: ExportOption[] = [
  { icon: 'document-text', label: 'Ekspor PDF', desc: 'Laporan lengkap dengan tabel & ringkasan', color: '#ff3366', action: exportPDF },
  { icon: 'grid', label: 'Ekspor CSV', desc: 'Format tabel untuk spreadsheet', color: '#00ff88', action: exportCSV },
  { icon: 'bar-chart', label: 'Ekspor Excel', desc: 'Format Microsoft Excel (.xls)', color: '#00d4ff', action: exportExcel },
  { icon: 'server', label: 'Backup Data', desc: 'Backup database JSON untuk pemulihan', color: '#ffdd00', action: async () => createBackup() },
];

export default function ExportCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const [period, setPeriod] = useState<ExportPeriod>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleExport = async (opt: ExportOption) => {
    setLoading(opt.label);
    try {
      await opt.action(period);
      Alert.alert(t('exportSuccess'), `${opt.label} berhasil diekspor dan dibagikan`);
    } catch (e) {
      Alert.alert(t('exportFailed'), String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#ffdd00" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('exportCenter')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + bottom }]}>

        {/* Period selector */}
        <GlassCard neonColor="#ffdd00" style={styles.section}>
          <Text style={styles.sectionLabel}>{t('selectPeriod')}</Text>
          <View style={styles.periodGrid}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPeriod(p.key)}
                style={[styles.periodBtn, period === p.key && styles.periodActive]}
              >
                <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Export options */}
        <Text style={styles.sectionTitle}>Pilih Format Ekspor</Text>
        {OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleExport(opt)}
            disabled={loading !== null}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={[opt.color + '15', opt.color + '05']}
              style={[styles.optionCard, { borderColor: opt.color + '40' }]}
            >
              <View style={[styles.optIconBox, { backgroundColor: opt.color + '20', borderColor: opt.color + '30' }]}>
                {loading === opt.label ? (
                  <ActivityIndicator color={opt.color} size="small" />
                ) : (
                  <Ionicons name={opt.icon as keyof typeof Ionicons.glyphMap} size={24} color={opt.color} />
                )}
              </View>
              <View style={styles.optInfo}>
                <Text style={[styles.optLabel, { color: opt.color }]}>{opt.label}</Text>
                <Text style={styles.optDesc}>{opt.desc}</Text>
              </View>
              <Ionicons name="share-outline" size={20} color={opt.color + '80'} />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.note}>
          <Ionicons name="information-circle" size={16} color="#6b9bb8" />
          <Text style={styles.noteText}>
            Semua ekspor dibagikan langsung melalui sistem berbagi perangkat Anda. File disimpan di penyimpanan lokal.
          </Text>
        </View>

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>WAROHATHUN NI'MAH</Text>
          <Text style={styles.designerText}>Design By AHMAD AHFANI</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,221,0,0.2)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#ffdd00', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, gap: 12 },
  section: { marginBottom: 4 },
  sectionLabel: { color: '#6b9bb8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: '600' },
  periodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  periodBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: 'rgba(255,221,0,0.07)', borderWidth: 1, borderColor: 'rgba(255,221,0,0.2)',
  },
  periodActive: { backgroundColor: 'rgba(255,221,0,0.2)', borderColor: '#ffdd00' },
  periodText: { color: '#6b9bb8', fontSize: 12 },
  periodTextActive: { color: '#ffdd00', fontWeight: '700' },
  sectionTitle: { color: '#e0f7ff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  optIconBox: {
    width: 50, height: 50, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  optInfo: { flex: 1 },
  optLabel: { fontSize: 15, fontWeight: '700' },
  optDesc: { color: '#6b9bb8', fontSize: 12, marginTop: 2 },
  note: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: 'rgba(0,212,255,0.05)', borderRadius: 10, marginTop: 4 },
  noteText: { color: '#6b9bb8', fontSize: 12, flex: 1, lineHeight: 18 },
  watermark: { alignItems: 'center', marginTop: 20, gap: 4 },
  watermarkText: { color: '#8b00ff', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  designerText: { color: '#6b9bb8', fontSize: 10 },
});
