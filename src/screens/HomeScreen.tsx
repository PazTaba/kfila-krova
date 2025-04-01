// HomeScreen.tsx - Main component file
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useJobs } from '../hooks/useJobs';
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
import { useLocation } from '../hooks/useLocation';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../hooks/useUser';

function HomeScreen({ navigation }: any) {
  const { jobs, fetchJobs } = useJobs();
  const { lastLocation, setLocation } = useLocation();
  const { user, setUser } = useUser();
  const { products, fetchProducts } = useProducts();
  const [selectedCategories, setSelectedCategories] = useState(['all']);



  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [matchRadius, setMatchRadius] = useState(5);
  const [showRadiusModal, setShowRadiusModal] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [actionPanelAnim] = useState(new Animated.Value(100));

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

    // מריץ עדכון מיקום כל 3 דקות
    const interval = setInterval(() => {
      updateUserLocation();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
  }, []);


  const getNearbyProducts = () => {
    if (!lastLocation) return [];
    const haversine = require('haversine-distance');
    return products.filter((product) => {
      const distance = haversine(
        { lat: lastLocation.latitude, lon: lastLocation.longitude },
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  const toggleActionPanel = () => setShowActionPanel(!showActionPanel);

  const handleUpdateLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    const newLoc = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
    setLocation(newLoc);
    Alert.alert('עדכון מיקום', 'המיקום עודכן בהצלחה!');
  };

  // ⏳ מראה רק אם המיקום מוכן
  if (!lastLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.Text>טוען מיקום...</Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

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
        region={{
          ...lastLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        customMapStyle={mapStyle}
        showsCompass={false}
        showsMyLocationButton={false}
      >
        <Circle
          center={lastLocation}
          radius={matchRadius * 1000}
          strokeColor="rgba(108, 92, 231, 0.6)"
          fillColor="rgba(108, 92, 231, 0.15)"
          strokeWidth={1}
        />
        <MapMarkers products={products} navigation={navigation} />
      </MapView>

      {getNearbyProducts().length > 0 && (
        <MatchBanner count={getNearbyProducts().length} />
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
