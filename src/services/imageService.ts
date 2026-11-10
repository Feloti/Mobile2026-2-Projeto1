import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';

export interface PickedImage {
    uri: string;
    width: number;
    height: number;
}

export type PreparedImage = PickedImage;

export type PickOutcome =
    | { status: 'picked'; image: PickedImage }
    | { status: 'canceled' }
    | { status: 'denied'; canAskAgain: boolean }
    | { status: 'error'; message: string };

const MAX_SIDE = 1024;
const JPEG_QUALITY = 0.7;

function toOutcome(result: ImagePicker.ImagePickerResult): PickOutcome {
    if (result.canceled || result.assets.length === 0) return { status: 'canceled' };
    const { uri, width, height } = result.assets[0];
    return { status: 'picked', image: { uri, width, height } };
}

export async function takePhoto(): Promise<PickOutcome> {
    try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            return { status: 'denied', canAskAgain: permission.canAskAgain };
        }
        return toOutcome(
            await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }),
        );
    } catch (error) {
        console.warn('[imageService] Falha ao abrir a câmera:', error);
        return {
            status: 'error',
            message:
                'Não foi possível abrir a câmera neste aparelho. Tente escolher uma imagem da galeria.',
        };
    }
}

export async function chooseFromGallery(): Promise<PickOutcome> {
    try {
        return toOutcome(
            await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 }),
        );
    } catch (error) {
        console.warn('[imageService] Falha ao abrir a galeria:', error);
        return { status: 'error', message: 'Não foi possível abrir a galeria de fotos.' };
    }
}

export async function prepareImage(image: PickedImage): Promise<PreparedImage> {
    const context = ImageManipulator.manipulate(image.uri);
    try {
        if (Math.max(image.width, image.height) > MAX_SIDE) {
            context.resize(
                image.width >= image.height ? { width: MAX_SIDE } : { height: MAX_SIDE },
            );
        }
        const rendered = await context.renderAsync();
        try {
            const saved = await rendered.saveAsync({
                format: SaveFormat.JPEG,
                compress: JPEG_QUALITY,
            });
            return { uri: saved.uri, width: saved.width, height: saved.height };
        } finally {
            rendered.release();
        }
    } finally {
        context.release();
    }
}

export function getImageSize(uri: string): number {
    return new File(uri).size;
}
