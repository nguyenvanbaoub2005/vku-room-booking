import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { Colors } from '../constants/Colors';
import { SafariInstallBanner } from '../components/SafariInstallBanner';

export default function RootLayout() {
  const { loadFromStorage, isLoggedIn, isLoading } = useAuthStore();
  const { loadFromStorage: loadBookings } = useBookingStore();

  useEffect(() => {
    loadFromStorage();
    loadBookings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style={Platform.OS === 'web' ? 'dark' : 'light'} backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="room/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Chi tiết phòng',
            headerStyle: { backgroundColor: Colors.bgCard },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            presentation: 'card',
          }}
        />
      </Stack>
      {/* Hiển thị hướng dẫn cài PWA chỉ khi dùng iOS Safari */}
      <SafariInstallBanner />
    </GestureHandlerRootView>
  );
}
