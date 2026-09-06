import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { Room } from '../../types';
import { Colors, Spacing, Radius } from '../../constants/Colors';

const FILTER_TYPES = ['Tất cả', 'Phòng học', 'Lab', 'Seminar'];

function StatusBadge({ status }: { status: Room['status'] }) {
  const map = {
    available: { label: 'Trống', color: Colors.statusAvailable, bg: Colors.statusAvailable + '22' },
    occupied: { label: 'Đang dùng', color: Colors.statusOccupied, bg: Colors.statusOccupied + '22' },
    maintenance: { label: 'Bảo trì', color: Colors.statusMaintenance, bg: Colors.statusMaintenance + '22' },
  };
  const { label, color, bg } = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function RoomCard({ room }: { room: Room }) {
  const typeIcon: Record<string, string> = {
    classroom: 'school-outline',
    lab: 'desktop-outline',
    seminar: 'people-outline',
  };
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/room/${room.id}`)}
      activeOpacity={0.85}
    >
      {/* Icon header */}
      <View style={styles.cardHeader}>
        <View style={styles.roomIconBox}>
          <Ionicons name={typeIcon[room.type] as any} size={28} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomSub}>{room.building} • Tầng {room.floor}</Text>
        </View>
        <StatusBadge status={room.status} />
      </View>

      {/* Info row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>{room.capacity} chỗ</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>{room.amenities.length} tiện nghi</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons
            name={room.type === 'lab' ? 'desktop' : room.type === 'seminar' ? 'chatbubbles' : 'book'}
            size={14} color={Colors.textMuted}
          />
          <Text style={styles.infoText}>
            {room.type === 'lab' ? 'Lab' : room.type === 'seminar' ? 'Seminar' : 'Lớp học'}
          </Text>
        </View>
      </View>

      {/* Amenities pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {room.amenities.slice(0, 4).map((a, i) => (
          <View key={i} style={styles.amenityPill}>
            <Text style={styles.amenityText}>{a}</Text>
          </View>
        ))}
      </ScrollView>

      {room.status === 'available' && (
        <View style={styles.bookBtnRow}>
          <Ionicons name="arrow-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.bookBtnText}>Đặt phòng ngay</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { rooms, isRefreshing, refresh, lastUpdated } = useRoomStore();
  const [filter, setFilter] = useState('Tất cả');

  useEffect(() => { refresh(); }, []);

  const filtered = rooms.filter((r) => {
    if (filter === 'Phòng học') return r.type === 'classroom';
    if (filter === 'Lab') return r.type === 'lab';
    if (filter === 'Seminar') return r.type === 'seminar';
    return true;
  });

  const available = rooms.filter((r) => r.status === 'available').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Chào buổi sáng';
    if (h < 13) return 'Chào buổi trưa';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ').pop()} 👋</Text>
          <Text style={styles.mssv}>{user?.mssv} • {user?.class}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/room/A101')}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Stats banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{rooms.length}</Text>
          <Text style={styles.statLabel}>Tổng phòng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.statusAvailable }]}>{available}</Text>
          <Text style={styles.statLabel}>Đang trống</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: Colors.statusOccupied }]}>{rooms.filter(r => r.status === 'occupied').length}</Text>
          <Text style={styles.statLabel}>Đang dùng</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTER_TYPES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Room list */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RoomCard room={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListFooterComponent={
          lastUpdated ? (
            <Text style={styles.lastUpdated}>
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  mssv: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },

  statsBanner: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  filterScroll: { paddingHorizontal: Spacing.md, marginBottom: 4, flexGrow: 0 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full,
    marginRight: 8, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  list: { padding: Spacing.md, paddingTop: 8 },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  roomIconBox: {
    width: 52, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center',
  },
  roomName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  roomSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  infoRow: { flexDirection: 'row', gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: Colors.textMuted },

  amenityPill: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3, marginRight: 6,
  },
  amenityText: { fontSize: 11, color: Colors.textSecondary },

  bookBtnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  bookBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  lastUpdated: { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 8, marginBottom: 16 },
});
