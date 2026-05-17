import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

export default function PhoneEntry() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handleChange = (text: string) => {
    setPhone(formatPhone(text));
    if (error) setError('');
  };

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit SA mobile number');
      return;
    }
    const e164 = '+27' + (digits.startsWith('0') ? digits.slice(1) : digits);
    setLoading(true);
    try {
      setPendingPhone(e164);
      router.push('/(auth)/verify');
    } catch {
      setError('Could not send OTP. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.logoSection}>
        <Text style={[typography.display.xl, { color: colors.brand.red }]}>VUKA</Text>
        <View style={styles.taglineBox}>
          <Text style={[typography.body.lg, { color: colors.text.secondary, textAlign: 'center' }]}>
            Your community has your back.
          </Text>
        </View>
        <View style={styles.featureRow}>
          {['Safety Alerts', 'Civic Reports', 'Community'].map((f) => (
            <View key={f} style={styles.featurePill}>
              <Text style={[typography.label.sm, { color: colors.text.muted }]}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={[typography.label.md, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
          Mobile Number
        </Text>
        <View style={[styles.phoneRow, error ? { borderColor: colors.brand.red } : {}]}>
          <View style={styles.prefix}>
            <Text style={styles.flag}>🇿🇦</Text>
            <Text style={[typography.body.lg, { color: colors.text.primary }]}>+27</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={handleChange}
            keyboardType="phone-pad"
            placeholder="72 123 4567"
            placeholderTextColor={colors.text.muted}
            accessibilityLabel="Phone number"
          />
        </View>

        {!!error && (
          <Text style={[typography.body.sm, { color: colors.brand.red, marginTop: spacing.sm }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={[typography.display.md, { color: colors.text.primary }]}>GET MY CODE</Text>
          )}
        </TouchableOpacity>

        <Text style={[typography.body.sm, { color: colors.text.muted, textAlign: 'center', marginTop: spacing.md }]}>
          We'll send a one-time PIN to this number
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  logoSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  taglineBox: { paddingHorizontal: spacing.xl },
  featureRow: { flexDirection: 'row', gap: spacing.sm },
  featurePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.surface,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border.medium,
    gap: spacing.xs,
  },
  flag: { fontSize: 20 },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: 18,
    fontFamily: 'DMSans_400Regular',
  },
  button: {
    backgroundColor: colors.brand.red,
    paddingVertical: spacing.md + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  inputSection: {},
});
