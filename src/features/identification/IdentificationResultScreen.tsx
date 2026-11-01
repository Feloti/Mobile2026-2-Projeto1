import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCollection } from '../../hooks/useCollection';
import { SPECIES, INSECT_PLACEHOLDER } from '../../services/speciesService';
import type { RootStackParamList } from '../../navigation/types';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';

export default function IdentificationResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { collectSpecies } = useCollection();
  const [added, setAdded] = useState(false);
  const mockResult = SPECIES[0];

  const handleAdd = () => {
    collectSpecies(mockResult.id);
    setAdded(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoWrap}>
          <Image resizeMode="cover" source={{ uri: INSECT_PLACEHOLDER }} style={styles.photo} />
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>INSETO ENCONTRADO</Text>
          <Image resizeMode="cover" source={{ uri: mockResult.imageUrl }} style={styles.resultImage} />
          <Text style={styles.resultName}>{mockResult.commonName}</Text>
          <Text style={styles.resultScientific}>{mockResult.scientificName}</Text>

          <Text style={styles.resultDescription}>{mockResult.description}</Text>

          <PrimaryButton
            label={added ? 'Adicionado à coleção' : 'Adicionar à coleção'}
            icon={added ? 'checkmark-circle' : 'add-circle'}
            onPress={handleAdd}
            disabled={added}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Compartilhar"
            icon="share-social"
            variant="outline"
            onPress={() => navigation.navigate('ShareDiscovery', { speciesId: mockResult.id, photoUri: undefined })}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Voltar ao início"
            variant="ghost"
            onPress={() => navigation.navigate('Tabs', { screen: 'Inicio' })}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  photoWrap: {
    borderRadius: radius.md, borderWidth: 4, borderColor: colors.border, overflow: 'hidden',
    marginBottom: spacing.xl, height: 220, ...cardShadow
  },
  photo: { width: '100%', height: '100%' },
  resultCard: {
    backgroundColor: colors.surface, borderWidth: 4, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', ...cardShadow,
  },
  resultLabel: { 
    ...type.mono, backgroundColor: colors.accentLight, paddingVertical: 4, 
    paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 2, 
    borderColor: colors.border, marginBottom: spacing.md 
  },
  resultImage: { 
    width: 100, height: 100, borderRadius: radius.md, borderWidth: 3, 
    borderColor: colors.border, marginBottom: spacing.sm 
  },
  resultName: { ...type.h1, textAlign: 'center' },
  resultScientific: { ...type.mono, marginBottom: spacing.md },
  resultDescription: { ...type.body, textAlign: 'center', marginBottom: spacing.xl },
  actionButton: { width: '100%', marginTop: spacing.sm },
});
