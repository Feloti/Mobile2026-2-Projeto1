import { Alert } from 'react-native';
import type { LocationProblem } from '../types/location';
import { openAppSettings } from './openSettings';
export function showLocationProblem(problem: LocationProblem): void {
    Alert.alert(
        'Localização indisponível',
        problem.message,
        problem.kind === 'blocked'
            ? [
                  { text: 'Agora não', style: 'cancel' },
                  { text: 'Abrir configurações', onPress: openAppSettings },
              ]
            : [{ text: 'OK' }],
    );
}
