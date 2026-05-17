import { create } from 'zustand';

export type PanicStatus = 'idle' | 'active' | 'resolving';

interface PanicState {
  status: PanicStatus;
  panicId: string | null;
  respondersCount: number;
  startTime: number | null;
  isRecording: boolean;
  isOffline: boolean;
  activatePanic: (panicId: string) => void;
  deactivatePanic: () => void;
  setRespondersCount: (count: number) => void;
  setRecording: (v: boolean) => void;
  setOffline: (v: boolean) => void;
}

export const usePanicStore = create<PanicState>((set) => ({
  status: 'idle',
  panicId: null,
  respondersCount: 0,
  startTime: null,
  isRecording: false,
  isOffline: false,

  activatePanic: (panicId) =>
    set({ status: 'active', panicId, startTime: Date.now(), respondersCount: 0 }),

  deactivatePanic: () =>
    set({ status: 'idle', panicId: null, startTime: null, respondersCount: 0, isRecording: false }),

  setRespondersCount: (count) => set({ respondersCount: count }),
  setRecording: (v) => set({ isRecording: v }),
  setOffline: (v) => set({ isOffline: v }),
}));
