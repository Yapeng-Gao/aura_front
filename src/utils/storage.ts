import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores an item in AsyncStorage after serializing it to JSON.
 * @param key - The key under which to store the value.
 * @param value - The value to store (can be any JSON-serializable type).
 */
export const storeItem = async (key: string, value: any): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        console.log(`[Storage] Item stored successfully for key: ${key}`);
    } catch (e) {
        console.error(`[Storage] Error storing item for key "${key}":`, e);
        // Optionally: throw the error or handle it based on app strategy
    }
};

/**
 * Retrieves an item from AsyncStorage and parses it from JSON.
 * @param key - The key of the item to retrieve.
 * @returns The retrieved item (type T), or null if not found or error occurred.
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue !== null) {
            console.log(`[Storage] Item retrieved successfully for key: ${key}`);
            return JSON.parse(jsonValue) as T;
        } else {
            console.log(`[Storage] No item found for key: ${key}`);
            return null;
        }
    } catch (e) {
        console.error(`[Storage] Error retrieving item for key "${key}":`, e);
        return null;
    }
};

/**
 * Removes an item from AsyncStorage.
 * @param key - The key of the item to remove.
 */
export const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`[Storage] Item removed successfully for key: ${key}`);
    } catch (e) {
        console.error(`[Storage] Error removing item for key "${key}":`, e);
        // Optionally: throw the error or handle it
    }
};

/**
 * Clears all data from AsyncStorage. Use with caution!
 */
export const clearAll = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
        console.log('[Storage] All items cleared successfully.');
    } catch (e) {
        console.error('[Storage] Error clearing all items:', e);
        // Optionally: throw the error or handle it
    }
};

// Example Usage (in another file):
// import { storeItem, getItem } from './utils/storage';
//
// interface UserSettings { theme: string; notificationsEnabled: boolean };
// const settings: UserSettings = { theme: 'dark', notificationsEnabled: true };
// await storeItem('user_settings', settings);
//
// const retrievedSettings = await getItem<UserSettings>('user_settings');
// if (retrievedSettings) {
//   console.log(retrievedSettings.theme); // dark
// }