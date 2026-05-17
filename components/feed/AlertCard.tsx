import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import type { Alert } from '@/stores/feedStore';

interface Props {
  alert: Alert;
  onPress?: () => void;
}

function formatTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export function AlertCard({ alert, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="alert-octagon" size={16} color={colors.brand.red} />
        <Text style={[typography.label.md, { color: colors.brand.red, flex: 1 }]}>
          DANGER REPORTED · {alert.distanceMetres}m from you
        </Text>
      </View>
      <Text style={[typography.body.sm, { color: colors.text.secondary, marginTop: 4 }]}>
        Active {formatTime(alert.createdAt)} · {alert.respondersCount} people responding
      </Text>
      <View style={styles.cta}>
        <MaterialCommunityIcons name="map-marker-radius" size={14} color={colors.brand.red} />
        <Text style={[typography.label.sm, { color: colors.brand.red }]}> TAP TO SEE LIVE LOCATION</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.red,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
});
