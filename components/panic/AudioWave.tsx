import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

const BAR_COUNT = 5;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 28;

function Bar({ index }: { index: number }) {
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    const randomMax = MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT);
    const duration = 280 + Math.random() * 200;
    height.value = withDelay(
      index * 100,
      withRepeat(
        withTiming(randomMax, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return <Reanimated.View style={[styles.bar, style]} />;
}

export function AudioWave() {
  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <Bar key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: MAX_HEIGHT + 8,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.red,
  },
});
