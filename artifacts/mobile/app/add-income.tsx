import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/services/database';
import { NeonButton } from '@/components/NeonButton';

const INCOME_SOURCES = [
  'Photo Editing', 'Shopee Affiliate', 'TikTok Affiliate', 'Lynk.id',
  'Super Grook', 'Chat GPT', 'CapCut Pro', 'Netflix',
  'Video Editing', 'API Key', 'Affiliate Vivi', 'Others',
];
const STATUSES = ['received', 'pending', 'cancelled'];

function today() {
  return new Date().toISOString().split('T')[0];
}
function nowTime() {
  return new Date().toTimeString().substr(0, 5);
}

export default function AddIncomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useApp();
  const { transactions, addTransaction, editTransaction } = useDB();

  const existing = id ? transactions.find(t => t.id === id) : null;

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState(existing?.category ?? 'Photo Editing');
  const [buyerName, setBuyerName] = useState(existing?.buyer_name ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [date, setDate] = useState(existing?.date ?? today());
  const [time, setTime] = useState(existing?.time ?? nowTime());
  const [status, setStatus] = useState(existing?.status ?? 'received');
  const [imageUri, setImageUri] = useState(existing?.image_uri ?? '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!existing;
  const top = Platform.OS === 'web' ? 67 : insets.top;

  const handlePickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  };

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }
    setSaving(true);
    const data = {
      type: 'income' as const,
      amount: Number(amount),
      category,
      notes,
      date,
      time,
      payment_method: '',
      status,
      buyer_name: buyerName,
      image_uri: imageUri,
    };
    if (isEdit && existing) {
      editTransaction({ ...existing, ...data });
    } else {
      addTransaction(data);
    }
    setSaving(false);
    router.back();
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0d1a0d', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#00ff88" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? t('editIncome') : t('addIncome')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('amount')}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#6b9bb8"
            />
          </View>
        </View>

        {/* Income Source */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('incomeSource')}</Text>
          <View style={styles.chips}>
            {INCOME_SOURCES.map(src => (
              <TouchableOpacity
                key={src}
                onPress={() => setCategory(src)}
                style={[styles.chip, category === src && styles.chipActive]}
              >
                <Text style={[styles.chipText, category === src && styles.chipTextActive]}>{src}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buyer Name */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('buyerName')}</Text>
          <TextInput
            value={buyerName}
            onChangeText={setBuyerName}
            style={styles.input}
            placeholder={t('buyerName')}
            placeholderTextColor="#6b9bb8"
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('notes')}</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.textArea]}
            placeholder={t('notes')}
            placeholderTextColor="#6b9bb8"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date & Time */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>{t('date')}</Text>
            <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#6b9bb8" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>{t('time')}</Text>
            <TextInput value={time} onChangeText={setTime} style={styles.input} placeholder="HH:MM" placeholderTextColor="#6b9bb8" />
          </View>
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('paymentStatus')}</Text>
          <View style={styles.chips}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.chip, status === s && styles.chipActive]}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                  {s === 'received' ? t('received') : s === 'pending' ? t('pending') : t('cancelled')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Proof Image */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('paymentProof')}</Text>
          <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={28} color="#00ff88" />
                <Text style={styles.imagePlaceholderText}>{t('addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <NeonButton title={t('save')} onPress={handleSave} loading={saving} variant="primary" />
      </ScrollView>
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
  content: { padding: 16, gap: 0 },
  field: { marginBottom: 16 },
  label: { color: '#6b9bb8', fontSize: 12, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(0,212,255,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
    color: '#e0f7ff', padding: 12, fontSize: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { color: '#00ff88', fontSize: 20, fontWeight: '700' },
  amountInput: {
    flex: 1, backgroundColor: 'rgba(0,255,136,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,255,136,0.3)',
    color: '#00ff88', padding: 12, fontSize: 24, fontWeight: '800',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(0,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(0,255,136,0.2)', borderColor: '#00ff88' },
  chipText: { color: '#6b9bb8', fontSize: 12 },
  chipTextActive: { color: '#00ff88', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  imagePicker: {
    height: 120, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,136,0.3)',
    backgroundColor: 'rgba(0,255,136,0.05)', overflow: 'hidden',
  },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { color: '#00ff88', fontSize: 12 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
});
