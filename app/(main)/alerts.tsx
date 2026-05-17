import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_LABELS } from '@/components/feed/ReportCard';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useFeedStore, type Alert, type Report } from '@/stores/feedStore';

type TabType = 'received' | 'mine';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const { items } = useFeedStore();

  const receivedAlerts = items.filter((i) => i.type === 'alert').map((i) => i.data as Alert);
  const myReports = items.filter((i) => i.type === 'report').map((i) => i.data as Report);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.display.md, { color: colors.text.primary }]}>ALERTS</Text>
      </View>

      <View style={styles.tabs}>
        {(['received', 'mine'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                typography.label.md,
                { color: activeTab === tab ? colors.brand.red : colors.text.muted },
              ]}
            >
              {tab === 'received' ? 'RECEIVED' : 'MY REPORTS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'received' ? (
        <FlatList
          data={receivedAlerts}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message="No alerts received recently." />}
          renderItem={({ item }) => (
            <View style={styles.receivedCard}>
              <View style={styles.receivedIcon}>
                <MaterialCommunityIcons name="alert-octagon" size={20} color={colors.brand.red} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[typography.label.md, { color: colors.brand.red }]}>
                  DANGER ALERT · {item.distanceMetres}m away
                </Text>
                <Text style={[typography.body.sm, { color: colors.text.secondary }]}>
                  {item.respondersCount} responded · {item.status === 'resolved' ? 'Resolved' : 'Active'}
                </Text>
                <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
                  {new Date(item.createdAt).toLocaleDateString('en-ZA')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.status === 'active' ? colors.brand.red : colors.brand.green },
                ]}
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={myReports}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message="You haven't filed any reports yet." />}
          renderItem={({ item }) => (
            <View style={styles.myReportCard}>
              <View style={styles.myReportRow}>
                <View style={styles.myReportIcon}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.brand.orange} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[typography.body.xl, { color: colors.text.primary }]}>
                    {CATEGORY_LABELS[item.category]}
                  </Text>
                  <Text style={[typography.mono.sm, { color: colors.text.muted }]} numberOfLines={1}>
                    {item.location.address}
                  </Text>
                  <View style={styles.myReportMeta}>
                    <Text style={[typography.mono.sm, { color: colors.text.secondary }]}>
                      #{item.caseNumber}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: item.status === 'resolved' ? '#00C48C22' : colors.brand.redDim },
                      ]}
                    >
                      <Text
                        style={[
                          typography.label.sm,
                          { color: item.status === 'resolved' ? colors.brand.green : colors.brand.red },
                        ]}
                      >
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.muted} />
              </View>
              <View style={styles.validationRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.brand.green} />
                <Text style={[typography.mono.sm, { color: colors.text.secondary }]}>
                  {' '}{item.validations} community validations
                </Text>
                {item.daysOpen > 0 && (
                  <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
                    · Open {item.daysOpen}d
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="bell-off-outline" size={40} color={colors.border.strong} />
      <Text style={[typography.body.lg, { color: colors.text.secondary, marginTop: spacing.md, textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.brand.red },
  list: { padding: spacing.md, paddingBottom: 120, gap: spacing.sm },
  receivedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.red,
  },
  receivedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.redDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  myReportCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  myReportRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  myReportIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#F5A62322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myReportMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  validationRow: { flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
});
