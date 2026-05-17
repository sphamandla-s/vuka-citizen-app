import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { shadow } from '@/constants/layout';
import { typography } from '@/constants/typography';

const HOLD_DURATION = 1500;
const SIZE = 200;
const RING_SIZE = SIZE + 40;

interface Props {
  onActivate: () => void;
}

export function PanicButton({ onActivate }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);
  const didActivate = useRef(false);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.18, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        didActivate.current = false;
        progressAnim.current = Animated.timing(progress, {
          toValue: 1,
          duration: HOLD_DURATION,
          useNativeDriver: false,
        });
        progressAnim.current.start(({ finished }) => {
          if (finished && !didActivate.current) {
            didActivate.current = true;
            onActivate();
          }
        });
      },
      onPanResponderRelease: () => {
        if (!didActivate.current) {
          progressAnim.current?.stop();
          Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
      },
      onPanResponderTerminate: () => {
        if (!didActivate.current) {
          progressAnim.current?.stop();
          Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
      },
    }),
  ).current;

  const buttonScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.93] });
  const overlayOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const borderOpacity = progress.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] });

  return (
    <View style={styles.container}>
      <Reanimated.View style={[styles.pulseRing, pulseStyle]} />
      <Animated.View style={[styles.progressRing, { opacity: borderOpacity }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: SIZE / 2 + 6,
              borderWidth: 4,
              borderColor: colors.brand.red,
              opacity: overlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            },
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[styles.button, shadow.red, { transform: [{ scale: buttonScale }] }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.pressOverlay, { opacity: overlayOpacity }]} />
        <Text style={[typography.display.md, { color: colors.text.primary, textAlign: 'center' }]}>
          HOLD FOR{'\n'}HELP
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE + 60,
    height: SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.brand.red,
    opacity: 0.3,
  },
  progressRing: {
    position: 'absolute',
    width: SIZE + 12,
    height: SIZE + 12,
    borderRadius: (SIZE + 12) / 2,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressOverlay: {
    backgroundColor: '#fff',
    borderRadius: SIZE / 2,
  },
});
