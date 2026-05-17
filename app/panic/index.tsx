import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioWave } from '@/components/panic/AudioWave';
import { PanicButton } from '@/components/panic/PanicButton';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useLocation } from '@/hooks/useLocation';
import { usePanic } from '@/hooks/usePanic';
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { useAuthStore } from '@/stores/authStore';

export default function PanicScreen() {
  const insets = useSafeAreaInsets();
  const { status, triggerPanic, resolvePanic, respondersCount } = usePanic();
  const { location } = useLocation(true);
  const { user } = useAuthStore();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [showPassMessage, setShowPassMessage] = useState(false);

  const isActive = status === 'active';

  // Shake → trigger panic
  useShakeDetector(
    useCallback(() => {
      if (status === 'idle') triggerPanic();
    }, [status, triggerPanic]),
  );

  // Background pulse animation
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
      Animated.timing(bgAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(bgAnim, { toValue: 0, duration: 400, useNativeDriver: false }).start();
    }
  }, [isActive]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bg.primary, '#1A0000'],
  });

  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.18] });

  const handleSafe = () => {
    if (showPin) return;
    setShowPin(true);
    setPin('');
    setPinError('');
  };

  const handlePinChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setPinError('');
    if (digits.length === 4) {
      const expected = user?.panicPin ?? '1234';
      if (digits === expected) {
        resolvePanic(digits);
        router.back();
      } else {
        setPinError('Wrong PIN — try again');
        setPin('');
      }
    }
  };

  const handleTrigger = () => {
    triggerPanic();
  };

  const locationLabel = location?.address
    ? location.address.split(',').slice(0, 2).join(',').trim()
    : 'Getting your location...';

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Pulse overlay */}
      {isActive && (
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.brand.red, opacity: pulseOpacity }]} pointerEvents="none" />
      )}

      {/* Close (only when idle) */}
      {!isActive && (
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      )}

      {!isActive ? (
        /* IDLE STATE */
        <View style={styles.idleContent}>
          <View style={styles.idleTop}>
            <Text style={[typography.display.xl, { color: colors.brand.red, textAlign: 'center' }]}>
              VUKA PANIC
            </Text>
            <Text style={[typography.body.lg, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm }]}>
              Hold the button for 1.5s{'\n'}or shake your phone to trigger an alert
            </Text>
          </View>

          <PanicButton onActivate={handleTrigger} />

          <View style={styles.idleBottom}>
            <View style={styles.locationPill}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.brand.red} />
              <Text style={[typography.mono.sm, { color: colors.text.secondary }]} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
            <Text style={[typography.label.sm, { color: colors.text.muted, textAlign: 'center', marginTop: spacing.md }]}>
              Shake phone to trigger · Alert sent to community within 1km
            </Text>
          </View>
        </View>
      ) : (
        /* ACTIVE STATE */
        <View style={styles.activeContent}>
          <View style={styles.activeTop}>
            <View style={styles.activeBanner}>
              <MaterialCommunityIcons name="alert-octagon" size={18} color={colors.brand.red} />
              <Text style={[typography.label.md, { color: colors.brand.red }]}>PANIC ALERT ACTIVE</Text>
            </View>
            <Text style={[typography.display.xl, { color: colors.text.primary, textAlign: 'center' }]}>
              HELP{'\n'}IS COMING
            </Text>
            <Text style={[typography.body.lg, { color: colors.text.secondary, textAlign: 'center' }]}>
              {locationLabel}
            </Text>
          </View>

          {/* AudioWave */}
          <View style={styles.waveContainer}>
            <AudioWave isActive />
          </View>

          {/* Responders */}
          <View style={styles.respondersBox}>
            <Text style={[typography.display.lg, { color: colors.brand.red }]}>{respondersCount}</Text>
            <Text style={[typography.label.md, { color: colors.text.secondary }]}>
              COMMUNITY{'\n'}RESPONDERS
            </Text>
          </View>

          {/* Pass Message */}
          {!showPassMessage ? (
            <TouchableOpacity style={styles.passMessageBtn} onPress={() => setShowPassMessage(true)}>
              <MaterialCommunityIcons name="message-text-outline" size={18} color={colors.text.secondary} />
              <Text style={[typography.label.md, { color: colors.text.secondary }]}>PASS A MESSAGE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.passMessageBox}>
              <TextInput
                style={styles.passInput}
                value={passMessage}
                onChangeText={setPassMessage}
                placeholder="e.g. Blue Toyota Hilux, fleeing north..."
                placeholderTextColor={colors.text.muted}
                maxLength={120}
                autoFocus
              />
              <TouchableOpacity
                style={styles.passSend}
                onPress={() => { setShowPassMessage(false); setPassMessage(''); }}
              >
                <Text style={[typography.label.md, { color: '#fff' }]}>SEND</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* I AM SAFE */}
          {!showPin ? (
            <TouchableOpacity style={styles.safeBtn} onPress={handleSafe} activeOpacity={0.8}>
              <MaterialCommunityIcons name="shield-check" size={20} color={colors.text.primary} />
              <Text style={[typography.display.md, { color: colors.text.primary }]}>I AM SAFE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pinSection}>
              <Text style={[typography.label.md, { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm }]}>
                Enter your 4-digit panic PIN to dismiss
              </Text>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.text.muted}
                textAlign="center"
                autoFocus
              />
              {!!pinError && (
                <Text style={[typography.body.sm, { color: colors.brand.red, textAlign: 'center', marginTop: spacing.sm }]}>
                  {pinError}
                </Text>
              )}
              <TouchableOpacity onPress={() => setShowPin(false)} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
                <Text style={[typography.body.sm, { color: colors.text.muted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  idleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  idleTop: { alignItems: 'center', marginTop: spacing.xl },
  idleBottom: { alignItems: 'center', width: '100%' },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    maxWidth: 280,
  },
  activeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  activeTop: { alignItems: 'center', gap: spacing.md },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand.redDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.redBorder,
  },
  waveContainer: { width: '100%', height: 80 },
  respondersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    width: '100%',
  },
  passMessageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  passMessageBox: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: 'hidden',
  },
  passInput: {
    color: colors.text.primary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    padding: spacing.md,
  },
  passSend: {
    backgroundColor: colors.brand.red,
    padding: spacing.sm,
    alignItems: 'center',
  },
  safeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand.green,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.full,
    shadowColor: colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  pinSection: { width: '100%', alignItems: 'center' },
  pinInput: {
    width: 160,
    height: 56,
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.redBorder,
    color: colors.text.primary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    textAlign: 'center',
  },
});
