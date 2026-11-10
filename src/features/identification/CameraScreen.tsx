import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import PrimaryButton from '../../components/PrimaryButton';
import {
    chooseFromGallery,
    getImageSize,
    prepareImage,
    takePhoto,
    type PickOutcome,
    type PreparedImage,
} from '../../services/imageService';
import { colors } from '../../styles/colors';
import { radius, spacing, type } from '../../styles/theme';

type Step = 'idle' | 'opening' | 'preparing';

function formatSize(bytes: number): string {
    return bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(bytes / 1024)} KB`;
}

function showPermissionDenied(canAskAgain: boolean) {
    Alert.alert(
        'Permissão da câmera necessária',
        canAskAgain
            ? 'Para fotografar um inseto, permita o acesso à câmera. Você também pode escolher uma imagem da galeria.'
            : 'O acesso à câmera está bloqueado. Ative a permissão nas configurações do aparelho ou escolha uma imagem da galeria.',
        canAskAgain
            ? [{ text: 'OK' }]
            : [
                  { text: 'Agora não', style: 'cancel' },
                  { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
              ],
    );
}

export default function CameraScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [step, setStep] = useState<Step>('idle');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [prepared, setPrepared] = useState<PreparedImage | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const busy = step !== 'idle';

    const handleOutcome = async (outcome: PickOutcome) => {
        if (outcome.status === 'canceled') return;
        if (outcome.status === 'denied') return showPermissionDenied(outcome.canAskAgain);
        if (outcome.status === 'error')
            return Alert.alert('Não foi possível continuar', outcome.message);

        setPreviewUri(outcome.image.uri);
        setPrepared(null);
        setInfo(null);
        setStep('preparing');
        try {
            const result = await prepareImage(outcome.image);
            setPrepared(result);
            setPreviewUri(result.uri);
            setInfo(
                `${result.width} × ${result.height} px · ${formatSize(getImageSize(result.uri))} (otimizada para armazenamento)`,
            );
        } catch (error) {
            console.warn('[Câmera] Falha ao preparar a imagem:', error);
            setPreviewUri(null);
            Alert.alert('Não foi possível preparar a imagem', 'Tente novamente com outra foto.');
        } finally {
            setStep('idle');
        }
    };

    const pickImage = async (source: () => Promise<PickOutcome>) => {
        setStep('opening');
        const outcome = await source();
        setStep('idle');
        await handleOutcome(outcome);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.content}>
                <Text style={styles.title}>Registrar um inseto</Text>
                <Text style={styles.subtitle}>Tire uma foto ou escolha uma imagem da galeria.</Text>

                <View style={styles.previewBox}>
                    {previewUri ? (
                        <Image
                            resizeMode="cover"
                            source={{ uri: previewUri }}
                            style={styles.previewImage}
                        />
                    ) : (
                        <>
                            <Ionicons
                                name="camera-outline"
                                size={40}
                                color={colors.textPrimary}
                                style={{ marginBottom: spacing.sm }}
                            />
                            <Text style={styles.previewPlaceholder}>Nenhuma foto</Text>
                        </>
                    )}
                    {step === 'preparing' ? (
                        <View style={styles.previewOverlay}>
                            <ActivityIndicator size="large" color={colors.textPrimary} />
                            <Text style={styles.overlayText}>Otimizando imagem...</Text>
                        </View>
                    ) : null}
                </View>
                {info ? <Text style={styles.info}>{info}</Text> : null}

                <View style={styles.buttonRow}>
                    <PrimaryButton
                        label="Tirar foto"
                        icon="camera"
                        variant="primary"
                        disabled={busy}
                        onPress={() => pickImage(takePhoto)}
                        style={styles.halfButton}
                    />
                    <View style={{ width: spacing.sm }} />
                    <PrimaryButton
                        label="Galeria"
                        icon="images"
                        variant="outline"
                        disabled={busy}
                        onPress={() => pickImage(chooseFromGallery)}
                        style={styles.halfButton}
                    />
                </View>

                <PrimaryButton
                    label="Escolher inseto"
                    icon="list"
                    variant="accent"
                    disabled={!prepared || busy}
                    style={styles.identifyButton}
                    onPress={() =>
                        prepared && navigation.replace('ChooseInsect', { photoUri: prepared.uri })
                    }
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
        flex: 1,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 4,
        borderColor: colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    previewImage: { width: '100%', height: '100%' },
    previewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(244, 241, 232, 0.85)',
    },
    overlayText: { ...type.mono, marginTop: spacing.sm },
    previewPlaceholder: { ...type.mono, textAlign: 'center' },
    info: {
        ...type.mono,
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    buttonRow: { flexDirection: 'row', marginBottom: spacing.sm },
    halfButton: { flex: 1 },
    identifyButton: { marginTop: spacing.sm },
});
