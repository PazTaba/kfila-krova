import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Alert,
  Animated,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, FontAwesome } from '@expo/vector-icons';

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
import styles from '../../components/homeScreenStyles';
import { Config } from '../../config/config';

// Define content filter type for the toggles
type ContentFilters = {
  products: boolean;
  jobs: boolean;
  consultations: boolean;
  help: boolean;
};

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
  const [consultations, setConsultations] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [showContentFilters, setShowContentFilters] = useState(false);
  const [contentFilters, setContentFilters] = useState<ContentFilters>({
    products: true,
    jobs: true,
    consultations: true,
    help: true
  });

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
      fetchConsultations();
      fetchHelpRequests();
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
  }, [products, searchQuery, selectedCategories, matchRadius, contentFilters]);

  // ========= API Calls =========
  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${Config.API_URL}/consultations`);
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const response = await fetch(`${Config.API_URL}/help-requests`);
      if (response.ok) {
        const data = await response.json();
        setHelpRequests(data);
      }
    } catch (error) {
      console.error('Error fetching help requests:', error);
    }
  };

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
  const toggleContentFilters = () => setShowContentFilters(!showContentFilters);

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

  const toggleContentFilter = (key: keyof ContentFilters) => {
    setContentFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  const getNearbyItems = () => {
    if (!lastLocation) return 0;

    let count = 0;

    // Count products if enabled
    if (contentFilters.products) {
      count += filteredProducts.length;
    }

    // Count jobs if enabled
    if (contentFilters.jobs && jobs) {
      // Filter jobs by distance
      const jobsInRadius = jobs.filter(job => {
        if (!job.latitude || !job.longitude) return false;

        const haversine = require('haversine-distance');
        const distance = haversine(
          { lat: lastLocation.latitude, lon: lastLocation.longitude },
          { lat: job.latitude, lon: job.longitude }
        ) / 1000;
        return distance <= matchRadius;
      });
      count += jobsInRadius.length;
    }

    // Count consultations if enabled
    if (contentFilters.consultations && consultations) {
      // Filter consultations by distance
      const consultationsInRadius = consultations.filter((consultation: any) => {
        if (!consultation.location?.latitude || !consultation.location?.longitude) return false;

        const haversine = require('haversine-distance');
        const distance = haversine(
          { lat: lastLocation.latitude, lon: lastLocation.longitude },
          { lat: consultation.location.latitude, lon: consultation.location.longitude }
        ) / 1000;
        return distance <= matchRadius;
      });
      count += consultationsInRadius.length;
    }

    // Count help requests if enabled
    if (contentFilters.help && helpRequests) {
      // Filter help requests by distance
      const helpInRadius = helpRequests.filter((help: any) => {
        if (!help.location?.latitude || !help.location?.longitude) return false;

        const haversine = require('haversine-distance');
        const distance = haversine(
          { lat: lastLocation.latitude, lon: lastLocation.longitude },
          { lat: help.location.latitude, lon: help.location.longitude }
        ) / 1000;
        return distance <= matchRadius;
      });
      count += helpInRadius.length;
    }

    return count;
  };
  const renderMapSection = () => {
    if (!lastLocation) return null;

    // Apply content type filters
    const filteredJobs = contentFilters.jobs ? jobs.filter((job: any) => {
      return job.latitude && job.longitude;
    }) : [];

    const filteredConsultations = contentFilters.consultations ? consultations.filter((consultation: any) => {
      return consultation.location?.latitude && consultation.location?.longitude;
    }) : [];

    const filteredHelpRequests = contentFilters.help ? helpRequests.filter((help: any) => {
      return help.location?.latitude && help.location?.longitude;
    }) : [];

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
        <MapMarkers
          products={contentFilters.products ? filteredProducts : []}
          jobs={filteredJobs}
          consultations={filteredConsultations}
          navigation={navigation}
        />
      </MapView>
    );
  };

  const renderMapOverlays = () => {
    const nearbyItemsCount = getNearbyItems();

    return (
      <>
        {nearbyItemsCount > 0 && (
          <MatchBanner count={nearbyItemsCount} />
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
        searchPlaceholder="חפש תוכן..."
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

// Add new styles to the styles from homeScreenStyles
const homeStyles = {
  contentFiltersButton: {
    position: 'absolute',
    bottom: 170,
    left: 20,
    backgroundColor: '#6C5CE7',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  contentFiltersPanel: {
    position: 'absolute',
    bottom: 220,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  contentFilterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  contentFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contentFilterLabel: {
    fontSize: 14,
    color: '#333',
  }
};

// Merge in our new styles with the existing styles
const combinedStyles = {
  ...styles,  // Original styles from homeScreenStyles
  ...homeStyles  // Our new additional styles
};

export default HomeScreen;