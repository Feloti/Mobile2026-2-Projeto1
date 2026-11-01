import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../styles/colors';
import { radius, spacing, type } from '../../styles/theme';

export default function CameraScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Registrar um inseto</Text>
        <Text style={styles.subtitle}>Interface de câmera</Text>

        <View style={styles.previewBox}>
          <Ionicons name="camera-outline" size={40} color={colors.textPrimary} style={{ marginBottom: spacing.sm }} />
          <Text style={styles.previewPlaceholder}>Nenhuma foto</Text>
        </View>
        {/* Os botões de foto e galeria ainda não têm ação. */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Tirar foto"
            icon="camera"
            variant="primary"
            onPress={() => {}}
            style={styles.halfButton}
          />
          <View style={{ width: spacing.sm }} />
          <PrimaryButton
            label="Galeria"
            icon="images"
            variant="outline"
            onPress={() => {}}
            style={styles.halfButton}
          />
        </View>

        <PrimaryButton
          label="Continuar"
          icon="arrow-forward"
          variant="accent"
          style={styles.identifyButton}
          onPress={() => navigation.replace('IdentificationResult', { photoUri: undefined })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  title: { ...type.h1 },
  subtitle: { ...type.body, marginTop: 8, marginBottom: spacing.xl },
  previewBox: {
    flex: 1, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 4, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl, overflow: 'hidden',
  },
  previewPlaceholder: { ...type.mono, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', marginBottom: spacing.sm },
  halfButton: { flex: 1 },
  identifyButton: { marginTop: spacing.sm },
});
