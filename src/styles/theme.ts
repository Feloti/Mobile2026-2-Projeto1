import type { TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 4,
  md: 8,
  pill: 999,
};

export const type: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  h3: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  bodyStrong: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.textPrimary },
  mono: { fontFamily: 'monospace', fontWeight: '700', color: colors.textPrimary },
};

export const cardShadow: ViewStyle = {
  boxShadow: `4px 4px 0px 0px ${colors.border}`,
};
