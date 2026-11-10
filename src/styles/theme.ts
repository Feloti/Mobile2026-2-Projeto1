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
    h1: { fontSize: 32, fontWeight: '600', color: colors.textPrimary },
    h2: { fontSize: 24, fontWeight: '600', color: colors.textPrimary },
    h3: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
    body: { fontSize: 16, fontWeight: '400', color: colors.textPrimary },
    bodyStrong: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4, color: colors.textPrimary },
    mono: { fontFamily: 'monospace', fontWeight: '500', color: colors.textPrimary },
};
export const cardShadow: ViewStyle = {
    boxShadow: `4px 4px 0px 0px ${colors.border}`,
};
