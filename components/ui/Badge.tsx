import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';

interface BadgeProps {
  label: string;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const bg =
    variant === 'danger'
      ? colors.brand.redDim
      : variant === 'warning'
        ? '#F5A62322'
        : variant === 'success'
          ? '#00C48C22'
          : variant === 'info'
            ? '#3B8BFF22'
            : '#55555522';

  const textColor =
    variant === 'danger'
      ? colors.brand.red
      : variant === 'warning'
        ? colors.brand.orange
        : variant === 'success'
          ? colors.brand.green
          : variant === 'info'
            ? colors.status.info
            : colors.text.muted;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[typography.label.sm, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
});
