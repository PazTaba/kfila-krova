// utils/updateUserLocation.ts

import * as Location from 'expo-location';
import { Location as UserLocation } from '../types/User';
import { storage, KEYS } from './storage';

/**
 * פונקציה לקבלת מיקום, שמירה ב-AsyncStorage ועדכון בקונטקסט
 * @param setLocation פונקציית setLocation מתוך useLocation()
 * @returns מיקום נוכחי או null
 */
export const updateUserLocation = async (
  setLocation?: (location: UserLocation) => void
): Promise<UserLocation | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('📍 הרשאת מיקום נדחתה');
      return null;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    const currentLocation: UserLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // שמירה ב־AsyncStorage
    await storage.save(KEYS.LAST_LOCATION, currentLocation);

    // עדכון קונטקסט אם נשלח
    if (setLocation) {
      setLocation(currentLocation);
    }

    return currentLocation;
  } catch (err) {
    console.error('❌ שגיאה בקבלת מיקום:', err);
    return null;
  }
};
