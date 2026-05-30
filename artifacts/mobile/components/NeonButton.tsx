import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function NeonButton({ title, onPress, variant = 'primary', loading, disabled, style, textStyle, icon }: NeonButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const gradients: Record<string, [string, string]> = {
    primary: ['#00d4ff', '#0080aa'],
    secondary: ['#8b00ff', '#5500aa'],
    danger: ['#ff3366', '#aa0033'],
    ghost: ['rgba(0,212,255,0.1)', 'rgba(0,212,255,0.05)'],
  };

  const [from, to] = gradients[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'ghost' ? '#00d4ff' : '#fff'} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, variant === 'ghost' && styles.ghostText, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ghostText: {
    color: '#00d4ff',
  },
  disabled: {
    opacity: 0.4,
  },
});
