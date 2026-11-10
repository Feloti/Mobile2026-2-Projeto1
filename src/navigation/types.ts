import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Place } from '../types/location';

export type TabParamList = {
    Inicio: undefined;
    Colecao: undefined;
    Explorar: undefined;
    Mapa: { focusId?: string } | undefined;
};

export type PickLocationReturn = 'ChooseInsect';

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList> | undefined;
    InsectDetail: { speciesId: string };
    Camera: undefined;
    ChooseInsect: { photoUri: string; pickedPlace?: Place };
    PickLocation: { initial?: Place | null; discoveryId?: string; returnTo?: PickLocationReturn };
};
