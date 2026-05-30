import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'document-outline', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={40} color="#00d4ff" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  iconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#e0f7ff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: '#6b9bb8', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },
});
