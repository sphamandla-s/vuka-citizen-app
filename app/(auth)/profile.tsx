import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const insets = useSafeAreaInsets();
  const { setUser, pendingPhone } = useAuthStore();

  const requestNotifications = async () => {
    if (Platform.OS === 'web') return;
    try {
      const { requestPermissionsAsync } = await import('expo-notifications');
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications Off',
          'Without notifications, you won\'t receive emergency alerts near you.',
        );
      }
    } catch {
      // not available
    }
  };

  const requestLocation = async () => {
    if (Platform.OS === 'web') return;
    try {
      const ExpoLocation = await import('expo-location');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Off',
          'Vuka needs your location to show nearby reports and share your position in emergencies.',
        );
      }
    } catch {
      // not available
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!neighbourhood.trim()) newErrors.neighbourhood = 'Neighbourhood is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const user = {
      id: `user_${Date.now()}`,
      phone: pendingPhone,
      name: name.trim(),
      neighbourhood: neighbourhood.trim(),
      notificationRadius: 1000,
      trustedContacts: [] as string[],
      reportsCount: 0,
      alertsReceived: 0,
      panicPin: '1234',
    };
    setUser(user);
    await AsyncStorage.setItem('vuka_returning', '1');
    setLoading(false);
    router.replace('/(main)');
  };

  const Field = ({ label, value, onChange, error, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    error?: string; placeholder: string;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={[typography.label.md, { color: colors.text.secondary, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        style={[styles.input, error ? { borderColor: colors.brand.red } : {}]}
        value={value}
        onChangeText={(v) => { onChange(v); setErrors((e) => ({ ...e, [label.toLowerCase()]: '' })); }}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
      />
      {!!error && <Text style={[typography.body.sm, { color: colors.brand.red, marginTop: spacing.xs }]}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[typography.display.lg, { color: colors.text.primary, marginBottom: spacing.xs }]}>SET UP YOUR PROFILE</Text>
        <Text style={[typography.body.md, { color: colors.text.secondary, marginBottom: spacing.xl }]}>
          Tell your community who you are
        </Text>

        <Field label="FULL NAME" value={name} onChange={setName} error={errors.name} placeholder="Siphamandla Dube" />
        <Field label="NEIGHBOURHOOD / AREA" value={neighbourhood} onChange={setNeighbourhood} error={errors.neighbourhood} placeholder="Brakpan, East Rand" />

        <Text style={[typography.body.xl, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Permissions
        </Text>
        <Text style={[typography.body.md, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
          Vuka needs these to keep you safe. We only use them when necessary.
        </Text>

        <PermissionCard
          title="Stay alert, stay safe"
          body="Vuka needs to send you alerts when danger is reported near you. Without this, you won't receive emergency notifications."
          buttonLabel="Allow Alerts"
          onPress={requestNotifications}
        />
        <PermissionCard
          title="Share your location with your community"
          body="Vuka uses your location to show you nearby reports and alerts, and to share your position in an emergency."
          buttonLabel="Allow Location"
          onPress={requestLocation}
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color={colors.text.primary} /> : (
            <Text style={[typography.display.md, { color: colors.text.primary }]}>JOIN MY COMMUNITY</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PermissionCard({ title, body, buttonLabel, onPress }: {
  title: string; body: string; buttonLabel: string; onPress: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <View style={styles.permCard}>
      <Text style={[typography.body.xl, { color: colors.text.primary, marginBottom: spacing.xs }]}>{title}</Text>
      <Text style={[typography.body.md, { color: colors.text.secondary, marginBottom: spacing.md }]}>{body}</Text>
      <TouchableOpacity
        style={[styles.permBtn, done && { backgroundColor: colors.brand.green }]}
        onPress={async () => { await onPress(); setDone(true); }}
        activeOpacity={0.8}
        disabled={done}
      >
        <Text style={[typography.label.md, { color: colors.text.primary }]}>
          {done ? '✓ Allowed' : buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: colors.bg.primary },
  container: { paddingHorizontal: spacing.lg },
  fieldWrap: { marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  permCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  permBtn: {
    backgroundColor: colors.brand.red,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  saveBtn: {
    backgroundColor: colors.brand.red,
    paddingVertical: spacing.md + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
