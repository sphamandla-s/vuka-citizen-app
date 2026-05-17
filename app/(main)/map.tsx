import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapContainer } from '@/components/map/MapContainer';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { CATEGORY_LABELS } from '@/components/feed/ReportCard';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useLocation } from '@/hooks/useLocation';
import { useFeedStore, type Alert, type FeedItem, type Report } from '@/stores/feedStore';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'civic', label: 'Civic' },
  { key: 'resolved', label: 'Resolved' },
] as const;

const SHEET_HEIGHT_COLLAPSED = 200;
const DEFAULT_LOCATION = { lat: -26.2041, lng: 28.0473 };
const NEARBY_RADIUS_METRES = 10000;

type NearbyReport = Report & {
  distanceFromUser: number;
  distanceLabel: string;
  title: string;
  description: string;
};

type NearbyAlert = Alert & {
  distanceFromUser: number;
  distanceLabel: string;
  title: string;
  description: string;
};

function distanceBetweenMetres(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadius = 6371000;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)}m` : `${(metres / 1000).toFixed(1)}km`;
}

function shouldShowItem(item: FeedItem, filter: (typeof FILTERS)[number]['key']) {
  if (filter === 'all') return true;
  if (filter === 'alerts') return item.type === 'alert';
  if (filter === 'civic') return item.type === 'report' && item.data.category !== 'crime';
  if (filter === 'resolved') return item.type === 'report' && item.data.status === 'resolved';
  return true;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { location, error: locationError } = useLocation(true);
  const { items, filter, setFilter, loadFeed } = useFeedStore();
  const [sheetAnim] = useState(new Animated.Value(0));
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    if (!items.length) loadFeed();
  }, [items.length, loadFeed]);

  const userLocation = location ?? DEFAULT_LOCATION;
  const lat = userLocation.lat;
  const lng = userLocation.lng;

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 0 : 1;
    Animated.spring(sheetAnim, { toValue, useNativeDriver: false, tension: 80, friction: 12 }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_HEIGHT_COLLAPSED, 400],
  });

  const nearbyItems = useMemo(
    () =>
      items
        .filter((item) => shouldShowItem(item, filter))
        .map((item) => {
          const itemLocation =
            item.type === 'report' ? item.data.location : item.data.location;
          const distanceFromUser = distanceBetweenMetres(userLocation, itemLocation);
          return { item, distanceFromUser };
        })
        .filter(({ distanceFromUser }) => distanceFromUser <= NEARBY_RADIUS_METRES)
        .sort((a, b) => a.distanceFromUser - b.distanceFromUser),
    [items, filter, userLocation.lat, userLocation.lng],
  );

  const reports = useMemo<NearbyReport[]>(
    () =>
      nearbyItems
        .filter(({ item }) => item.type === 'report')
        .map(({ item, distanceFromUser }) => {
          const report = item.data as Report;
          return {
            ...report,
            distanceFromUser,
            distanceLabel: formatDistance(distanceFromUser),
            title: CATEGORY_LABELS[report.category],
            description: report.location.address,
          };
        }),
    [nearbyItems],
  );

  const alerts = useMemo<NearbyAlert[]>(
    () =>
      nearbyItems
        .filter(({ item }) => item.type === 'alert')
        .map(({ item, distanceFromUser }) => {
          const alert = item.data as Alert;
          return {
            ...alert,
            distanceFromUser,
            distanceLabel: formatDistance(distanceFromUser),
            title: alert.status === 'active' ? 'Active panic alert' : 'Resolved panic alert',
            description: `${alert.respondersCount} responders · ${alert.status}`,
          };
        }),
    [nearbyItems],
  );

  const incidentCount = reports.length + alerts.length;

  return (
    <View style={styles.container}>
      <MapContainer latitude={lat} longitude={lng} reports={reports} alerts={alerts} />

      {/* Filter bar overlay */}
      <View style={[styles.filterBar, { top: insets.top + spacing.sm }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <CategoryPill key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { top: insets.top + 60 }]}>
        {[
          { color: colors.brand.red, label: 'Alert' },
          { color: colors.brand.orange, label: 'Open' },
          { color: colors.brand.green, label: 'Resolved' },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={[typography.label.sm, { color: colors.text.secondary }]}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.locationCard, { top: insets.top + 130 }]}>
        <MaterialCommunityIcons
          name={location ? 'crosshairs-gps' : 'crosshairs-question'}
          size={16}
          color={location ? colors.brand.green : colors.brand.orange}
        />
        <View style={styles.locationCopy}>
          <Text style={[typography.label.sm, { color: colors.text.secondary }]}>
            {location ? 'USING LIVE LOCATION' : 'WAITING FOR GPS'}
          </Text>
          <Text style={[typography.mono.sm, { color: colors.text.muted }]} numberOfLines={1}>
            {location?.address ?? locationError ?? 'Enable location permission for nearby alerts'}
          </Text>
        </View>
      </View>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + 80 }]}>
        <TouchableOpacity onPress={toggleSheet} style={styles.sheetHandle}>
          <View style={styles.handle} />
          <Text style={[typography.label.md, { color: colors.text.secondary }]}>
            {sheetExpanded ? 'COLLAPSE' : `${incidentCount} NEARBY INCIDENTS`}
          </Text>
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false}>
          {alerts.map((a) => (
            <View key={`alert_${a.id}`} style={styles.sheetItem}>
              <MaterialCommunityIcons
                name="alert-octagon"
                size={20}
                color={a.status === 'resolved' ? colors.brand.green : colors.brand.red}
              />
              <View style={styles.sheetItemContent}>
                <Text style={[typography.body.lg, { color: colors.text.primary }]}>
                  {a.title}
                </Text>
                <Text style={[typography.mono.sm, { color: colors.text.muted }]} numberOfLines={1}>
                  {a.description}
                </Text>
              </View>
              <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
                {a.distanceLabel}
              </Text>
            </View>
          ))}
          {reports.map((r) => (
            <View key={r.id} style={styles.sheetItem}>
              <MaterialCommunityIcons
                name="circle-small"
                size={20}
                color={r.status === 'resolved' ? colors.brand.green : colors.brand.orange}
              />
              <View style={styles.sheetItemContent}>
                <Text style={[typography.body.lg, { color: colors.text.primary }]}>
                  {r.title}
                </Text>
                <Text style={[typography.mono.sm, { color: colors.text.muted }]} numberOfLines={1}>
                  {r.location.address}
                </Text>
              </View>
              <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
                {r.distanceLabel}
              </Text>
            </View>
          ))}
          {!incidentCount && (
            <View style={styles.emptyNearby}>
              <MaterialCommunityIcons name="map-marker-check-outline" size={32} color={colors.border.strong} />
              <Text style={[typography.body.lg, { color: colors.text.secondary, textAlign: 'center' }]}>
                No alerts or issues within {formatDistance(NEARBY_RADIUS_METRES)}.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  filterBar: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterContent: { paddingHorizontal: spacing.md, gap: spacing.sm },
  legend: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  locationCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationCopy: { flex: 1, minWidth: 0, gap: 2 },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
  },
  sheetHandle: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border.strong },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: spacing.xs,
  },
  sheetItemContent: { flex: 1 },
  emptyNearby: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
});
