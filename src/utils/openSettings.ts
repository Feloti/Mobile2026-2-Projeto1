import { Linking } from 'react-native';
export function openAppSettings(): void {
    Linking.openSettings().catch((error) =>
        console.warn('[Configurações] Não foi possível abrir:', error),
    );
}
