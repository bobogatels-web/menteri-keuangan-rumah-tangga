import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { RecurringItem } from '@/services/database';
import { RecurringCard } from '@/components/RecurringCard';
import { EmptyState } from '@/components/EmptyState';
import { NeonButton } from '@/components/NeonButton';
import { FloatingAction } from '@/components/FloatingAction';

const FREQS = ['daily', 'weekly', 'monthly', 'yearly'];
function today() { return new Date().toISOString().split('T')[0]; }

export default function RecurringScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const { recurring, addRecurring, editRecurring, removeRecurring, triggerRecurring } = useDB();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecurringItem | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('');
  const [freq, setFreq] = useState('monthly');
  const [nextDate, setNextDate] = useState(today());
  const [notes, setNotes] = useState('');

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const openAdd = () => {
    setEditing(null);
    setTitle(''); setAmount(''); setType('income'); setCategory('');
    setFreq('monthly'); setNextDate(today()); setNotes('');
    setModal(true);
  };

  const openEdit = (item: RecurringItem) => {
    setEditing(item);
    setTitle(item.title); setAmount(String(item.amount));
    setType(item.type as 'income' | 'expense'); setCategory(item.category);
    setFreq(item.frequency); setNextDate(item.next_date); setNotes(item.notes);
    setModal(true);
  };

  const handleSave = () => {
    if (!title || !amount) return;
    const data = { title, amount: Number(amount), type, category, frequency: freq, next_date: nextDate, notes, is_active: 1 };
    if (editing) editRecurring({ ...editing, ...data });
    else addRecurring(data);
    setModal(false);
  };

  const handleToggle = (item: RecurringItem) => {
    editRecurring({ ...item, is_active: item.is_active ? 0 : 1 });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0818', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#8b00ff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('recurring')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={recurring}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <RecurringCard
            item={item}
            onEdit={openEdit}
            onDelete={removeRecurring}
            onGenerate={triggerRecurring}
            onToggle={handleToggle}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + bottom }]}
        ListEmptyComponent={<EmptyState icon="refresh-circle-outline" title={t('recurring')} subtitle="Tambahkan transaksi berkala" />}
        showsVerticalScrollIndicator={false}
      />

      <FloatingAction onPress={openAdd} icon="add" bottom={80 + bottom} />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <View style={styles.modal}>
          <LinearGradient colors={['#0d0d2b', '#080818']} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editing ? t('editRecurring') : t('addRecurring')}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color="#6b9bb8" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.mc}>
            <Text style={styles.label}>Judul</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Judul transaksi" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('amount')}</Text>
            <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>Jenis</Text>
            <View style={styles.chips}>
              {(['income', 'expense'] as const).map(tp => (
                <TouchableOpacity key={tp} onPress={() => setType(tp)} style={[styles.chip, type === tp && styles.chipActive]}>
                  <Text style={[styles.chipText, type === tp && styles.chipTextActive]}>
                    {tp === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Kategori</Text>
            <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Kategori" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('frequency')}</Text>
            <View style={styles.chips}>
              {FREQS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFreq(f)} style={[styles.chip, freq === f && styles.chipActive]}>
                  <Text style={[styles.chipText, freq === f && styles.chipTextActive]}>
                    {f === 'daily' ? 'Harian' : f === 'weekly' ? 'Mingguan' : f === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('nextDate')}</Text>
            <TextInput value={nextDate} onChangeText={setNextDate} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('notes')}</Text>
            <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { height: 70 }]} multiline placeholder={t('notes')} placeholderTextColor="#6b9bb8" />

            <NeonButton title={t('save')} onPress={handleSave} variant="secondary" />
          </ScrollView>
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
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,0,255,0.2)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#8b00ff', fontSize: 18, fontWeight: '800' },
  list: { padding: 16 },
  modal: { flex: 1, backgroundColor: '#080818' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(139,0,255,0.2)',
  },
  modalTitle: { color: '#8b00ff', fontSize: 18, fontWeight: '700' },
  mc: { padding: 16, paddingBottom: 40 },
  label: { color: '#6b9bb8', fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: 'rgba(139,0,255,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(139,0,255,0.2)',
    color: '#e0f7ff', padding: 12, fontSize: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(139,0,255,0.07)', borderWidth: 1, borderColor: 'rgba(139,0,255,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(139,0,255,0.2)', borderColor: '#8b00ff' },
  chipText: { color: '#6b9bb8', fontSize: 12 },
  chipTextActive: { color: '#8b00ff', fontWeight: '700' },
});
