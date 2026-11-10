import { Directory, File, Paths } from 'expo-file-system';
const PHOTOS_DIR = 'insect-photos';
function photosDirectory(): Directory {
    const directory = new Directory(Paths.document, PHOTOS_DIR);
    if (!directory.exists) {
        directory.create({ intermediates: true, idempotent: true });
    }
    return directory;
}
export async function savePhoto(sourceUri: string, id: string): Promise<string> {
    const destination = new File(photosDirectory(), `${id}.jpg`);
    await new File(sourceUri).copy(destination, { overwrite: true });
    return `${PHOTOS_DIR}/${id}.jpg`;
}
function fileAt(relativePath: string): File {
    return new File(Paths.document, ...relativePath.split('/'));
}
export function resolvePhotoUri(relativePath: string): string {
    return fileAt(relativePath).uri;
}
export function deletePhoto(relativePath: string): void {
    try {
        const file = fileAt(relativePath);
        if (file.exists) file.delete();
    } catch (error) {
        console.warn('[photoStorage] Falha ao apagar a foto:', error);
    }
}
