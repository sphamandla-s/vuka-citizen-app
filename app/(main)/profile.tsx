import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuthStore();
  const [anonMode, setAnonMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'VK';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={[typography.display.md, { color: colors.text.primary }]}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[typography.body.xl, { color: colors.text.primary }]}>
            {user?.name ?? 'Community Member'}
          </Text>
          <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
            {user?.neighbourhood ?? 'Your area'}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <StatBadge label="Reports" value={user?.reportsCount ?? 0} />
          <View style={styles.statDivider} />
          <StatBadge label="Alerts" value={user?.alertsReceived ?? 0} />
        </View>
      </View>

      {/* Safety */}
      <SectionHeader label="SAFETY" />
      <SettingsSection>
        <SettingsRow
          icon="account-group"
          label="Trusted Contacts"
          value={`${user?.trustedContacts?.length ?? 0}/5 added`}
          onPress={() => Alert.alert('Trusted Contacts', 'Add up to 5 numbers that will be alerted when you trigger panic.')}
        />
        <SettingsRow
          icon="lock-outline"
          label="Panic PIN"
          value={user?.panicPin ? '••••' : 'Not set'}
          onPress={() => Alert.alert('Panic PIN', 'Set a 4-digit PIN to dismiss your panic alert.')}
        />
        <SettingsRow
          icon="vibrate"
          label="Shake Sensitivity"
          value="Medium"
          onPress={() => Alert.alert('Shake Sensitivity', 'Low / Medium / High')}
        />
        <SettingsRow
          icon="map-marker-radius"
          label="Notification Radius"
          value={`${(user?.notificationRadius ?? 1000) / 1000}km`}
          onPress={() => Alert.alert('Radius', '500m / 1km / 2km / 5km')}
          isLast
        />
      </SettingsSection>

      {/* Privacy */}
      <SectionHeader label="PRIVACY" />
      <SettingsSection>
        <View style={styles.switchRow}>
          <MaterialCommunityIcons name="incognito" size={20} color={colors.text.secondary} />
          <Text style={[typography.body.lg, { color: colors.text.primary, flex: 1 }]}>
            Anonymous Mode
          </Text>
          <Switch
            value={anonMode}
            onValueChange={setAnonMode}
            trackColor={{ false: colors.border.strong, true: colors.brand.red }}
            thumbColor={colors.text.primary}
          />
        </View>
      </SettingsSection>

      {/* App */}
      <SectionHeader label="APP" />
      <SettingsSection>
        <SettingsRow
          icon="translate"
          label="Language"
          value="English"
          onPress={() => Alert.alert('Language', 'Multi-language support coming soon.\nEnglish / Zulu / Sotho')}
        />
        <SettingsRow
          icon="information-outline"
          label="About Vuka"
          value="v1.0 · SM Infinite Tech"
          onPress={() => Alert.alert('Vuka', 'Built in Brakpan, for South Africa.\n\nSM Infinite Tech © 2024')}
          isLast
        />
      </SettingsSection>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.brand.red} />
        <Text style={[typography.label.md, { color: colors.brand.red }]}>SIGN OUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={[typography.label.sm, { color: colors.text.muted, paddingHorizontal: spacing.md, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
      {label}
    </Text>
  );
}

function SettingsSection({ children }: { children: React.ReactNode }) {
  return (
    <View style={sectionStyles.section}>{children}</View>
  );
}

function SettingsRow({ icon, label, value, onPress, isLast }: {
  icon: string; label: string; value?: string; onPress?: () => void; isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[sectionStyles.row, !isLast && sectionStyles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon as any} size={20} color={colors.text.secondary} />
      <Text style={[typography.body.lg, { color: colors.text.primary, flex: 1 }]}>{label}</Text>
      {value && <Text style={[typography.mono.sm, { color: colors.text.muted }]}>{value}</Text>}
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBadge}>
      <Text style={[typography.display.md, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[typography.label.sm, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: spacing.md },
  userCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.redDim,
    borderWidth: 2,
    borderColor: colors.brand.redBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { gap: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statBadge: { alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border.medium },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.redBorder,
  },
});

const sectionStyles = StyleSheet.create({
  section: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
});
