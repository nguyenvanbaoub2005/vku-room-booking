import { Platform } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  const { isLoggedIn, isLoading } = useAuthStore();

  if (!isLoading && !isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: isWeb ? 56 : 64,
          paddingBottom: isWeb ? 4 : 8,
          paddingTop: isWeb ? 4 : 6,
          elevation: isWeb ? 0 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: isWeb ? 2 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={isWeb ? 22 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={isWeb ? 22 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lịch đặt',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={isWeb ? 22 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={isWeb ? 22 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
