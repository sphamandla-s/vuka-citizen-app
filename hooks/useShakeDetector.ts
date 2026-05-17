import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const SHAKE_THRESHOLD = 2.5;
const SHAKE_WINDOW_MS = 1500;
const REQUIRED_SHAKES = 3;

export function useShakeDetector(onShake: () => void, enabled = true) {
  const shakeTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let subscription: { remove: () => void } | null = null;

    const setupAccelerometer = async () => {
      try {
        const { Accelerometer } = await import('expo-sensors');
        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          if (magnitude > SHAKE_THRESHOLD) {
            const now = Date.now();
            shakeTimes.current = [...shakeTimes.current, now].filter(
              (t) => now - t < SHAKE_WINDOW_MS,
            );
            if (shakeTimes.current.length >= REQUIRED_SHAKES) {
              shakeTimes.current = [];
              onShake();
            }
          }
        });
      } catch {
        // expo-sensors not available
      }
    };

    setupAccelerometer();

    return () => {
      subscription?.remove();
    };
  }, [enabled, onShake]);
}
