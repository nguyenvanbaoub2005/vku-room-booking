import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../types';
import { MOCK_BOOKINGS } from '../constants/mockData';

interface BookingState {
  bookings: Booking[];
  pendingSync: Booking[];
  isLoading: boolean;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'synced' | 'status'>) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
  getRoomBookingsForDate: (roomId: string, date: string) => Booking[];
  loadFromStorage: () => Promise<void>;
  syncPending: () => Promise<void>;
}

const BOOKINGS_KEY = '@vku_bookings';

const generateId = () => `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: MOCK_BOOKINGS,
  pendingSync: [],
  isLoading: false,

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
      if (raw) {
        const stored: Booking[] = JSON.parse(raw);
        // Merge mock with stored, stored takes precedence by id
        const allIds = new Set(stored.map((b) => b.id));
        const merged = [
          ...MOCK_BOOKINGS.filter((b) => !allIds.has(b.id)),
          ...stored,
        ];
        set({ bookings: merged });
      }
    } catch { /* ignore */ }
  },

  createBooking: async (data) => {
    const booking: Booking = {
      ...data,
      id: generateId(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      synced: false,
    };
    const newBookings = [...get().bookings, booking];
    set({ bookings: newBookings, pendingSync: [...get().pendingSync, booking] });
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(newBookings));
    // Simulate sync
    setTimeout(async () => {
      const updated = get().bookings.map((b) => b.id === booking.id ? { ...b, synced: true } : b);
      set({ bookings: updated, pendingSync: get().pendingSync.filter((b) => b.id !== booking.id) });
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    }, 2000);
    return booking;
  },

  cancelBooking: async (id: string) => {
    const updated = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' as const, synced: false } : b
    );
    set({ bookings: updated });
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    // Simulate sync
    setTimeout(async () => {
      const synced = get().bookings.map((b) => b.id === id ? { ...b, synced: true } : b);
      set({ bookings: synced });
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(synced));
    }, 1500);
  },

  getUserBookings: (userId: string) => {
    return get().bookings.filter((b) => b.userId === userId);
  },

  getRoomBookingsForDate: (roomId: string, date: string) => {
    return get().bookings.filter(
      (b) => b.roomId === roomId && b.date === date && b.status !== 'cancelled'
    );
  },

  syncPending: async () => {
    const pending = get().pendingSync;
    if (pending.length === 0) return;
    // Simulate API sync
    await new Promise((r) => setTimeout(r, 1000));
    const ids = new Set(pending.map((b) => b.id));
    const updated = get().bookings.map((b) => ids.has(b.id) ? { ...b, synced: true } : b);
    set({ bookings: updated, pendingSync: [] });
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  },
}));
