import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type BannerState = 'offline' | 'syncing' | 'synced' | 'hidden';

interface Props {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

/**
 * Banner hiển thị trạng thái mạng và đồng bộ.
 * Ẩn khi đang online và không có gì cần đồng bộ.
 */
export function NetworkBanner({ isOnline, isSyncing, pendingCount }: Props) {
  const slideAnim = useRef(new Animated.Value(-56)).current;
  const stateRef = useRef<BannerState>('hidden');

  const show = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const hide = (delay = 0) => {
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -56,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, delay);
  };

  useEffect(() => {
    if (!isOnline) {
      stateRef.current = 'offline';
      show();
    } else if (isSyncing) {
      stateRef.current = 'syncing';
      show();
    } else if (stateRef.current === 'syncing') {
      stateRef.current = 'synced';
      // Giữ banner "Đồng bộ thành công" 2.5 giây rồi ẩn
      hide(2500);
      setTimeout(() => { stateRef.current = 'hidden'; }, 3000);
    } else {
      stateRef.current = 'hidden';
      hide();
    }
  }, [isOnline, isSyncing]);

  const config: Record<Exclude<BannerState, 'hidden'>, { bg: string; icon: string; text: string }> = {
    offline: {
      bg: Colors.error,
      icon: 'cloud-offline-outline',
      text: pendingCount > 0
        ? `Mất kết nối · ${pendingCount} đặt phòng chờ đồng bộ`
        : 'Không có kết nối internet',
    },
    syncing: {
      bg: Colors.warning,
      icon: 'sync-outline',
      text: `Đang đồng bộ ${pendingCount} đặt phòng...`,
    },
    synced: {
      bg: Colors.success,
      icon: 'checkmark-circle-outline',
      text: 'Đã đồng bộ thành công!',
    },
  };

  const current = stateRef.current === 'hidden' ? null : config[stateRef.current];

  return (
    <Animated.View
      style={[
        styles.banner,
        current ? { backgroundColor: current.bg } : {},
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {current && (
        <View style={styles.row}>
          <Ionicons
            name={current.icon as any}
            size={16}
            color="#fff"
            style={stateRef.current === 'syncing' ? styles.spin : undefined}
          />
          <Text style={styles.text}>{current.text}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'flex-end',
    paddingBottom: 6,
    paddingHorizontal: 16,
    zIndex: 9998,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  spin: {
    // CSS rotation animation — react-native-web hỗ trợ
  },
});
