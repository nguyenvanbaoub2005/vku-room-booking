import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Radius } from '../../constants/Colors';

export default function LoginScreen() {
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!mssv.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập MSSV và mật khẩu.');
      return;
    }
    setLoading(true);
    const ok = await login(mssv.trim(), password);
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập thất bại', 'MSSV hoặc mật khẩu không đúng.\n\nDemo: 21IT001 / 123456');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="school" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>VKU Đặt Phòng</Text>
          <Text style={styles.tagline}>Hệ thống đặt phòng học & Lab</Text>
          <Text style={styles.institution}>Đại học Công nghệ Việt - Hàn</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Dùng tài khoản sinh viên VKU</Text>

          {/* MSSV */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã số sinh viên</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="VD: 21IT001"
                placeholderTextColor={Colors.textMuted}
                value={mssv}
                onChangeText={setMssv}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hint */}
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.hintText}> Demo: <Text style={styles.hintBold}>21IT001</Text> / <Text style={styles.hintBold}>123456</Text></Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Đăng nhập</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Khoa Công nghệ thông tin • VKU 2025
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.md },

  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 96, height: 96, borderRadius: Radius.xl,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.primary + '44',
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  institution: { fontSize: 12, color: Colors.primary, marginTop: 4, fontWeight: '600' },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.lg },

  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  inputIcon: { marginRight: 6 },
  input: { flex: 1, height: 48, color: Colors.textPrimary, fontSize: 15 },
  eyeBtn: { padding: 8 },

  hintBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary + '18',
    borderRadius: Radius.sm, padding: 10, marginBottom: Spacing.md,
  },
  hintText: { fontSize: 13, color: Colors.textSecondary },
  hintBold: { color: Colors.primary, fontWeight: '700' },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    borderRadius: Radius.md, height: 52, marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: Spacing.xl },
});
