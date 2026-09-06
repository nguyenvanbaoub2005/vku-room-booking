import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoomStore } from '../../store/roomStore';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { TIME_SLOTS } from '../../constants/mockData';
import { Colors, Spacing, Radius } from '../../constants/Colors';

function getDateList() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRoomById } = useRoomStore();
  const { getRoomBookingsForDate, createBooking, getUserBookings } = useBookingStore();
  const { user } = useAuthStore();

  const room = getRoomById(id ?? '');
  const dates = getDateList();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [booking, setBooking] = useState(false);

  const bookedSlots = getRoomBookingsForDate(id ?? '', selectedDate);
  const myBookings = getUserBookings(user?.id ?? '');
  const myBookedSlots = myBookings.filter(
    (b) => b.roomId === id && b.date === selectedDate && b.status !== 'cancelled'
  );

  const getSlotState = (slot: { start: string; end: string }) => {
    const now = new Date();
    const [h, m] = slot.start.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h, m, 0, 0);
    if (slotDate < now) return 'past';
    if (myBookedSlots.some((b) => b.startTime === slot.start)) return 'mine';
    if (bookedSlots.some((b) => b.startTime === slot.start)) return 'booked';
    return 'available';
  };

  const toggleSlot = (slotId: string) => {
    const slot = TIME_SLOTS.find((s) => s.id === slotId)!;
    const state = getSlotState(slot);
    if (state === 'past' || state === 'booked') return;
    if (state === 'mine') {
      Alert.alert('Thông báo', 'Bạn đã đặt slot này rồi!');
      return;
    }
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleBook = async () => {
    if (!purpose.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mục đích sử dụng.');
      return;
    }
    if (selectedSlots.length === 0) return;

    setBooking(true);
    try {
      for (const slotId of selectedSlots) {
        const slot = TIME_SLOTS.find((s) => s.id === slotId)!;
        await createBooking({
          userId: user!.id,
          roomId: room!.id,
          roomName: room!.name,
          date: selectedDate,
          startTime: slot.start,
          endTime: slot.end,
          purpose: purpose.trim(),
        });
      }
      setModalVisible(false);
      setSelectedSlots([]);
      setPurpose('');
      Alert.alert(
        '✅ Đặt phòng thành công!',
        `${room?.name}\n📅 ${selectedDate}\n⏰ ${selectedSlots.length} khung giờ\n📋 ${purpose}`,
        [{ text: 'Xem lịch', onPress: () => router.push('/(tabs)/bookings') }, { text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể đặt phòng. Thử lại sau.');
    } finally {
      setBooking(false);
    }
  };

  if (!room) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.notFoundText}>Không tìm thấy phòng</Text>
      </View>
    );
  }

  const typeLabel = { classroom: 'Phòng học', lab: 'Lab', seminar: 'Seminar' }[room.type];
  const statusColor = {
    available: Colors.statusAvailable, occupied: Colors.statusOccupied, maintenance: Colors.statusMaintenance,
  }[room.status];
  const statusLabel = { available: 'Đang trống', occupied: 'Đang sử dụng', maintenance: 'Bảo trì' }[room.status];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Room hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={room.type === 'lab' ? 'desktop' : room.type === 'seminar' ? 'people' : 'school'}
              size={56} color={Colors.primary}
            />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{room.name}</Text>
            <Text style={styles.heroBuildingText}>{room.building} • Tầng {room.floor}</Text>
            <View style={styles.heroMeta}>
              <View style={[styles.statusChip, { backgroundColor: statusColor + '22' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.metaText}>{room.capacity} chỗ</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="bookmark-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.metaText}>{typeLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện nghi ({room.amenities.length})</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dates.map((d) => {
              const str = d.toISOString().split('T')[0];
              const isSelected = str === selectedDate;
              const isToday = str === todayStr;
              return (
                <TouchableOpacity
                  key={str}
                  style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                  onPress={() => { setSelectedDate(str); setSelectedSlots([]); }}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.dateSelectedText]}>
                    {DAYS_VI[d.getDay()]}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateSelectedText]}>
                    {d.getDate()}
                  </Text>
                  {isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: '#fff' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <View style={styles.slotHeader}>
            <Text style={styles.sectionTitle}>Khung giờ — {selectedDate}</Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: Colors.slotAvailableBorder, label: 'Trống' },
              { color: Colors.slotMineBorder, label: 'Của bạn' },
              { color: Colors.slotBookedBorder, label: 'Đã đặt' },
              { color: Colors.slotPastBorder, label: 'Đã qua' },
            ].map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const state = getSlotState(slot);
              const isSelected = selectedSlots.includes(slot.id);
              const bgMap = {
                available: isSelected ? Colors.primary : Colors.slotAvailable,
                mine: Colors.slotMine,
                booked: Colors.slotBooked,
                past: Colors.slotPast,
              };
              const borderMap = {
                available: isSelected ? Colors.primary : Colors.slotAvailableBorder,
                mine: Colors.slotMineBorder,
                booked: Colors.slotBookedBorder,
                past: Colors.slotPastBorder,
              };
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotItem,
                    { backgroundColor: bgMap[state], borderColor: borderMap[state] },
                    (state === 'past' || state === 'booked') && styles.slotDisabled,
                  ]}
                  onPress={() => toggleSlot(slot.id)}
                  disabled={state === 'past' || state === 'booked'}
                >
                  <Text style={[
                    styles.slotTime,
                    state === 'available' && !isSelected && { color: Colors.slotAvailableBorder },
                    isSelected && { color: '#fff', fontWeight: '800' },
                    state === 'mine' && { color: Colors.slotMineBorder },
                    state === 'booked' && { color: Colors.slotBookedBorder },
                    state === 'past' && { color: Colors.textMuted },
                  ]}>
                    {slot.start}
                  </Text>
                  {state === 'mine' && <Ionicons name="person" size={10} color={Colors.slotMineBorder} />}
                  {state === 'booked' && <Ionicons name="lock-closed" size={10} color={Colors.slotBookedBorder} />}
                  {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book button */}
      {room.status === 'available' && selectedSlots.length > 0 && (
        <View style={styles.bookBar}>
          <View>
            <Text style={styles.bookBarCount}>{selectedSlots.length} khung giờ đã chọn</Text>
            <Text style={styles.bookBarDate}>{selectedDate}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="calendar-sharp" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>Đặt phòng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận đặt phòng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalRoomName}>{room.name}</Text>
              <Text style={styles.modalDateInfo}>
                📅 {selectedDate} • {selectedSlots.length} khung giờ
              </Text>
              <Text style={styles.modalSlotsText}>
                {selectedSlots
                  .map((id) => TIME_SLOTS.find((s) => s.id === id)?.label)
                  .join(', ')}
              </Text>
            </View>

            <View style={styles.purposeGroup}>
              <Text style={styles.purposeLabel}>Mục đích sử dụng *</Text>
              <TextInput
                style={styles.purposeInput}
                placeholder="VD: Học nhóm môn TTNT, Họp đồ án..."
                placeholderTextColor={Colors.textMuted}
                value={purpose}
                onChangeText={setPurpose}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, booking && { opacity: 0.6 }]}
              onPress={handleBook}
              disabled={booking}
            >
              {booking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmBtnText}>Xác nhận đặt phòng</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.bg },
  notFoundText: { fontSize: 16, color: Colors.textMuted },

  hero: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  heroIcon: {
    width: 88, height: 88, borderRadius: Radius.lg,
    backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  heroBuildingText: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgInput, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  metaText: { fontSize: 11, color: Colors.textMuted },

  section: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  amenityText: { fontSize: 13, color: Colors.textSecondary },

  dateItem: {
    alignItems: 'center', padding: 10, borderRadius: Radius.md, marginRight: 8,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, minWidth: 52,
  },
  dateItemSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateDayName: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  dateNum: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  dateSelectedText: { color: '#fff' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 3 },

  slotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.textMuted },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: Radius.sm, borderWidth: 1.5,
    minWidth: '30%',
  },
  slotDisabled: { opacity: 0.6 },
  slotTime: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  bookBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingBottom: 28,
  },
  bookBarCount: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  bookBarDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.bgModal, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalInfo: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  modalRoomName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  modalDateInfo: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  modalSlotsText: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  purposeGroup: { marginBottom: Spacing.md },
  purposeLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  purposeInput: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.sm, color: Colors.textPrimary,
    fontSize: 14, minHeight: 80, textAlignVertical: 'top',
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16,
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
