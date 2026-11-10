import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import type { TabParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';
import CollectionScreen from '../features/species/CollectionScreen';
import ExploreScreen from '../features/species/ExploreScreen';
import MapScreen from '../features/map/MapScreen';
const Tab = createBottomTabNavigator<TabParamList>();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const ICONS: Record<keyof TabParamList, IoniconName> = {
    Inicio: 'home',
    Colecao: 'albums',
    Explorar: 'compass',
    Mapa: 'map',
};
export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.textPrimary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 4,
                    borderTopColor: colors.border,
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 12,
                },
                tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 11, fontWeight: '500' },
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={ICONS[route.name]} size={size ? size + 2 : 24} color={color} />
                ),
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
            <Tab.Screen
                name="Colecao"
                component={CollectionScreen}
                options={{ tabBarLabel: 'Coleção' }}
            />
            <Tab.Screen
                name="Explorar"
                component={ExploreScreen}
                options={{ tabBarLabel: 'Explorar' }}
            />
            <Tab.Screen name="Mapa" component={MapScreen} options={{ tabBarLabel: 'Mapa' }} />
        </Tab.Navigator>
    );
}
