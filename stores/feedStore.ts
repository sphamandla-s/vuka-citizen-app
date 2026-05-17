import { create } from 'zustand';

export type ReportCategory =
  | 'pothole'
  | 'water_leak'
  | 'no_electricity'
  | 'illegal_dump'
  | 'crime'
  | 'road_damage'
  | 'flooding'
  | 'other';

export type ReportRadius = 'private' | 'street' | 'neighbourhood' | 'area';

export interface Report {
  id: string;
  category: ReportCategory;
  description: string;
  location: { lat: number; lng: number; address: string };
  photoUrl?: string;
  validations: number;
  status: 'open' | 'resolved';
  daysOpen: number;
  distanceMetres: number;
  isAnonymous: boolean;
  caseNumber: string;
  createdAt: string;
  userId: string;
}

export interface Alert {
  id: string;
  panicId: string;
  distanceMetres: number;
  respondersCount: number;
  createdAt: string;
  location: { lat: number; lng: number };
  status: 'active' | 'resolved';
}

export type FeedItem = { type: 'report'; data: Report } | { type: 'alert'; data: Alert };

type FilterType = 'all' | 'alerts' | 'civic' | 'resolved';

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    category: 'pothole',
    description: 'Large pothole, nearly bent my rim. Dangerous at night.',
    location: { lat: -26.2041, lng: 28.0473, address: 'Cnr Main Reef Rd & Voortrekker, Brakpan' },
    validations: 7,
    status: 'open',
    daysOpen: 12,
    distanceMetres: 400,
    isAnonymous: false,
    caseNumber: 'VK-2847',
    createdAt: '2024-01-15T08:30:00Z',
    userId: 'u1',
  },
  {
    id: '2',
    category: 'no_electricity',
    description: 'No power since yesterday. Whole street affected.',
    location: { lat: -26.2055, lng: 28.0490, address: '14 Oak Street, Brakpan' },
    validations: 23,
    status: 'open',
    daysOpen: 1,
    distanceMetres: 220,
    isAnonymous: false,
    caseNumber: 'VK-2901',
    createdAt: '2024-01-16T06:00:00Z',
    userId: 'u2',
  },
  {
    id: '3',
    category: 'illegal_dump',
    description: 'Massive illegal dump site on the corner. Growing daily.',
    location: { lat: -26.2031, lng: 28.0510, address: 'Cnr Station & Rietbok, Brakpan' },
    validations: 4,
    status: 'open',
    daysOpen: 5,
    distanceMetres: 650,
    isAnonymous: false,
    caseNumber: 'VK-2802',
    createdAt: '2024-01-11T14:00:00Z',
    userId: 'u3',
  },
  {
    id: '4',
    category: 'road_damage',
    description: 'Deep trenches from burst pipe never repaired. Dangerous for school children.',
    location: { lat: -26.2070, lng: 28.0460, address: 'School Road, Brakpan' },
    validations: 15,
    status: 'resolved',
    daysOpen: 0,
    distanceMetres: 900,
    isAnonymous: false,
    caseNumber: 'VK-2756',
    createdAt: '2024-01-05T09:00:00Z',
    userId: 'u4',
  },
  {
    id: '5',
    category: 'crime',
    description: 'Armed robbery at the Spar. One person hurt. Police were called.',
    location: { lat: -26.2020, lng: 28.0495, address: 'Brakpan CBD, Brakpan' },
    validations: 11,
    status: 'open',
    daysOpen: 0,
    distanceMetres: 180,
    isAnonymous: true,
    caseNumber: 'VK-2950',
    createdAt: '2024-01-17T11:45:00Z',
    userId: 'u5',
  },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    panicId: 'p1',
    distanceMetres: 220,
    respondersCount: 4,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    location: { lat: -26.2045, lng: 28.0480 },
    status: 'active',
  },
];

interface FeedState {
  items: FeedItem[];
  filter: FilterType;
  isLoading: boolean;
  setFilter: (f: FilterType) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (panicId: string) => void;
  addReport: (report: Report) => void;
  loadFeed: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  filter: 'all',
  isLoading: false,

  setFilter: (filter) => set({ filter }),

  addAlert: (alert) => {
    const item: FeedItem = { type: 'alert', data: alert };
    set({ items: [item, ...get().items] });
  },

  removeAlert: (panicId) => {
    set({
      items: get().items.filter(
        (i) => !(i.type === 'alert' && i.data.id === panicId),
      ),
    });
  },

  addReport: (report) => {
    const item: FeedItem = { type: 'report', data: report };
    set({ items: [item, ...get().items] });
  },

  loadFeed: () => {
    set({ isLoading: true });
    setTimeout(() => {
      const feed: FeedItem[] = [
        ...MOCK_ALERTS.map((a) => ({ type: 'alert' as const, data: a })),
        ...MOCK_REPORTS.map((r) => ({ type: 'report' as const, data: r })),
      ];
      set({ items: feed, isLoading: false });
    }, 800);
  },
}));
