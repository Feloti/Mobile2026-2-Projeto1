import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { usePreferences } from '../../hooks/usePreferences';
import { INSECT_PLACEHOLDER } from '../../services/speciesService';
import type { RegionId } from '../../services/regionsService';
import type { RootStackParamList } from '../../navigation/types';
import { regionIdForState } from '../../utils/brazilStates';
import RegionSelect from '../../components/RegionSelect';
import PrimaryButton from '../../components/PrimaryButton';
import ToggleRow from '../../components/ToggleRow';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
export default function ShareDiscoveryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ShareDiscovery'>>();
    const { insect, speciesId, place } = route.params;
    const { addFeedPost } = useCollection();
    const { preferences, setPreference } = usePreferences();
    const { detectedRegionId } = useLocation();
    const [caption, setCaption] = useState('');
    const [pickedRegion, setPickedRegion] = useState<RegionId | null>(null);
    const placeRegion = place ? regionIdForState(place.stateCode) : null;
    const region: RegionId | null =
        pickedRegion ?? placeRegion ?? preferences.shareRegion ?? detectedRegionId;
    const shareLocation = preferences.shareLocation;
    if (!insect) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.emptyText}>Nenhuma espécie selecionada.</Text>
            </SafeAreaView>
        );
    }
    const handleSelectRegion = (id: RegionId) => {
        setPickedRegion(id);
        setPreference('shareRegion', id);
    };
    const toggleSubtitle = !shareLocation
        ? 'Publicação sem região e sem local.'
        : place?.placeName
          ? `Será exibido: ${place.placeName}.`
          : region
            ? 'A região selecionada será exibida.'
            : 'Escolha o estado acima para exibi-lo na publicação.';
    const handlePublish = () => {
        addFeedPost({
            speciesId,
            insect,
            regionId: shareLocation && region ? region : 'brasil',
            placeName: shareLocation ? (place?.placeName ?? undefined) : undefined,
            caption: caption.trim(),
        });
        Alert.alert('Descoberta compartilhada', 'Sua publicação já está disponível no feed.', [
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
                        <Image
                            resizeMode="cover"
                            source={{ uri: insect.photoUri ?? INSECT_PLACEHOLDER }}
                            style={styles.photo}
                        />
                    </View>
                    <View style={styles.previewInfo}>
                        <Text style={styles.speciesName}>{insect.commonName}</Text>
                        {insect.scientificName ? (
                            <Text style={styles.scientificName}>{insect.scientificName}</Text>
                        ) : null}
                    </View>
                </View>
                <Text style={styles.label}>Conte sobre a descoberta</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Como foi essa descoberta?"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                />
                <Text style={styles.label}>Região a exibir</Text>
                <RegionSelect
                    title="Região da publicação"
                    value={region}
                    onChange={handleSelectRegion}
                    placeholder="Escolher estado"
                />
                <ToggleRow
                    title="Compartilhar localização"
                    subtitle={toggleSubtitle}
                    value={shareLocation}
                    onToggle={() => setPreference('shareLocation', !shareLocation)}
                    style={styles.toggle}
                />
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.xl,
        ...cardShadow,
    },
    photoWrap: {
        width: 64,
        height: 64,
        borderRadius: radius.sm,
        borderWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    photo: { width: '100%', height: '100%' },
    previewInfo: { flex: 1 },
    speciesName: { ...type.h2 },
    scientificName: { ...type.mono, marginTop: 4 },
    label: { ...type.mono, fontSize: 14, marginBottom: spacing.sm, marginTop: spacing.lg },
    textInput: {
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        minHeight: 120,
        textAlignVertical: 'top',
        ...type.body,
        marginBottom: spacing.xl,
        ...cardShadow,
    },
    toggle: { marginTop: spacing.lg, marginBottom: spacing.xl },
    publishButton: { marginBottom: spacing.xl },
});
