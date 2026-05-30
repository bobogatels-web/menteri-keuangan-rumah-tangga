import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  neonColor?: string;
  padding?: number;
}

export function GlassCard({ children, style, neonColor = '#00d4ff', padding = 16 }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: neonColor + '40',
          shadowColor: neonColor,
          padding,
        },
        style,
      ]}
    >
      <View style={[styles.innerBorder, { borderColor: neonColor + '20', pointerEvents: 'none' }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(13, 13, 43, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  innerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 15,
    borderWidth: 1,
  },
});
