import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoomStore } from '../../store/roomStore';
import { Room } from '../../types';
import { Colors, Spacing, Radius } from '../../constants/Colors';

const BUILDINGS = ['Tất cả', 'Tòa A', 'Tòa B', 'Tòa C'];
const ROOM_TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'classroom', label: 'Phòng học' },
  { key: 'lab', label: 'Lab' },
  { key: 'seminar', label: 'Seminar' },
];
const STATUS_FILTERS = [
  { key: 'all', label: 'Mọi trạng thái' },
  { key: 'available', label: '🟢 Trống' },
  { key: 'occupied', label: '🔴 Đang dùng' },
];

function SearchRoomCard({ room }: { room: Room }) {
  const statusColor = {
    available: Colors.statusAvailable,
    occupied: Colors.statusOccupied,
    maintenance: Colors.statusMaintenance,
  }[room.status];
  const statusLabel = {
    available: 'Trống', occupied: 'Đang dùng', maintenance: 'Bảo trì',
  }[room.status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/room/${room.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={styles.typeBox}>
          <Ionicons
            name={room.type === 'lab' ? 'desktop' : room.type === 'seminar' ? 'people' : 'school'}
            size={22} color={Colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomSub}>{room.building} • Tầng {room.floor} • {room.capacity} chỗ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
            {room.amenities.slice(0, 3).map((a, i) => (
              <View key={i} style={styles.pill}><Text style={styles.pillText}>{a}</Text></View>
            ))}
          </ScrollView>
        </View>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
        <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { rooms } = useRoomStore();
  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState('Tất cả');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const results = useMemo(() => {
    return rooms.filter((r) => {
      const q = query.toLowerCase();
      const matchQuery = !q || r.name.toLowerCase().includes(q) ||
        r.building.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.amenities.some((a) => a.toLowerCase().includes(q));
      const matchBuilding = building === 'Tất cả' || r.building === building;
      const matchType = type === 'all' || r.type === type;
      const matchStatus = status === 'all' || r.status === status;
      return matchQuery && matchBuilding && matchType && matchStatus;
    });
  }, [rooms, query, building, type, status]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tìm phòng</Text>
        <Text style={styles.subtitle}>{results.length} kết quả</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tên phòng, tòa nhà, tiện nghi..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Tòa nhà</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {BUILDINGS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.chip, building === b && styles.chipActive]}
              onPress={() => setBuilding(b)}
            >
              <Text style={[styles.chipText, building === b && styles.chipTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Loại phòng</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {ROOM_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, type === t.key && styles.chipActive]}
              onPress={() => setType(t.key)}
            >
              <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Trạng thái</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.chip, status === s.key && styles.chipActive]}
              onPress={() => setStatus(s.key)}
            >
              <Text style={[styles.chipText, status === s.key && styles.chipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <SearchRoomCard room={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Không tìm thấy phòng phù hợp</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, marginHorizontal: Spacing.md,
    borderRadius: Radius.md, paddingHorizontal: Spacing.sm, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border, height: 46,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },

  filtersSection: { paddingHorizontal: Spacing.md, marginBottom: 8 },
  filterLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterRow: { marginBottom: 10, flexGrow: 0 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  list: { padding: Spacing.md, paddingTop: 0 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  typeBox: {
    width: 44, height: 44, borderRadius: Radius.sm,
    backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center',
  },
  roomName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  roomSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  pill: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, marginRight: 6,
  },
  pillText: { fontSize: 10, color: Colors.textSecondary },
  statusDot: {
    borderRadius: Radius.sm, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: 'flex-start', marginLeft: 8,
  },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
