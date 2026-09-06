import { Platform } from 'react-native';

const dark = {
  primary: '#1E6FD9',
  primaryDark: '#1458B0',
  primaryLight: '#4A90E2',
  secondary: '#00C896',
  accent: '#FF6B35',
  warning: '#F5A623',
  error: '#E53E3E',
  success: '#38A169',

  bg: '#0A0F1E',
  bgCard: '#111827',
  bgCardHover: '#1A2236',
  bgModal: '#1A2236',
  bgInput: '#1F2937',

  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  border: '#1F2937',
  borderLight: '#374151',

  slotAvailable: '#1A3A2A',
  slotAvailableBorder: '#38A169',
  slotBooked: '#3A1A1A',
  slotBookedBorder: '#E53E3E',
  slotMine: '#1A2E4A',
  slotMineBorder: '#1E6FD9',
  slotPast: '#111827',
  slotPastBorder: '#1F2937',

  statusAvailable: '#38A169',
  statusOccupied: '#E53E3E',
  statusMaintenance: '#F5A623',

  tabActive: '#1E6FD9',
  tabInactive: '#6B7280',
  tabBar: '#111827',
};

const light = {
  primary: '#1E6FD9',
  primaryDark: '#1458B0',
  primaryLight: '#4A90E2',
  secondary: '#00C896',
  accent: '#FF6B35',
  warning: '#F5A623',
  error: '#E53E3E',
  success: '#38A169',

  bg: '#FFFFFF',
  bgCard: '#F8F9FA',
  bgCardHover: '#F0F2F5',
  bgModal: '#FFFFFF',
  bgInput: '#F3F4F6',

  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  borderLight: '#D1D5DB',

  slotAvailable: '#DCFCE7',
  slotAvailableBorder: '#38A169',
  slotBooked: '#FEE2E2',
  slotBookedBorder: '#E53E3E',
  slotMine: '#DBEAFE',
  slotMineBorder: '#1E6FD9',
  slotPast: '#F3F4F6',
  slotPastBorder: '#E5E7EB',

  statusAvailable: '#38A169',
  statusOccupied: '#E53E3E',
  statusMaintenance: '#F5A623',

  tabActive: '#1E6FD9',
  tabInactive: '#9CA3AF',
  tabBar: '#FFFFFF',
};

export const Colors = Platform.OS === 'web' ? light : dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
