import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing, type } from '../styles/theme';
interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}
export default function LoadingState({
    message = 'Carregando...',
    fullScreen = false,
}: LoadingStateProps) {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
    fullScreen: { flex: 1, backgroundColor: colors.background },
    message: { ...type.mono, textAlign: 'center', marginTop: spacing.md },
});
