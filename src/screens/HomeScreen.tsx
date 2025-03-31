// HomeScreen.tsx - Main component file
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useJobs } from '../contexts/JobsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserLocation } from '../utils/updateUserLocation';

// Import components
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import MapMarkers from '../components/MapMarkers';
import MatchBanner from '../components/MatchBanner ';
import ActionButton from '../components/ActionButton ';
import ActionPanel from '../components/ActionPanel';
import RadiusModal from '../components/RadiusModal';
import FiltersModal from '../components/FiltersModal';
import { Animated } from 'react-native';


import { mapStyle } from '../components/mapStyle';
import styles from '../components/homeScreenStyles';

function HomeScreen({ navigation }: any) {
  const { jobs, fetchJobs } = useJobs();

  // State
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 32.0853,
    longitude: 34.7818,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [matchRadius, setMatchRadius] = useState(5);
  const [showRadiusModal, setShowRadiusModal] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [actionPanelAnim] = useState(new Animated.Value(100)); // ✅ נוספה ההגדרה הזו

  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedSort, setSelectedSort] = useState('distance');

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchJobs();
    }, [])
  );

  useEffect(() => {
    Animated.timing(actionPanelAnim, {
      toValue: showActionPanel ? 0 : 100,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [showActionPanel]);


  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
    })();

    const interval = setInterval(() => {
      updateUserLocation();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
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

  const getNearbyProducts = () => {
    return products.filter((product) => {
      const haversine = require('haversine-distance');
      const distance = haversine(
        { lat: currentLocation.latitude, lon: currentLocation.longitude },
        //@ts-ignore
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
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
    } else {
      const newCategories = selectedCategories.filter(c => c !== 'all');
      if (newCategories.includes(category)) {
        const updated = newCategories.filter(c => c !== category);
        setSelectedCategories(updated.length === 0 ? ['all'] : updated);
      } else {
        setSelectedCategories([...newCategories, category]);
      }
    }
  };
  const toggleActionPanel = () => {
    setShowActionPanel(!showActionPanel);
  };

  const handleUpdateLocation = async () => {
    await updateUserLocation();
    Alert.alert('עדכון מיקום', 'המיקום עודכן בהצלחה!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {!isSidebarOpen && (
        <TopBar
          toggleSidebar={toggleSidebar}
          navigation={navigation}
        />
      )}

      <MapView
        style={styles.map}
        region={currentLocation}
        showsUserLocation
        customMapStyle={mapStyle}
        showsCompass={false}
        showsMyLocationButton={false}
      >
        <Circle
          center={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
          radius={matchRadius * 1000}
          strokeColor="rgba(108, 92, 231, 0.6)"
          fillColor="rgba(108, 92, 231, 0.15)"
          strokeWidth={1}
        />
        <MapMarkers
          products={products}
          navigation={navigation}
        />
      </MapView>

      {getNearbyProducts().length > 0 && (
        <MatchBanner
          count={getNearbyProducts().length}
        />
      )}

      <ActionButton
        showActionPanel={showActionPanel}
        toggleActionPanel={toggleActionPanel}
      />

      {showActionPanel && (
        <ActionPanel
          showActionPanel={showActionPanel}
          actionPanelAnim={actionPanelAnim}
          handleUpdateLocation={handleUpdateLocation}
          setShowRadiusModal={setShowRadiusModal}
          setShowFiltersModal={setShowFiltersModal}
          setShowActionPanel={setShowActionPanel}
          navigation={navigation}
        />
      )}


      <RadiusModal
        visible={showRadiusModal}
        setVisible={setShowRadiusModal}
        matchRadius={matchRadius}
        setMatchRadius={setMatchRadius}
      />


      <FiltersModal
        showFiltersModal={showFiltersModal}
        setShowFiltersModal={setShowFiltersModal}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />


      {isSidebarOpen && (
        <Sidebar
          user={user}
          setUser={setUser}
          navigation={navigation}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
      )}
    </SafeAreaView>
  );
}

export default HomeScreen;