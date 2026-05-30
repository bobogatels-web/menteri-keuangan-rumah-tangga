import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Props {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  bottom?: number;
}

const ND = Platform.OS !== 'web';

export function FloatingAction({ onPress, icon = 'add', bottom = 100 }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.06, duration: 1500, useNativeDriver: ND }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1500, useNativeDriver: ND }),
      ])
    ).start();
  }, [scaleAnim]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View style={[styles.wrapper, { bottom, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient colors={['#00d4ff', '#0080aa']} style={styles.btn}>
          <Ionicons name={icon} size={28} color="#080818" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  btn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
