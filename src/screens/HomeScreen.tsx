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
  Alert,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import haversine from 'haversine-distance';
import * as ImagePicker from 'expo-image-picker';
import { updateUserLocation } from '../utils/location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [actionPanelAnim] = useState(new Animated.Value(100));
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedSort, setSelectedSort] = useState('distance');

  // Custom map style
  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#bdbdbd" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#eeeeee" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#e5e5e5" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#dadada" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{ "color": "#e5e5e5" }]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{ "color": "#eeeeee" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#c9c9c9" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    }
  ];

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

    fetchProducts();

    const interval = setInterval(() => {
      updateUserLocation();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showActionPanel) {
      Animated.timing(actionPanelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(actionPanelAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [showActionPanel]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('אין הרשאה', 'נדרשת הרשאה לגלריה כדי לבחור תמונה');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const updatedUser = { ...user, profileImage: selectedUri };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

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

  const toggleCategory = (category: any) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
    } else {
      const newCategories = selectedCategories.filter(c => c !== 'all');
      if (newCategories.includes(category)) {
        setSelectedCategories(newCategories.filter(c => c !== category));
      } else {
        setSelectedCategories([...newCategories, category]);
      }

      // If no categories selected, default to "all"
      if (newCategories.length === 0) {
        setSelectedCategories(['all']);
      }
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
                <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                  <Image
                    source={{ uri: user?.profileImage || 'https://via.placeholder.com/100' }}
                    style={styles.profileImage}
                  />
                  <View style={styles.editProfileBadge}>
                    <Feather name="edit-2" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{user?.name || 'משתמש'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
              </View>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('Profile'); toggleSidebar(); }}>
                <View style={styles.sidebarIconContainer}>
                  <Ionicons name="person-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.sidebarItemText}>פרופיל</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('Settings'); toggleSidebar(); }}>
                <View style={styles.sidebarIconContainer}>
                  <Ionicons name="settings-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.sidebarItemText}>הגדרות</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('Favorites'); toggleSidebar(); }}>
                <View style={styles.sidebarIconContainer}>
                  <Ionicons name="heart-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.sidebarItemText}>מועדפים</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigation.navigate('History'); toggleSidebar(); }}>
                <View style={styles.sidebarIconContainer}>
                  <Ionicons name="time-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.sidebarItemText}>היסטוריה</Text>
              </TouchableOpacity>

              <View style={styles.sidebarDivider} />

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); handleLogout(); }}>
                <View style={[styles.sidebarIconContainer, { backgroundColor: '#FF6B6B' }]}>
                  <Ionicons name="log-out-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.sidebarItemText}>התנתק</Text>
              </TouchableOpacity>

              <View style={styles.versionInfo}>
                <Text style={styles.versionText}>גרסה 1.0.0</Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleUpdateLocation = async () => {
    await updateUserLocation();
    Alert.alert('עדכון מיקום', 'המיקום עודכן בהצלחה!');
  };

  const toggleActionPanel = () => {
    setShowActionPanel(!showActionPanel);
  };

  const renderRadiusModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showRadiusModal}
      onRequestClose={() => setShowRadiusModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowRadiusModal(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>הגדר רדיוס חיפוש</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowRadiusModal(false)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.radiusValueContainer}>
                  <Text style={styles.radiusValue}>{matchRadius}</Text>
                  <Text style={styles.radiusUnit}>ק"מ</Text>
                </View>

                <Slider
                  style={styles.radiusSlider}
                  minimumValue={1}
                  maximumValue={30}
                  step={1}
                  value={matchRadius}
                  onValueChange={setMatchRadius}
                  minimumTrackTintColor="#6C5CE7"
                  maximumTrackTintColor="rgba(108, 92, 231, 0.2)"
                  thumbTintColor="#6C5CE7"
                />

                <View style={styles.radiusLabels}>
                  <Text style={styles.radiusLabel}>1 ק"מ</Text>
                  <Text style={styles.radiusLabel}>30 ק"מ</Text>
                </View>

                <View style={styles.radiusDescription}>
                  <Ionicons name="information-circle-outline" size={20} color="#6C5CE7" />
                  <Text style={styles.radiusDescriptionText}>
                    רדיוס גדול יותר יציג יותר מוצרים, אך ייתכן שהם יהיו רחוקים יותר ממיקומך הנוכחי.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowRadiusModal(false)}
                >
                  <Text style={styles.applyButtonText}>שמור הגדרות</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFiltersModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showFiltersModal}
      onRequestClose={() => setShowFiltersModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFiltersModal(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>סנן תוצאות</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFiltersModal(false)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.filterCategoryTitle}>קטגוריות</Text>

                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedCategories.includes('all') && styles.filterChipSelected
                    ]}
                    onPress={() => toggleCategory('all')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategories.includes('all') && styles.filterChipTextSelected
                    ]}>הכל</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedCategories.includes('food') && styles.filterChipSelected
                    ]}
                    onPress={() => toggleCategory('food')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategories.includes('food') && styles.filterChipTextSelected
                    ]}>מזון</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedCategories.includes('clothing') && styles.filterChipSelected
                    ]}
                    onPress={() => toggleCategory('clothing')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategories.includes('clothing') && styles.filterChipTextSelected
                    ]}>בגדים</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedCategories.includes('electronics') && styles.filterChipSelected
                    ]}
                    onPress={() => toggleCategory('electronics')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategories.includes('electronics') && styles.filterChipTextSelected
                    ]}>אלקטרוניקה</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedCategories.includes('furniture') && styles.filterChipSelected
                    ]}
                    onPress={() => toggleCategory('furniture')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategories.includes('furniture') && styles.filterChipTextSelected
                    ]}>ריהוט</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.filterCategoryTitle}>מיון לפי</Text>

                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      selectedSort === 'distance' && styles.sortOptionSelected
                    ]}
                    onPress={() => setSelectedSort('distance')}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color={selectedSort === 'distance' ? "#fff" : "#6C5CE7"}
                    />
                    <Text style={[
                      styles.sortOptionText,
                      selectedSort === 'distance' && styles.sortOptionTextSelected
                    ]}>מרחק</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      selectedSort === 'popularity' && styles.sortOptionSelected
                    ]}
                    onPress={() => setSelectedSort('popularity')}
                  >
                    <Ionicons
                      name="star"
                      size={20}
                      color={selectedSort === 'popularity' ? "#fff" : "#6C5CE7"}
                    />
                    <Text style={[
                      styles.sortOptionText,
                      selectedSort === 'popularity' && styles.sortOptionTextSelected
                    ]}>פופולריות</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      selectedSort === 'newest' && styles.sortOptionSelected
                    ]}
                    onPress={() => setSelectedSort('newest')}
                  >
                    <Ionicons
                      name="time"
                      size={20}
                      color={selectedSort === 'newest' ? "#fff" : "#6C5CE7"}
                    />
                    <Text style={[
                      styles.sortOptionText,
                      selectedSort === 'newest' && styles.sortOptionTextSelected
                    ]}>חדש</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFiltersModal(false)}
                >
                  <Text style={styles.applyButtonText}>החל סינון</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderProductMarker = (product: any) => {
    return (
      <Marker
        key={product._id}
        coordinate={{ latitude: product.latitude, longitude: product.longitude }}
        tracksViewChanges={false}
      >
        <View style={styles.markerContainer}>
          <Image source={{ uri: `http://172.20.10.3:3000${product.image}` }} style={styles.productImage} />
        </View>
        <Callout
          tooltip
          onPress={() => {
     
            Platform.OS === 'ios' &&
              navigation.navigate('Product', { productId: product._id });
              
          }}
        >
          <View style={styles.calloutContainer}>
            <Image
              source={{ uri: `http://172.20.10.3:3000${product.image}` }}
              style={styles.calloutImage}
            />
            <Text style={styles.calloutTitle}>{product.name}</Text>
            <TouchableOpacity
              style={styles.calloutButton}
              onPress={() => navigation.navigate('Product', { productId: product._id })}
            >
              <Text style={styles.calloutButtonText}>צפה בפרטים</Text>
            </TouchableOpacity>
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {!isSidebarOpen && (
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Feather name="menu" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Feather name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
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
        {products.map(product => renderProductMarker(product))}
      </MapView>

      {getNearbyProducts().length > 0 && (
        <View style={styles.matchBannerContainer}>
          <LinearGradient
            colors={['#6C5CE7', '#a29bfe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.matchBanner}
          >
            <View style={styles.matchIconContainer}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#fff" />
            </View>
            <Text style={styles.matchBannerText}>
              {getNearbyProducts().length} מוצרים נמצאים בסביבה שלך
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={toggleActionPanel}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6C5CE7', '#a29bfe']}
          style={styles.actionButtonGradient}
        >
          <Feather name={showActionPanel ? "x" : "plus"} size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Panel */}
      {showActionPanel && (
        <Animated.View style={[
          styles.actionPanel,
          { transform: [{ translateY: actionPanelAnim }] }
        ]}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowActionPanel(false);
              handleUpdateLocation();
            }}
          >
            <LinearGradient
              colors={['#6C5CE7', '#a29bfe']}
              style={styles.actionIconGradient}
            >
              <Feather name="navigation" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>עדכן מיקום</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowActionPanel(false);
              setShowRadiusModal(true);
            }}
          >
            <LinearGradient
              colors={['#6C5CE7', '#a29bfe']}
              style={styles.actionIconGradient}
            >
              <Feather name="radio" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>הגדר רדיוס</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowActionPanel(false);
              setShowFiltersModal(true);
            }}
          >
            <LinearGradient
              colors={['#6C5CE7', '#a29bfe']}
              style={styles.actionIconGradient}
            >
              <Feather name="filter" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>סנן תוצאות</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowActionPanel(false);
              navigation.navigate('AddProduct');
            }}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.actionIconGradient}
            >
              <Feather name="plus" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>הוסף מוצר</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {renderRadiusModal()}
      {renderFiltersModal()}
      {renderSidebar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  calloutContainer: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  calloutButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  matchBannerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
  },
  matchIconContainer: {
    marginRight: 12,
  },
  matchBannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.75,
    backgroundColor: 'white',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6C5CE7',
  },
  editProfileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C5CE7',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  sidebarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
    marginHorizontal: 24,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 15,
  },
  versionInfo: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPanel: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  actionIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 24,
  },

  // Radius Modal
  radiusValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  radiusValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  radiusUnit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginLeft: 6,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  radiusLabel: {
    color: '#666',
    fontSize: 14,
  },
  radiusDescription: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  radiusDescriptionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Filter Modal
  filterCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  filterChipText: {
    color: '#6C5CE7',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    flex: 1,
    marginHorizontal: 6,
    justifyContent: 'center',
  },
  sortOptionSelected: {
    backgroundColor: '#6C5CE7',
  },
  sortOptionText: {
    color: '#6C5CE7',
    fontWeight: '500',
    marginLeft: 8,
  },
  sortOptionTextSelected: {
    color: 'white',
  },

  // Common Button
  applyButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default HomeScreen;