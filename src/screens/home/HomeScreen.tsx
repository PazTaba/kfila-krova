// HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Alert,
  Animated,
  TouchableOpacity
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// Components
import ScreenTemplate from '../ScreenTemplate';
import TopBar from '../../components/TopBar';
import Sidebar from '../../components/Sidebar';
import MapMarkers from '../../components/MapMarkers';
import MatchBanner from '../../components/MatchBanner ';
import ActionButton from '../../components/ActionButton ';
import ActionPanel from '../../components/ActionPanel';
import RadiusModal from '../../components/RadiusModal';
import FiltersModal from '../../components/FiltersModal';
import { mapStyle } from '../../components/mapStyle';

// Hooks and Utilities
import { useJobs } from '../../hooks/useJobs';
import { useProducts } from '../../hooks/useProducts';
import { useUser } from '../../hooks/useUser';
import { useLocation } from '../../hooks/useLocation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { userAnalytics, EventType } from '../../utils/userAnalytics';
import { updateUserLocation } from '../../utils/updateUserLocation';
import styles from '../../components/homeScreenStyles'

function HomeScreen({ navigation }: any) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [matchRadius, setMatchRadius] = useState(5);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [actionPanelAnim] = useState(new Animated.Value(100));
  const [selectedSort, setSelectedSort] = useState('distance');
  const [filteredProducts, setFilteredProducts] = useState<any>([]);

  // Hooks
  const { jobs, fetchJobs } = useJobs();
  const { lastLocation, setLocation } = useLocation();
  const { user, setUser, logout, isLoading: isLoadingUser } = useUser();
  const { products, fetchProducts } = useProducts();
  const { trackScreen, trackLocationChange, trackFilterApplied } = useAnalytics();

  // ========= Effects =========
  useEffect(() => {
    trackScreen('HomeScreen');
  }, []);

  useEffect(() => {
    if (lastLocation) {
      trackLocationChange(lastLocation.latitude, lastLocation.longitude);
    }
  }, [lastLocation]);

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

    const interval = setInterval(() => {
      updateUserLocation();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategories, matchRadius]);

  // ========= Handlers =========
  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('שגיאה ביציאה:', error);
    }
  };

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

    userAnalytics.trackEvent(EventType.LOCATION_CHANGE, newLoc);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleActionPanel = () => setShowActionPanel(!showActionPanel);

  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
    } else {
      const filtered = selectedCategories.filter(c => c !== 'all');
      if (filtered.includes(category)) {
        const updated = filtered.filter(c => c !== category);
        setSelectedCategories(updated.length === 0 ? ['all'] : updated);
      } else {
        setSelectedCategories([...filtered, category]);
      }
    }
  };

  const filterProducts = () => {
    if (!products || !lastLocation) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    // Category filter
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Distance filter
    const haversine = require('haversine-distance');
    filtered = filtered.filter(product => {
      const distance = haversine(
        { lat: lastLocation.latitude, lon: lastLocation.longitude },
        { lat: product.latitude, lon: product.longitude }
      ) / 1000;
      return distance <= matchRadius;
    });

    setFilteredProducts(filtered);
  };

  const getNearbyProducts = () => {
    if (!lastLocation) return [];
    return filteredProducts;
  };

  // ========= Render Functions =========
  const renderMapSection = () => {
    if (!lastLocation) return null;

    return (
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
        <MapMarkers products={filteredProducts} navigation={navigation} />
      </MapView>
    );
  };

  const renderMapOverlays = () => {
    return (
      <>
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
      </>
    );
  };

  // If loading, the ScreenTemplate will show a loading indicator
  const isLoading = isLoadingUser;

  // Don't wrap in SafeAreaView because our template will handle that
  return (
    <>
      <ScreenTemplate
        type="map"
        title="מפה"
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="חפש מוצרים..."
        renderMap={renderMapSection}
        renderOverlays={renderMapOverlays}
        headerRight={
          <TouchableOpacity onPress={toggleSidebar}>
            <Feather name="menu" size={24} color="#4A4A4A" />
          </TouchableOpacity>
        }
      />

      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApply={() => {
          trackFilterApplied({
            categories: selectedCategories,
            sort: selectedSort,
          });
          setShowFiltersModal(false);
        }}
        onReset={() => {
          setSelectedCategories(['all']);
          setSelectedSort('distance');
          setShowFiltersModal(false);
        }}
        showDefaultFilters
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
    </>
  );
}

export default HomeScreen;