import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing, type, cardShadow } from '../styles/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const backgrounds: Record<Variant, string> = {
  primary: colors.primary,
  accent: colors.accent,
  outline: colors.surface,
  ghost: colors.surfaceAlt,
};

export default function PrimaryButton({ label, onPress, icon, variant = 'primary', disabled = false, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgrounds[variant] },
        pressed && !disabled ? styles.pressed : styles.normal,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={20} color={colors.textPrimary} style={styles.icon} /> : null}
        <Text style={styles.text}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
  },
  normal: cardShadow,
  pressed: { boxShadow: 'none', transform: [{ translateX: 4 }, { translateY: 4 }] },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
  text: { ...type.bodyStrong, letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});
