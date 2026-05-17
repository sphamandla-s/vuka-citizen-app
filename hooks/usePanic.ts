import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { api } from '@/services/api';
import { connectSocket } from '@/services/socket';
import { useAuthStore } from '@/stores/authStore';
import { usePanicStore } from '@/stores/panicStore';
import { useLocation } from './useLocation';

export function usePanic() {
  const { status, activatePanic, deactivatePanic, setRecording, respondersCount, setRespondersCount } = usePanicStore();
  const { user } = useAuthStore();
  const { location } = useLocation(false);

  // Simulate responders joining when panic is active
  useEffect(() => {
    if (status !== 'active') return;
    let count = 0;
    const intervals = [2000, 5000, 8000, 14000, 22000];
    const timers = intervals.map((delay, i) =>
      setTimeout(() => {
        count = i + 1;
        setRespondersCount(count);
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [status, setRespondersCount]);

  const triggerPanic = useCallback(async () => {
    if (status === 'active') return;

    const loc = location ?? { lat: -26.2041, lng: 28.0473 };

    try {
      const res = await api.post('/panic/trigger', { location: loc });
      const panicId: string = res.data?.panicId ?? `panic_${Date.now()}`;
      activatePanic(panicId);

      const socket = connectSocket('');
      socket.emit('panic:trigger', {
        userId: user?.id ?? 'anon',
        location: loc,
        timestamp: new Date().toISOString(),
      });

      if (Platform.OS !== 'web') {
        startRecording(setRecording);
      }
    } catch {
      const panicId = `panic_${Date.now()}`;
      activatePanic(panicId);
      usePanicStore.getState().setOffline(true);
    }
  }, [status, location, user, activatePanic, setRecording]);

  const resolvePanic = useCallback(
    async (pin: string): Promise<boolean> => {
      const { panicId } = usePanicStore.getState();
      if (!panicId) return false;

      const expectedPin = useAuthStore.getState().user?.panicPin ?? '1234';
      if (pin !== expectedPin) return false;

      try {
        await api.patch(`/panic/${panicId}/resolve`, { pin });
      } catch {
        // offline — resolve locally
      }

      try {
        const socket = connectSocket('');
        socket.emit('panic:resolved', { panicId, resolvedBy: 'user' });
      } catch {
        // ignore
      }
      deactivatePanic();
      return true;
    },
    [deactivatePanic],
  );

  return { status, triggerPanic, resolvePanic, respondersCount };
}

async function startRecording(setRecording: (v: boolean) => void) {
  try {
    const { Audio } = await import('expo-av');
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    setRecording(true);
    setTimeout(async () => {
      await recording.stopAndUnloadAsync();
      setRecording(false);
    }, 60000);
  } catch {
    // audio not available
  }
}
