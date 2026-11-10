import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import type { RootStackParamList } from './types';

import TabNavigator from './TabNavigator';
import InsectDetailScreen from '../features/species/InsectDetailScreen';
import CameraScreen from '../features/identification/CameraScreen';
import ChooseInsectScreen from '../features/identification/ChooseInsectScreen';
import PickLocationScreen from '../features/map/PickLocationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
                name="InsectDetail"
                component={InsectDetailScreen}
                options={{ title: 'Detalhes do inseto' }}
            />
            <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ title: 'Nova identificação', presentation: 'modal' }}
            />
            <Stack.Screen
                name="ChooseInsect"
                component={ChooseInsectScreen}
                options={{ title: 'Escolher o inseto' }}
            />
            <Stack.Screen
                name="PickLocation"
                component={PickLocationScreen}
                options={{ title: 'Local da descoberta' }}
            />
        </Stack.Navigator>
    );
}
