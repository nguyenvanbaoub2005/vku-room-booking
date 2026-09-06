import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Booking } from '../../types';
import { Colors, Spacing, Radius } from '../../constants/Colors';

const TABS = ['Sắp tới', 'Đã qua', 'Đã hủy'];

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const statusConfig = {
    confirmed: { label: 'Đã xác nhận', color: Colors.success, icon: 'checkmark-circle' },
    pending: { label: 'Chờ duyệt', color: Colors.warning, icon: 'time' },
    completed: { label: 'Hoàn thành', color: Colors.textMuted, icon: 'checkmark-done' },
    cancelled: { label: 'Đã hủy', color: Colors.error, icon: 'close-circle' },
  }[booking.status] ?? { label: booking.status, color: Colors.textMuted, icon: 'help' };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomName}>{booking.roomName}</Text>
          <Text style={styles.purpose} numberOfLines={1}>{booking.purpose}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusConfig.color + '22' }]}>
          <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.infoText}>{booking.date}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.infoText}>{booking.startTime} – {booking.endTime}</Text>
        </View>
        {!booking.synced && (
          <View style={styles.infoItem}>
            <Ionicons name="cloud-offline-outline" size={14} color={Colors.warning} />
            <Text style={[styles.infoText, { color: Colors.warning }]}>Chưa đồng bộ</Text>
          </View>
        )}
      </View>

      {booking.status === 'confirmed' && onCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
          <Text style={styles.cancelText}>Hủy đặt phòng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const { getUserBookings, cancelBooking } = useBookingStore();
  const [tab, setTab] = useState('Sắp tới');

  const all = getUserBookings(user?.id ?? '');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcoming = all.filter((b) =>
    (b.status === 'confirmed' || b.status === 'pending') && b.date >= todayStr
  );
  const past = all.filter((b) =>
    b.status === 'completed' || (b.status === 'confirmed' && b.date < todayStr)
  );
  const cancelled = all.filter((b) => b.status === 'cancelled');

  const data = { 'Sắp tới': upcoming, 'Đã qua': past, 'Đã hủy': cancelled }[tab] ?? [];

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      'Xác nhận hủy',
      `Bạn có chắc muốn hủy đặt phòng ${booking.roomName} ngày ${booking.date}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt phòng', style: 'destructive',
          onPress: () => cancelBooking(booking.id),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch đặt phòng</Text>
        <Text style={styles.subtitle}>{all.length} lần đặt</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const count = { 'Sắp tới': upcoming.length, 'Đã qua': past.length, 'Đã hủy': cancelled.length }[t];
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              {(count ?? 0) > 0 && (
                <View style={[styles.tabBadge, tab === t && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, tab === t && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={item.status === 'confirmed' ? () => handleCancel(item) : undefined}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Không có lịch đặt</Text>
            <Text style={styles.emptyText}>
              {tab === 'Sắp tới' ? 'Hãy đặt phòng ngay!' : 'Không có dữ liệu'}
            </Text>
            {tab === 'Sắp tới' && (
              <TouchableOpacity style={styles.goBtn} onPress={() => router.push('/')}>
                <Text style={styles.goBtnText}>Đặt phòng ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: 4, marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: Radius.sm - 2, gap: 4,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  tabBadge: {
    backgroundColor: Colors.border, borderRadius: Radius.full,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: '#fff3' },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.textMuted },
  tabBadgeTextActive: { color: '#fff' },

  list: { padding: Spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  roomName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  purpose: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: Colors.textSecondary },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cancelText: { fontSize: 13, color: Colors.error, fontWeight: '600' },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
  goBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 12,
  },
  goBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
