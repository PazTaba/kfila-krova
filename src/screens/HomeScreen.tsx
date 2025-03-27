import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { RootStackParamList } from '../navigation/navigation-types';
import haversine from 'haversine-distance';
import { updateUserLocation } from '../utils/location';


type ProductWithLocation = {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  image: string;
};

function HomeScreen({ navigation }: any): React.JSX.Element {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 32.0853,
    longitude: 34.7818,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [sidebarAnim] = useState(new Animated.Value(-Dimensions.get('window').width * 0.75));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<ProductWithLocation[]>([]);
  const [matchRadius, setMatchRadius] = useState(5);
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);

  const [user] = useState({
    name: 'ישראל ישראלי',
    profileImage: 'https://example.com/profile.jpg',
    email: 'israel@example.com'
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return; // התנאי נמצא כאן לפני החזרת JSX
  
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
    })();
  
    fetchProducts();
  
    // עדכון מיקום כל 3 דקות
    const interval = setInterval(() => {
      updateUserLocation();
    }, 1000 * 60 * 3); // כל 3 דקות
  
    return () => clearInterval(interval); // נוודא שהinterval נעצר כשהמסך לא פעיל
  }, []);
  

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://172.20.10.3:3000/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('❌ שגיאה בטעינת מוצרים:', error);
    }
  };

  const getNearbyProducts = (): ProductWithLocation[] => {
    return products.filter((product) => {
      const distance = haversine(
        { lat: currentLocation.latitude, lon: currentLocation.longitude },
        { lat: product.latitude, lon: product.longitude }
      ) / 1000;
      return distance <= matchRadius;
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -Dimensions.get('window').width * 0.75,
        duration: 300,
        useNativeDriver: true
      }).start(() => setIsSidebarOpen(false));
    } else {
      setIsSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const renderSidebar = () => {
    if (!isSidebarOpen) return null;

    return (
      <TouchableWithoutFeedback onPress={toggleSidebar}>
        <View style={styles.sidebarOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('Profile'); toggleSidebar(); }}>
                <Ionicons name="person-outline" size={24} color="#333" />
                <Text style={styles.sidebarItemText}>פרופיל</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('Settings'); toggleSidebar(); }}>
                <Ionicons name="settings-outline" size={24} color="#333" />
                <Text style={styles.sidebarItemText}>הגדרות</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sidebarItem, { borderBottomWidth: 0 }]} onPress={() => { toggleSidebar(); handleLogout(); }}>
                <Ionicons name="log-out-outline" size={24} color="#D9534F" />
                <Text style={[styles.sidebarItemText, { color: '#D9534F' }]}>התנתק</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleUpdateLocation = async () => {
    await updateUserLocation();
    alert('המיקום עודכן בהצלחה!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.profileImageContainer} onPress={toggleSidebar}>
        <Image source={{ uri: user.profileImage }} style={styles.topProfileImage} />
      </TouchableOpacity>

      {!isSidebarOpen && (
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={30} color="#000" />
        </TouchableOpacity>
      )}

      <MapView style={styles.map} region={currentLocation} showsUserLocation>
        <Circle
          center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
          radius={matchRadius * 1000}
          strokeColor="rgba(74,144,226,0.5)"
          fillColor="rgba(74,144,226,0.2)"
        />
        {products.map((product) => (
          <Marker
            key={product._id}
            coordinate={{ latitude: product.latitude, longitude: product.longitude }}
          >
            <Image source={{ uri: `http://172.20.10.3:3000${product.image}` }} style={styles.productImage} />
            <Callout>
              <View style={{ width: 150 }}>
                <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
                <Image
                  source={{ uri: `http://172.20.10.3:3000${product.image}` }}
                  style={{ width: 120, height: 80, borderRadius: 5, marginTop: 5 }}
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {getNearbyProducts().length > 0 && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchBannerText}>
            {getNearbyProducts().length} מוצרים נמצאים בסביבה שלך 👀
          </Text>
        </View>
      )}

      {/* כפתור לעדכון מיקום */}
      <TouchableOpacity
        style={styles.updateLocationButton}
        onPress={handleUpdateLocation}
      >
        <Text style={styles.updateLocationButtonText}>עדכן מיקום</Text>
      </TouchableOpacity>

      {/* כפתור + סליידר */}
      <TouchableOpacity style={styles.radiusButton} onPress={() => setShowRadiusPanel(!showRadiusPanel)}>
        <Ionicons name="radio-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {showRadiusPanel && (
        <View style={styles.radiusPanel}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>רדיוס: {matchRadius} ק"מ</Text>
          <Slider
            minimumValue={1}
            maximumValue={30}
            step={1}
            value={matchRadius}
            onValueChange={setMatchRadius}
          />
        </View>
      )}

      {renderSidebar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  menuButton: {
    position: 'absolute', top: 70, left: 20, zIndex: 10,
    backgroundColor: 'white', borderRadius: 30, padding: 10,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84
  },
  profileImageContainer: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  topProfileImage: { width: 50, height: 50, borderRadius: 25 },
  matchBanner: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    backgroundColor: '#4A90E2', padding: 15, borderRadius: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
    elevation: 5
  },
  matchBannerText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sidebar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: Dimensions.get('window').width * 0.75, backgroundColor: 'white', zIndex: 20,
    padding: 20, shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    elevation: 5
  },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  sidebarItemText: { marginRight: 10, fontSize: 16 },
  sidebarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },

  radiusButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  radiusPanel: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },

  // כפתור לעדכון מיקום
  updateLocationButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  updateLocationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default HomeScreen;
