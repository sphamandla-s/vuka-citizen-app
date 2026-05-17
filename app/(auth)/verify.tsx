import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/authStore';

const DIGIT_COUNT = 6;

export default function VerifyOTP() {
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>(Array(DIGIT_COUNT).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { pendingPhone, setToken, setUser, setIsNewUser } = useAuthStore();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError('');
    if (value && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === DIGIT_COUNT - 1) {
      const code = [...newDigits.slice(0, index), value.slice(-1)].join('');
      if (code.length === DIGIT_COUNT) setTimeout(() => verify(code), 50);
    }
    const code = newDigits.join('').replace(/[^0-9]/g, '') + (index === DIGIT_COUNT - 1 ? value.slice(-1) : '');
    if (code.length === DIGIT_COUNT) setTimeout(() => verify(newDigits.join('')), 50);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verify = async (code: string) => {
    if (code.length !== DIGIT_COUNT) return;
    // Mock: check for any 6-digit code, store token
    const mockToken = `mock_jwt_${Date.now()}`;
    const isNew = !(await AsyncStorage.getItem('vuka_returning'));
    setToken(mockToken);
    setIsNewUser(isNew);
    if (isNew) {
      router.replace('/(auth)/profile');
    } else {
      const userStr = await AsyncStorage.getItem('vuka_user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      router.replace('/(main)');
    }
  };

  const maskedPhone = pendingPhone
    ? pendingPhone.slice(0, 6) + ' *** **' + pendingPhone.slice(-2)
    : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={[typography.body.lg, { color: colors.text.secondary }]}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[typography.display.lg, { color: colors.text.primary }]}>ENTER YOUR PIN</Text>
        <Text style={[typography.body.md, { color: colors.text.secondary, marginTop: spacing.sm }]}>
          Sent to {maskedPhone}
        </Text>

        <Animated.View style={[styles.digitRow, { transform: [{ translateX: shakeAnim }] }]}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(ref) => {
                inputRefs.current[i] = ref;
              }}
              style={[
                styles.digitBox,
                d ? styles.digitBoxFilled : {},
                error ? styles.digitBoxError : {},
              ]}
              value={d}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={colors.brand.red}
              caretHidden
            />
          ))}
        </Animated.View>

        {!!error && (
          <Text style={[typography.body.sm, { color: colors.brand.red, textAlign: 'center', marginTop: spacing.md }]}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          disabled={resendTimer > 0}
          onPress={() => { setResendTimer(30); setDigits(Array(DIGIT_COUNT).fill('')); }}
          style={{ marginTop: spacing.xl }}
        >
          <Text style={[typography.body.md, { color: resendTimer > 0 ? colors.text.muted : colors.brand.red, textAlign: 'center' }]}>
            {resendTimer > 0 ? `Resend PIN in ${resendTimer}s` : 'Resend PIN'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: spacing.lg,
  },
  back: { marginBottom: spacing.xxl },
  content: { flex: 1, justifyContent: 'center' },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  digitBox: {
    flex: 1,
    height: 56,
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.text.primary,
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
  },
  digitBoxFilled: { borderColor: colors.brand.red },
  digitBoxError: { borderColor: colors.brand.red, backgroundColor: colors.brand.redDim },
});
