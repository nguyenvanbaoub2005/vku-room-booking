import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Modal, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Colors, Spacing, Radius } from '../../constants/Colors';

/* ────────────────────────────────────────
   Install Guide Modal
──────────────────────────────────────── */
function InstallStep({ num, icon, text }: { num: string; icon: string; text: string }) {
  return (
    <View style={guide.step}>
      <View style={guide.stepNum}>
        <Text style={guide.stepNumText}>{num}</Text>
      </View>
      <Ionicons name={icon as any} size={18} color={Colors.primary} style={{ marginTop: 1 }} />
      <Text style={guide.stepText}>{text}</Text>
    </View>
  );
}

function InstallGuideModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={guide.root}>
        <View style={guide.header}>
          <Text style={guide.title}>📲 Cài đặt ứng dụng</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={guide.body} showsVerticalScrollIndicator={false}>
          <Text style={guide.subtitle}>
            Cài VKU Room như ứng dụng thật — không cần App Store, hoàn toàn miễn phí!
          </Text>

          {/* iOS Safari */}
          <View style={guide.section}>
            <View style={guide.sectionHeader}>
              <View style={[guide.iconBox, { backgroundColor: '#007AFF22' }]}>
                <Ionicons name="logo-apple" size={22} color="#007AFF" />
              </View>
              <Text style={guide.sectionTitle}>iPhone / iPad (Safari)</Text>
            </View>
            <InstallStep num="1" icon="share-outline" text='Mở Safari → nhấn nút "Chia sẻ" ↑ ở thanh dưới cùng' />
            <InstallStep num="2" icon="add-circle-outline" text='Cuộn xuống → chọn "Thêm vào MH chính"' />
            <InstallStep num="3" icon="checkmark-circle-outline" text='Nhấn "Thêm" ở góc phải — mở app toàn màn hình!' />
          </View>

          {/* Android Chrome */}
          <View style={guide.section}>
            <View style={guide.sectionHeader}>
              <View style={[guide.iconBox, { backgroundColor: '#34A85322' }]}>
                <Ionicons name="logo-android" size={22} color="#34A853" />
              </View>
              <Text style={guide.sectionTitle}>Android (Chrome)</Text>
            </View>
            <InstallStep num="1" icon="ellipsis-vertical-outline" text='Mở Chrome → nhấn menu "⋮" góc phải trên' />
            <InstallStep num="2" icon="phone-portrait-outline" text='Chọn "Thêm vào màn hình chính"' />
            <InstallStep num="3" icon="checkmark-circle-outline" text='Nhấn "Thêm" — Chrome cài app tự động.' />
          </View>

          {/* Desktop */}
          <View style={guide.section}>
            <View style={guide.sectionHeader}>
              <View style={[guide.iconBox, { backgroundColor: Colors.primary + '22' }]}>
                <Ionicons name="desktop-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={guide.sectionTitle}>Máy tính (Chrome / Edge)</Text>
            </View>
            <InstallStep num="1" icon="globe-outline" text="Mở Chrome/Edge, truy cập link demo" />
            <InstallStep num="2" icon="download-outline" text='Nhấn biểu tượng "⊕ Cài đặt" trên thanh địa chỉ URL' />
            <InstallStep num="3" icon="checkmark-circle-outline" text='Nhấn "Cài đặt" → chạy như app desktop.' />
          </View>

          <View style={guide.linkBox}>
            <Ionicons name="link-outline" size={16} color={Colors.primary} />
            <Text style={guide.linkText}>vku-room-booking.vercel.app</Text>
          </View>

          <Text style={guide.note}>
            Sau khi cài đặt, app chạy toàn màn hình, hỗ trợ offline và nhanh như app native.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const guide = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  body: { padding: Spacing.md, paddingBottom: 40 },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, lineHeight: 20,
    marginBottom: Spacing.lg, textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBox: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  stepText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  linkBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '18', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md, justifyContent: 'center',
  },
  linkText: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  note: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

/* ────────────────────────────────────────
   StatCard
──────────────────────────────────────── */
function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ────────────────────────────────────────
   Profile Screen
──────────────────────────────────────── */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { getUserBookings } = useBookingStore();
  const [showInstall, setShowInstall] = useState(false);

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
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
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

        {/* Cài đặt ứng dụng → mở hướng dẫn PWA */}
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowInstall(true)}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.secondary + '22' }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.menuLabel}>Cài đặt ứng dụng (PWA)</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>VKU Đặt Phòng • Khoa CNTT • v1.0.0</Text>

      {/* Install Guide Modal */}
      <InstallGuideModal visible={showInstall} onClose={() => setShowInstall(false)} />
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

  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: Spacing.lg },
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
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
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
