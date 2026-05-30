import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';

interface SecurityContextType {
  isLocked: boolean;
  biometricEnabled: boolean;
  pin: string;
  lockTimeout: number;
  setBiometricEnabled: (v: boolean) => void;
  setPin: (pin: string) => void;
  setLockTimeout: (ms: number) => void;
  lock: () => void;
  unlock: () => void;
  checkPin: (input: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [pin, setPinState] = useState('');
  const [lockTimeout, setLockTimeoutState] = useState(0);
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    AsyncStorage.multiGet(['biometricEnabled', 'pin', 'lockTimeout']).then(pairs => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map.biometricEnabled === 'true') {
        setBiometricEnabledState(true);
        setIsLocked(true);
      }
      if (map.pin) setPinState(map.pin);
      if (map.lockTimeout) setLockTimeoutState(Number(map.lockTimeout));
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        if (biometricEnabled && lockTimeout > 0) {
          const elapsed = Date.now() - lastActiveRef.current;
          if (elapsed >= lockTimeout) setIsLocked(true);
        }
      } else {
        lastActiveRef.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [biometricEnabled, lockTimeout]);

  const setBiometricEnabled = (v: boolean) => {
    setBiometricEnabledState(v);
    AsyncStorage.setItem('biometricEnabled', v ? 'true' : 'false');
    if (v) setIsLocked(true);
  };

  const setPin = (p: string) => {
    setPinState(p);
    AsyncStorage.setItem('pin', p);
  };

  const setLockTimeout = (ms: number) => {
    setLockTimeoutState(ms);
    AsyncStorage.setItem('lockTimeout', String(ms));
  };

  const lock = () => setIsLocked(true);
  const unlock = () => setIsLocked(false);
  const checkPin = (input: string) => input === pin;

  return (
    <SecurityContext.Provider value={{
      isLocked, biometricEnabled, pin, lockTimeout,
      setBiometricEnabled, setPin, setLockTimeout,
      lock, unlock, checkPin,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
}
