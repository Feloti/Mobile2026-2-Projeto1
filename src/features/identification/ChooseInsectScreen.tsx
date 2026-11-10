import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useCollection } from '../../hooks/useCollection';
import { useDiscoveryLocation } from '../../hooks/useDiscoveryLocation';
import { SPECIES } from '../../services/speciesService';
import type { RootStackParamList } from '../../navigation/types';
import { createId } from '../../utils/createId';
import { normalizeText } from '../../utils/matchSpecies';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import LocationCard from '../../components/LocationCard';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';

const TYPED = '__typed__';
const MIN_TYPED_LENGTH = 2;

interface ChoiceRowProps {
    title: string;
    subtitle: string;
    imageUri?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    selected: boolean;
    onPress: () => void;
}

function ChoiceRow({
    title,
    subtitle,
    imageUri,
    icon = 'create-outline',
    selected,
    onPress,
}: ChoiceRowProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                pressed ? styles.rowPressed : styles.rowNormal,
            ]}
        >
            <View style={styles.rowThumb}>
                {imageUri ? (
                    <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.rowImage} />
                ) : (
                    <Ionicons name={icon} size={24} color={colors.textPrimary} />
                )}
            </View>
            <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            {selected ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.textPrimary} />
            ) : null}
        </Pressable>
    );
}

export default function ChooseInsectScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChooseInsect'>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ChooseInsect'>>();
    const { photoUri, pickedPlace } = route.params;
    const { addDiscoveryWithPhoto } = useCollection();

    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [discoveryId] = useState(createId);
    const {
        state: locationState,
        place: locationPlace,
        setEnabled,
        refresh,
        setPlace,
    } = useDiscoveryLocation();

    useEffect(() => {
        if (!pickedPlace) return;
        setPlace(pickedPlace);
        navigation.setParams({ pickedPlace: undefined });
    }, [pickedPlace, setPlace, navigation]);

    const typed = query.trim();
    const search = normalizeText(typed);
    const matches = SPECIES.filter(
        (species) =>
            !search ||
            normalizeText(
                `${species.commonName} ${species.scientificName} ${species.family}`,
            ).includes(search),
    );
    const canUseTyped =
        typed.length >= MIN_TYPED_LENGTH &&
        !SPECIES.some((s) => normalizeText(s.commonName) === search);

    const chosenSpecies = matches.find((species) => species.id === selectedId);
    const usingTyped = selectedId === TYPED && canUseTyped;
    const canConfirm = Boolean(chosenSpecies) || usingTyped;

    const handleConfirm = async () => {
        if (!canConfirm || saving || saved) return;
        setSaving(true);
        try {
            const fields = chosenSpecies
                ? {
                      commonName: chosenSpecies.commonName,
                      scientificName: chosenSpecies.scientificName,
                      taxonomicGroup: chosenSpecies.family,
                      description: chosenSpecies.description,
                      speciesId: chosenSpecies.id,
                  }
                : {
                      commonName: typed,
                      scientificName: null,
                      taxonomicGroup: null,
                      description: '',
                      speciesId: null,
                  };

            await addDiscoveryWithPhoto(
                {
                    id: discoveryId,
                    taxonomicLevel: null,
                    confidence: null,
                    location: locationPlace,
                    ...fields,
                },
                photoUri,
            );
            setSaved(true);
            Alert.alert(
                'Adicionado à coleção',
                `"${fields.commonName}" foi salvo com a foto${locationPlace ? ' e o local' : ''}.`,
                [
                    {
                        text: 'Ver coleção',
                        onPress: () => navigation.navigate('Tabs', { screen: 'Colecao' }),
                    },
                ],
                { cancelable: false },
            );
        } catch (error) {
            console.warn('[Escolher inseto] Falha ao salvar na coleção:', error);
            Alert.alert(
                'Não foi possível salvar',
                'Ocorreu um erro ao adicionar o inseto à coleção. Tente novamente.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <Image resizeMode="cover" source={{ uri: photoUri }} style={styles.photo} />
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Qual é o inseto?</Text>
                        <Text style={styles.subtitle}>
                            Escolha na lista ou digite o nome. Ele será salvo com esta foto.
                        </Text>
                    </View>
                </View>

                <TextInput
                    style={styles.search}
                    placeholder="Buscar ou digitar o nome do inseto"
                    placeholderTextColor={colors.textMuted}
                    value={query}
                    onChangeText={setQuery}
                    maxLength={60}
                    autoCorrect={false}
                />

                <FlatList
                    data={matches}
                    keyExtractor={(species) => species.id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        canUseTyped ? (
                            <ChoiceRow
                                title={`Usar "${typed}" como nome`}
                                subtitle="Outro inseto (fora da lista)"
                                selected={usingTyped}
                                onPress={() => setSelectedId(TYPED)}
                            />
                        ) : undefined
                    }
                    ListEmptyComponent={
                        canUseTyped ? undefined : (
                            <EmptyState
                                icon="search"
                                title="Nenhum inseto encontrado"
                                message="Continue digitando o nome do inseto."
                            />
                        )
                    }
                    renderItem={({ item }) => (
                        <ChoiceRow
                            title={item.commonName}
                            subtitle={item.scientificName}
                            imageUri={item.imageUrl}
                            selected={item.id === selectedId}
                            onPress={() => setSelectedId(item.id)}
                        />
                    )}
                />

                <View style={styles.footer}>
                    <LocationCard
                        state={locationState}
                        onToggle={setEnabled}
                        onRefresh={refresh}
                        onAdjust={() =>
                            navigation.navigate('PickLocation', {
                                initial: locationPlace,
                                returnTo: 'ChooseInsect',
                            })
                        }
                        locked={saved || saving}
                    />
                    <PrimaryButton
                        label={
                            saved
                                ? 'Adicionado à coleção'
                                : saving
                                  ? 'Salvando...'
                                  : locationState.status === 'loading'
                                    ? 'Obtendo o local...'
                                    : 'Adicionar à coleção'
                        }
                        icon={saved ? 'checkmark-circle' : 'add-circle'}
                        onPress={handleConfirm}
                        disabled={
                            !canConfirm || saving || saved || locationState.status === 'loading'
                        }
                        style={styles.confirmButton}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.md,
    },
    photo: {
        width: 72,
        height: 72,
        borderRadius: radius.md,
        borderWidth: 3,
        borderColor: colors.border,
        marginRight: spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...type.h2 },
    subtitle: { ...type.body, marginTop: 4 },
    search: {
        ...type.body,
        marginHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    listContent: { padding: spacing.lg, paddingBottom: spacing.md },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    rowSelected: { backgroundColor: colors.primaryLight },
    rowNormal: cardShadow,
    rowPressed: { boxShadow: 'none', transform: [{ translateX: 4 }, { translateY: 4 }] },
    rowThumb: {
        width: 48,
        height: 48,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    rowImage: { width: '100%', height: '100%' },
    rowText: { flex: 1, marginRight: spacing.sm },
    rowTitle: { ...type.bodyStrong },
    rowSubtitle: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    footer: { padding: spacing.lg, paddingTop: spacing.sm },
    confirmButton: { marginTop: spacing.md },
});
