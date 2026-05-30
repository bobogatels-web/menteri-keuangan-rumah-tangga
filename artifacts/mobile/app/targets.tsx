import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/context/DBContext';
import { useApp } from '@/context/AppContext';
import { Target } from '@/services/database';
import { TargetCard } from '@/components/TargetCard';
import { EmptyState } from '@/components/EmptyState';
import { NeonButton } from '@/components/NeonButton';
import { FloatingAction } from '@/components/FloatingAction';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const TYPES = ['savings', 'income', 'expense'];

function today() { return new Date().toISOString().split('T')[0]; }
function monthEnd() {
  const d = new Date(); d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

export default function TargetsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useApp();
  const { targets, addTarget, editTarget, removeTarget } = useDB();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Target | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [period, setPeriod] = useState('monthly');
  const [targetType, setTargetType] = useState('savings');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(monthEnd());

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const openAdd = () => {
    setEditing(null);
    setTitle(''); setTargetAmount(''); setCurrentAmount('0');
    setPeriod('monthly'); setTargetType('savings');
    setStartDate(today()); setEndDate(monthEnd());
    setModalVisible(true);
  };

  const openEdit = (item: Target) => {
    setEditing(item);
    setTitle(item.title);
    setTargetAmount(String(item.target_amount));
    setCurrentAmount(String(item.current_amount));
    setPeriod(item.period);
    setTargetType(item.target_type);
    setStartDate(item.start_date);
    setEndDate(item.end_date);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title || !targetAmount) return;
    const data = {
      title, target_amount: Number(targetAmount),
      current_amount: Number(currentAmount),
      period, target_type: targetType,
      start_date: startDate, end_date: endDate,
    };
    if (editing) editTarget({ ...editing, ...data });
    else addTarget(data);
    setModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a0a1e', '#080818']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#00d4ff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('targets')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={targets}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TargetCard item={item} onEdit={openEdit} onDelete={removeTarget} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + bottom }]}
        ListEmptyComponent={<EmptyState icon="flag-outline" title={t('targets')} subtitle="Tambahkan target keuangan Anda" />}
        showsVerticalScrollIndicator={false}
      />

      <FloatingAction onPress={openAdd} icon="add" bottom={80 + bottom} />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <LinearGradient colors={['#0d0d2b', '#080818']} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editing ? t('editTarget') : t('addTarget')}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6b9bb8" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>{t('targetTitle')}</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Nama target" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('targetAmount')}</Text>
            <TextInput value={targetAmount} onChangeText={setTargetAmount} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('currentAmount')}</Text>
            <TextInput value={currentAmount} onChangeText={setCurrentAmount} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#6b9bb8" />

            <Text style={styles.label}>{t('period')}</Text>
            <View style={styles.chips}>
              {PERIODS.map(p => (
                <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.chip, period === p && styles.chipActive]}>
                  <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{t(p as 'daily' | 'weekly' | 'monthly' | 'yearly')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('targetType')}</Text>
            <View style={styles.chips}>
              {TYPES.map(tp => (
                <TouchableOpacity key={tp} onPress={() => setTargetType(tp)} style={[styles.chip, targetType === tp && styles.chipActive]}>
                  <Text style={[styles.chipText, targetType === tp && styles.chipTextActive]}>
                    {tp === 'savings' ? t('savingsGoal') : tp === 'income' ? t('incomeTarget') : t('expenseLimit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t('from')}</Text>
                <TextInput value={startDate} onChangeText={setStartDate} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#6b9bb8" />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t('to')}</Text>
                <TextInput value={endDate} onChangeText={setEndDate} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#6b9bb8" />
              </View>
            </View>

            <NeonButton title={t('save')} onPress={handleSave} />
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
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.15)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#00d4ff', fontSize: 18, fontWeight: '800' },
  list: { padding: 16 },
  modal: { flex: 1, backgroundColor: '#080818' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.15)',
  },
  modalTitle: { color: '#00d4ff', fontSize: 18, fontWeight: '700' },
  modalContent: { padding: 16, gap: 0, paddingBottom: 40 },
  label: { color: '#6b9bb8', fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: 'rgba(0,212,255,0.07)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
    color: '#e0f7ff', padding: 12, fontSize: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(0,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(0,212,255,0.2)', borderColor: '#00d4ff' },
  chipText: { color: '#6b9bb8', fontSize: 12 },
  chipTextActive: { color: '#00d4ff', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
});
