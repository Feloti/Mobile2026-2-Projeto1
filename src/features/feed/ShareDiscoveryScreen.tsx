import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCollection } from '../../hooks/useCollection';
import { getSpeciesById } from '../../services/speciesService';
import { REGIONS, type RegionId } from '../../services/regionsService';
import type { RootStackParamList } from '../../navigation/types';
import RegionPicker from '../../components/RegionPicker';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';

export default function ShareDiscoveryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ShareDiscovery'>>();
  const { speciesId, photoUri } = route.params;
  const { addFeedPost } = useCollection();

  const species = getSpeciesById(speciesId);
  const [caption, setCaption] = useState('');
  const [region, setRegion] = useState<RegionId>('minha-regiao');
  const [shareLocation, setShareLocation] = useState(true);

  if (!species) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.emptyText}>Nenhuma espécie selecionada.</Text>
      </SafeAreaView>
    );
  }

  const handlePublish = () => {
    addFeedPost({
      userId: 'voce',
      speciesId: species.id,
      regionId: shareLocation ? region : 'outra-regiao',
      caption: caption.trim() || `Lorem Ipsum Lorem Ipsum ${species.commonName.toLowerCase()}.`,
    });

  Alert.alert('Descoberta compartilhada!', 'Sua publicação já está disponível no feed.', [
    {
      text: 'Ver no feed',
      onPress: () => navigation.navigate('Tabs', { screen: 'Feed' }),
    },
  ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.previewRow}>
          <View style={styles.photoWrap}>
            <Image resizeMode="cover" source={{ uri: photoUri || species.imageUrl }} style={styles.photo} />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.speciesName}>{species.commonName}</Text>
            <Text style={styles.scientificName}>{species.scientificName}</Text>
          </View>
        </View>

        <Text style={styles.label}>CONTE SOBRE A DESCOBERTA</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Lorem Ipsum Lorem Ipsum Lorem Ipsum..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        <Text style={styles.label}>REGIÃO A EXIBIR</Text>
        <RegionPicker
          regions={REGIONS.filter((r) => r.id !== 'brasil')}
          selectedId={region}
          onSelect={setRegion}
        />

        <Pressable style={styles.toggleRow} onPress={() => setShareLocation((prev) => !prev)}>
          <View style={[styles.toggleTrack, shareLocation && styles.toggleTrackOn]}>
            <View style={[styles.toggleThumb, shareLocation && styles.toggleThumbOn]} />
          </View>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Compartilhar localização</Text>
            <Text style={styles.toggleSubtitle}>
              {shareLocation
                ? 'A região selecionada será exibida.'
                : 'Publicação sem região.'}
            </Text>
          </View>
        </Pressable>

        <PrimaryButton
          label="Publicar descoberta"
          icon="paper-plane"
          onPress={handlePublish}
          style={styles.publishButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  emptyText: { ...type.body, padding: spacing.lg },
  previewRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.xl, ...cardShadow,
  },
  photoWrap: {
    width: 64, height: 64, borderRadius: radius.sm, borderWidth: 3, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginRight: spacing.md,
  },
  photo: { width: '100%', height: '100%' },
  previewInfo: { flex: 1 },
  speciesName: { ...type.h2 },
  scientificName: { ...type.mono, marginTop: 4 },
  label: { ...type.mono, fontSize: 14, marginBottom: spacing.sm, marginTop: spacing.lg },
  textInput: {
    backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, minHeight: 120, textAlignVertical: 'top',
    ...type.body, marginBottom: spacing.xl, ...cardShadow,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.lg, marginBottom: spacing.xl, ...cardShadow,
  },
  toggleTrack: {
    width: 50, height: 30, borderRadius: radius.pill, borderWidth: 3, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt, padding: 2, marginRight: spacing.md,
  },
  toggleTrackOn: { backgroundColor: colors.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: colors.textPrimary, borderWidth: 2, borderColor: colors.border },
  toggleThumbOn: { marginLeft: 20 },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { ...type.bodyStrong },
  toggleSubtitle: { ...type.mono, fontSize: 10, marginTop: 4 },
  publishButton: { marginBottom: spacing.xl },
});
