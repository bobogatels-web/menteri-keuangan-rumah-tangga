import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={16} color="#6b9bb8" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b9bb8"
        style={styles.input}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clear}>
          <Ionicons name="close-circle" size={16} color="#6b9bb8" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#e0f7ff',
    fontSize: 14,
    paddingVertical: 10,
  },
  clear: { padding: 4 },
});
