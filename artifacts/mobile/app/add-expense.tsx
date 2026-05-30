import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { NeonButton } from '@/components/NeonButton';

const CATEGORIES = [
  'Makanan & Minuman', 'Transportasi', 'Belanja', 'Kesehatan',
  'Pendidikan', 'Hiburan', 'Utilitas', 'Sewa', 'Rumah Tangga', 'Lainnya',
];
const METHODS = ['Tunai', 'Transfer Bank', 'E-Wallet', 'Kartu Kredit'];

function today() { return new Date().toISOString().split('T')[0]; }
function nowTime() { return new Date().toTimeString().substr(0, 5); }

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useApp();
  const { transactions, addTransaction, editTransaction } = useDB();

  const existing = id ? transactions.find(tr => tr.id === id) : null;

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState(existing?.category ?? 'Makanan & Minuman');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [date, setDate] = useState(existing?.date ?? today());
  const [time, setTime] = useState(existing?.time ?? nowTime());
  const [method, setMethod] = useState(existing?.payment_method ?? 'Tunai');
  const [imageUri, setImageUri] = useState(existing?.image_uri ?? '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!existing;
  const top = Platform.OS === 'web' ? 67 : insets.top;

  const handlePickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  };

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }
    setSaving(true);
    const data = {
      type: 'expense' as const,
      amount: Number(amount),
      category,
      notes,
      date,
      time,
      payment_method: method,
      status: 'paid',
      buyer_name: '',
      image_uri: imageUri,
    };
    if (isEdit && existing) editTransaction({ ...existing, ...data });
    else addTransaction(data);
    setSaving(false);
    router.back();
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a0818', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#ff3366" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? t('editExpense') : t('addExpense')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
        <View style={styles.field}>
          <Text style={styles.label}>{t('amount')}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              value={amount} onChangeText={setAmount}
              keyboardType="numeric" style={styles.amountInput}
              placeholder="0" placeholderTextColor="#6b9bb8"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('expenseCategory')}</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('paymentMethod')}</Text>
          <View style={styles.chips}>
            {METHODS.map(m => (
              <TouchableOpacity key={m} onPress={() => setMethod(m)} style={[styles.chip, method === m && styles.chipActive]}>
                <Text style={[styles.chipText, method === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('notes')}</Text>
          <TextInput
            value={notes} onChangeText={setNotes}
            style={[styles.input, styles.textArea]}
            placeholder={t('notes')} placeholderTextColor="#6b9bb8"
            multiline numberOfLines={3}
          />
        </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>{t('receipt')}</Text>
          <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={28} color="#ff3366" />
                <Text style={styles.imagePlaceholderText}>{t('addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <NeonButton title={t('save')} onPress={handleSave} loading={saving} variant="danger" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,51,102,0.2)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#ff3366', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, gap: 0 },
  field: { marginBottom: 16 },
  label: { color: '#6b9bb8', fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,51,102,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,51,102,0.2)',
    color: '#e0f7ff', padding: 12, fontSize: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { color: '#ff3366', fontSize: 20, fontWeight: '700' },
  amountInput: {
    flex: 1, backgroundColor: 'rgba(255,51,102,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,51,102,0.3)',
    color: '#ff3366', padding: 12, fontSize: 24, fontWeight: '800',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,51,102,0.07)', borderWidth: 1, borderColor: 'rgba(255,51,102,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(255,51,102,0.2)', borderColor: '#ff3366' },
  chipText: { color: '#6b9bb8', fontSize: 12 },
  chipTextActive: { color: '#ff3366', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  imagePicker: {
    height: 120, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,51,102,0.3)', backgroundColor: 'rgba(255,51,102,0.05)', overflow: 'hidden',
  },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { color: '#ff3366', fontSize: 12 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
});
