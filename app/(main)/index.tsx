import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCard } from '@/components/feed/AlertCard';
import { CategoryPill } from '@/components/feed/CategoryPill';
import { ReportCard } from '@/components/feed/ReportCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useFeedStore, type FeedItem } from '@/stores/feedStore';
import { useLocation } from '@/hooks/useLocation';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'civic', label: 'Civic' },
  { key: 'resolved', label: 'Resolved' },
] as const;

const TAB_BAR_HEIGHT = 49;

export default function HomeFeed() {
  const insets = useSafeAreaInsets();
  const { items, filter, isLoading, setFilter, loadFeed } = useFeedStore();
  const { location } = useLocation(false);
  const alertBannerAnim = useRef(new Animated.Value(-80)).current;
  const hasActiveAlerts = items.some((i) => i.type === 'alert' && i.data.status === 'active');

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (hasActiveAlerts) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
      pulseOpacity.value = withRepeat(
        withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    }
  }, [hasActiveAlerts]);

  useEffect(() => {
    if (hasActiveAlerts) {
      Animated.spring(alertBannerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      const t = setTimeout(() => {
        Animated.timing(alertBannerAnim, { toValue: -80, duration: 300, useNativeDriver: true }).start();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [hasActiveAlerts]);

  const panicGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return item.type === 'alert';
    if (filter === 'civic') return item.type === 'report' && item.data.category !== 'crime';
    if (filter === 'resolved') return item.type === 'report' && item.data.status === 'resolved';
    return true;
  });

  const renderItem = useCallback(({ item }: { item: FeedItem }) => {
    if (item.type === 'alert') {
      return <AlertCard alert={item.data} onPress={() => router.push('/panic')} />;
    }
    return <ReportCard report={item.data} />;
  }, []);

  const locationLabel = location?.address
    ? location.address.split(',').slice(0, 2).join(',').trim()
    : 'Locating...';

  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Alert Banner */}
      <Animated.View style={[styles.alertBanner, { transform: [{ translateY: alertBannerAnim }] }]}>
        <MaterialCommunityIcons name="alert-octagon" size={16} color="#fff" />
        <Text style={[typography.label.md, { color: '#fff', flex: 1 }]}>
          DANGER ALERT IN YOUR AREA — TAP TO VIEW
        </Text>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.display.lg, { color: colors.brand.red }]}>VUKA</Text>
        <View style={styles.locationPill}>
          <MaterialCommunityIcons name="map-marker" size={12} color={colors.brand.red} />
          <Text style={[typography.mono.sm, { color: colors.text.secondary }]} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <CategoryPill
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {/* Feed */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}_${item.data.id}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomOffset + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadFeed}
            tintColor={colors.brand.red}
          />
        }
        scrollEnabled={!!filteredItems.length}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={Platform.OS !== 'web'}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="shield-check" size={48} color={colors.border.strong} />
              <Text style={[typography.body.lg, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.md }]}>
                All quiet in your area.{'\n'}Stay alert.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Panic Button */}
      <View style={[styles.floatingContainer, { bottom: bottomOffset + 16 }]}>
        {hasActiveAlerts && (
          <Reanimated.View style={[styles.panicGlow, panicGlowStyle]} />
        )}
        <TouchableOpacity
          style={styles.floatingPanic}
          onPress={() => router.push('/panic')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="alarm-light" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.brand.red,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxWidth: 180,
  },
  filterBar: { maxHeight: 48 },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  listContent: { paddingTop: spacing.sm },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: spacing.xl },
  floatingContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.red,
  },
  floatingPanic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
});
