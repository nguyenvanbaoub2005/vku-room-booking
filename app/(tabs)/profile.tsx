import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Colors, Spacing, Radius } from '../../constants/Colors';

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { getUserBookings } = useBookingStore();

  const bookings = getUserBookings(user?.id ?? '');
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.mssv}>
          <Ionicons name="id-card-outline" size={14} color={Colors.primary} />
          <Text style={styles.mssvText}>{user?.mssv}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Faculty badge */}
      <View style={styles.facultyBadge}>
        <Ionicons name="school-outline" size={14} color={Colors.primary} />
        <Text style={styles.facultyText}>{user?.faculty} • {user?.class}</Text>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Thống kê đặt phòng</Text>
      <View style={styles.statsRow}>
        <StatCard icon="calendar" value={totalBookings} label="Tổng đặt" color={Colors.primary} />
        <StatCard icon="checkmark-circle" value={completedBookings} label="Hoàn thành" color={Colors.success} />
        <StatCard icon="time" value={upcomingBookings} label="Sắp tới" color={Colors.warning} />
        <StatCard icon="close-circle" value={cancelledBookings} label="Đã hủy" color={Colors.error} />
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Tùy chọn</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/bookings')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '22' }]}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuLabel}>Lịch sử đặt phòng</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển.')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '22' }]}>
            <Ionicons name="notifications-outline" size={20} color={Colors.warning} />
          </View>
          <Text style={styles.menuLabel}>Cài đặt thông báo</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Về ứng dụng', 'VKU Đặt Phòng v1.0\nPhát triển bởi sinh viên VKU\nKhoa Công nghệ thông tin')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.secondary + '22' }]}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.menuLabel}>Về ứng dụng</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>VKU Đặt Phòng • Khoa CNTT • v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: { alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  avatarBox: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, borderWidth: 3, borderColor: Colors.primary + '66',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  mssv: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  mssvText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  email: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  facultyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '18', borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 6,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  facultyText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: Spacing.md, marginBottom: 10, marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    gap: 8, marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    alignItems: 'center', paddingVertical: 14, borderWidth: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  menu: {
    backgroundColor: Colors.bgCard, marginHorizontal: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12,
  },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: Spacing.md, backgroundColor: Colors.error + '18',
    borderRadius: Radius.md, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.error + '44',
  },
  logoutText: { fontSize: 15, color: Colors.error, fontWeight: '700' },

  footer: { textAlign: 'center', color: Colors.textMuted, fontSize: 11, marginVertical: Spacing.lg },
});
