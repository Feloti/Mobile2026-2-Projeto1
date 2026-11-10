import AsyncStorage from '@react-native-async-storage/async-storage';
export async function saveItem<T>(key: string, value: T): Promise<boolean> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`[AsyncStorage] Falha ao salvar "${key}":`, error);
        return false;
    }
}
export async function loadItem<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
        console.warn(`[AsyncStorage] Falha ao ler "${key}":`, error);
        return null;
    }
}
export async function removeItem(key: string): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn(`[AsyncStorage] Falha ao remover "${key}":`, error);
        return false;
    }
}
