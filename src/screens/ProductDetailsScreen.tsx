import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Linking,
    Share,
    Platform,
    StatusBar,
    Dimensions,
    Alert
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';

const ProductDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: string };

    const { getProductById } = useProducts();
    const { getCategoryName, getCategoryIcon } = useCategories();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const result = await getProductById(productId);
            setProduct(result);
            setLoading(false);
        };
        fetchProduct();
        checkIfFavorite();
    }, [productId]);

    const checkIfFavorite = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favorites');
            if (favorites) {
                const favoritesArray = JSON.parse(favorites);
                setIsFavorite(favoritesArray.includes(productId));
            }
        } catch (error) {
            console.error('שגיאה בבדיקת מועדפים:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            let favorites = await AsyncStorage.getItem('favorites');
            let favoritesArray = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favoritesArray = favoritesArray.filter((id: string) => id !== productId);
            } else {
                favoritesArray.push(productId);
            }

            await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
            setIsFavorite(!isFavorite);

            if (!isFavorite) {
                Alert.alert('נוסף למועדפים', 'המוצר נוסף למועדפים בהצלחה!');
            }
        } catch (error) {
            console.error('שגיאה בעדכון מועדפים:', error);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `בדוק את המוצר הזה: ${product?.name} במחיר ${product?.price}₪`,
            });
        } catch (error) {
            console.error('שגיאה בשיתוף המוצר:', error);
        }
    };

    const handleContact = () => setShowContactModal(true);

    const callOwner = () => {
        if (product?.ownerPhone) Linking.openURL(`tel:${product.ownerPhone}`);
    };

    const sendWhatsApp = () => {
        if (product?.ownerPhone) {
            const phone = product.ownerPhone.replace(/-/g, '');
            const msg = `היי, ראיתי את המוצר "${product.name}" באפליקציה והייתי רוצה לקבל עוד פרטים.`;
            Linking.openURL(`whatsapp://send?phone=+972${phone.substring(1)}&text=${encodeURIComponent(msg)}`);
        }
    };

    const openMap = () => {
        if (product?.latitude && product?.longitude) {
            const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
            const latLng = `${product.latitude},${product.longitude}`;
            const label = encodeURIComponent(product.address);
            const url = Platform.select({
                ios: `${scheme}?q=${label}&ll=${latLng}`,
                android: `${scheme}${latLng}?q=${label}`
            });
            if (url) Linking.openURL(url);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>טוען מידע...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>לא ניתן לטעון את פרטי המוצר</Text>
                <TouchableOpacity onPress={() => {
                    setLoading(true);
                    getProductById(productId).then(setProduct).finally(() => setLoading(false));
                }}>

                    <Text>נסה שוב</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: `http://172.20.10.3:3000${product.image}` }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent']}
                    style={styles.headerGradient}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-right" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={handleShare}
                        >
                            <Feather name="share" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={toggleFavorite}
                        >
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? "#FF6B6B" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
                {/* Product Title & Price */}
                <View style={styles.titlePriceContainer}>
                    <Text style={styles.productTitle}>{product.name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{product.price}₪</Text>
                    </View>
                </View>

                {/* Product Info Cards */}
                <View style={styles.infoCardsContainer}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Text style={styles.categoryIcon}>{getCategoryIcon(product.category)}</Text>
                        </View>
                        <Text style={styles.infoLabel}>קטגוריה</Text>
                        <Text style={styles.infoValue}>{getCategoryName(product.category)}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Feather name="check-circle" size={20} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>מצב מוצר</Text>
                        <Text style={styles.infoValue}>{product.condition}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Feather name="calendar" size={20} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>תאריך פרסום</Text>
                        <Text style={styles.infoValue}>{formatDate(product.createdAt)}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>תיאור המוצר</Text>
                    <Text style={styles.descriptionText}>{product.description}</Text>
                </View>

                {/* Location */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>מיקום</Text>
                    <TouchableOpacity style={styles.locationContainer} onPress={openMap}>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationText}>{product.address}</Text>
                            <Text style={styles.distanceText}>
                                <Feather name="map-pin" size={14} color="#6C5CE7" />
                                {product.distance} ק"מ ממך
                            </Text>
                        </View>
                        <View style={styles.mapIconContainer}>
                            <Feather name="map" size={24} color="#6C5CE7" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Owner Information */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>פרטי המוכר</Text>
                    <View style={styles.ownerContainer}>
                        <Image
                            source={{ uri: `http://172.20.10.3:3000${product.ownerImage}` }}
                            style={styles.ownerImage}
                        />
                        <View style={styles.ownerInfo}>
                            <Text style={styles.ownerName}>{product.ownerName}</Text>
                            <Text style={styles.memberSince}>חבר מ-{formatDate("2024-01-01T00:00:00Z")}</Text>
                        </View>
                    </View>
                </View>

                {/* Safety Tips */}
                <View style={styles.safetyContainer}>
                    <View style={styles.safetyHeader}>
                        <Feather name="shield" size={20} color="#6C5CE7" />
                        <Text style={styles.safetyTitle}>טיפים לקנייה בטוחה</Text>
                    </View>
                    <Text style={styles.safetyText}>
                        • בדוק את המוצר לפני התשלום{'\n'}
                        • ודא שאתה רואה את המוצר במציאות{'\n'}
                        • העדף מפגש במקום ציבורי{'\n'}
                        • שמור על פרטיותך{'\n'}
                        • בכל חשש, דווח למנהלי האפליקציה
                    </Text>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 90 }} />
            </ScrollView>

            {/* Contact Button */}
            <View style={styles.contactButtonContainer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Text style={styles.contactButtonText}>צור קשר עם המוכר</Text>
                </TouchableOpacity>
            </View>

            {/* Contact Modal */}
            {showContactModal && (
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowContactModal(false)}
                >
                    <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={e => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>צור קשר</Text>
                            <TouchableOpacity onPress={() => setShowContactModal(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contactOptions}>
                            <TouchableOpacity style={styles.contactOption} onPress={callOwner}>
                                <View style={[styles.contactIconContainer, styles.callIcon]}>
                                    <Feather name="phone" size={24} color="#fff" />
                                </View>
                                <Text style={styles.contactOptionText}>התקשר עכשיו</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.contactOption} onPress={sendWhatsApp}>
                                <View style={[styles.contactIconContainer, styles.whatsappIcon]}>
                                    <Feather name="message-circle" size={24} color="#fff" />
                                </View>
                                <Text style={styles.contactOptionText}>WhatsApp</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contactNoteContainer}>
                            <MaterialCommunityIcons name="information-outline" size={18} color="#666" />
                            <Text style={styles.contactNote}>
                                בשיחה עם המוכר, ציין שראית את המוצר באפליקציה שלנו
                            </Text>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    detailsContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titlePriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap', // Allow text to wrap
    },
    productTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        flex: 1, // Allow title to take available space
        marginRight: 10, // Space for price
    },
    priceContainer: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    infoCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        width: width / 3.5,
        padding: 10,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryIcon: {
        fontSize: 20,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'right',
    },
    descriptionText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        textAlign: 'right',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationInfo: {
        flex: 1,
    },
    locationText: {
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
        textAlign: 'right',
    },
    distanceText: {
        fontSize: 13,
        color: '#6C5CE7',
        textAlign: 'right',
    },
    mapIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    ownerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        textAlign: 'right',
    },
    memberSince: {
        fontSize: 13,
        color: '#888',
        textAlign: 'right',
    },
    safetyContainer: {
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    safetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    safetyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6C5CE7',
        marginRight: 10,
        textAlign: 'right',
    },
    safetyText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        textAlign: 'right',
    },
    contactButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    contactButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    contactOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    contactOption: {
        alignItems: 'center',
        padding: 10,
    },
    contactIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    callIcon: {
        backgroundColor: '#4CAF50',
    },
    whatsappIcon: {
        backgroundColor: '#25D366',
    },
    contactOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    contactNoteContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    contactNote: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        textAlign: 'right',
    },
});

export default ProductDetailsScreen;