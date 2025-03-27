import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.20.10.3:3000'; 
export const updateUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('📡 הרשאת מיקום נדחתה');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) return;

    const response = await fetch(`${API_BASE_URL}/update-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      })
    });

    const data = await response.json();
    console.log('📍 Location updated on server:', data);
  } catch (error) {
    console.error('❌ שגיאה בעדכון מיקום:', error);
  }
};
