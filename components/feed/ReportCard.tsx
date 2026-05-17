import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import type { Report, ReportCategory } from '@/stores/feedStore';

const CATEGORY_ICONS: Record<ReportCategory, string> = {
  pothole: 'road-variant',
  water_leak: 'water',
  no_electricity: 'lightning-bolt',
  illegal_dump: 'delete-sweep',
  crime: 'alert-octagon',
  road_damage: 'road',
  flooding: 'waves',
  other: 'dots-horizontal-circle',
};

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  pothole: 'Pothole',
  water_leak: 'Water Leak',
  no_electricity: 'No Electricity',
  illegal_dump: 'Illegal Dump',
  crime: 'Crime',
  road_damage: 'Road Damage',
  flooding: 'Flooding',
  other: 'Other',
};

interface Props {
  report: Report;
  onPress?: () => void;
}

function formatDistance(m: number) {
  return m < 1000 ? `${m}m away` : `${(m / 1000).toFixed(1)}km away`;
}

export function ReportCard({ report, onPress }: Props) {
  const iconName = CATEGORY_ICONS[report.category];
  const label = CATEGORY_LABELS[report.category];
  const isResolved = report.status === 'resolved';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: isResolved ? '#00C48C22' : colors.brand.redDim },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName as any}
            size={20}
            color={isResolved ? colors.brand.green : colors.brand.red}
          />
        </View>
        <View style={styles.meta}>
          <Text
            style={[
              typography.label.md,
              { color: isResolved ? colors.brand.green : colors.brand.orange },
            ]}
          >
            {label} · {formatDistance(report.distanceMetres)}
          </Text>
          <Text style={[typography.mono.sm, { color: colors.text.muted }]} numberOfLines={1}>
            {report.location.address}
          </Text>
        </View>
        {isResolved && (
          <View style={styles.resolvedBadge}>
            <Text style={[typography.label.sm, { color: colors.brand.green }]}>RESOLVED</Text>
          </View>
        )}
      </View>

      <Text
        style={[typography.body.md, { color: colors.text.primary, marginTop: spacing.sm }]}
        numberOfLines={2}
      >
        {report.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.brand.green} />
          <Text style={[typography.mono.sm, { color: colors.text.secondary }]}>
            {' '}{report.validations} validations
          </Text>
        </View>
        {!isResolved && report.daysOpen > 0 && (
          <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
            Open {report.daysOpen}d
          </Text>
        )}
        <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
          #{report.caseNumber}
        </Text>
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
    borderColor: colors.border.subtle,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, gap: 2 },
  resolvedBadge: {
    backgroundColor: '#00C48C22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
});
