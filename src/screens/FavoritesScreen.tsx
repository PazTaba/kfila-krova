import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types/Product';

function FavoritesScreen() {
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setIsLoading(true);
            const favoritesData = await AsyncStorage.getItem('favorites');
            if (favoritesData) {
                const parsedFavorites = JSON.parse(favoritesData);
                const enrichedFavorites = await Promise.all(
                    parsedFavorites.map(async (id: string) => {
                        try {
                            const response = await fetch(`http://172.20.10.3:3000/products/${id}`);
                            const product = await response.json();
                            return { ...product, isFavorite: true };
                        } catch (error) {
                            console.error(`Failed to fetch product ${id}:`, error);
                            return null;
                        }
                    })
                );
                setFavorites(enrichedFavorites.filter((item): item is Product => item !== null));
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
            Alert.alert('שגיאה', 'לא ניתן לטעון את המועדפים');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromFavorites = async (productId: string) => {
        try {
            const favoritesData = await AsyncStorage.getItem('favorites');
            let currentFavorites = favoritesData ? JSON.parse(favoritesData) : [];
            currentFavorites = currentFavorites.filter((id: string) => id !== productId);
            await AsyncStorage.setItem('favorites', JSON.stringify(currentFavorites));
            setFavorites(favorites.filter(product => product._id !== productId));
            Alert.alert('הוסר', 'המוצר הוסר מהמועדפים');
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            Alert.alert('שגיאה', 'לא ניתן להסיר את המוצר מהמועדפים');
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="heart-outline" size={80} color="#DADADA" />
            <Text style={styles.emptyStateTitle}>אין מוצרים במועדפים</Text>
            <Text style={styles.emptyStateDescription}>
                הוסף מוצרים למועדפים שלך כדי שתוכל למצוא אותם במהירות מאוחר יותר
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home' as never)}
            >
                <LinearGradient
                    colors={['#6C5CE7', '#a29bfe']}
                    style={styles.exploreButtonGradient}
                >
                    <Text style={styles.exploreButtonText}>חפש מוצרים</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderProductItem = (product: Product) => (
        <TouchableOpacity
            key={product._id}
            style={styles.productCard}
            //@ts-ignore
            onPress={() => navigation.navigate('Product' as never, { productId: product._id } as never)}
        >
            <Image
                source={
                    product.image
                        ? { uri: `http://172.20.10.3:3000${product.image}` }
                        : require('../../assets/avatar1.jpg')
                }
                style={styles.productImage}
            />

            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>

                <Text style={styles.productLocation}>

                    <Ionicons name="location-outline" size={14} color="#6C5CE7" /> {product.latitude || "מיקום לא ידוע"}
                </Text>
                <Text style={styles.productDistance}>
                    {product.distance ? `${product.distance.toFixed(1)} ק"מ ממך` : "מרחק לא ידוע"}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => removeFromFavorites(product._id)}
            >
                <Ionicons name="heart" size={24} color="#FF6B6B" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-right" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>המועדפים שלי</Text>
                <View style={styles.rightPlaceholder} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>טוען מועדפים...</Text>
                </View>
            ) : favorites.length === 0 ? (
                renderEmptyState()
            ) : (
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.productsList}
                    showsVerticalScrollIndicator={false}
                >
                    {favorites.map(product => renderProductItem(product))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 10 : 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    rightPlaceholder: { width: 40 },
    scrollContainer: { flex: 1 },
    productsList: { padding: 16 },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    productImage: { width: 80, height: 80, borderRadius: 12 },
    productInfo: { flex: 1, marginHorizontal: 12, justifyContent: 'center' },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    productLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
    productDistance: { fontSize: 12, color: '#6C5CE7', fontWeight: '500' },
    favoriteButton: { justifyContent: 'center', padding: 8 },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyStateTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    emptyStateDescription: { textAlign: 'center', color: '#666', fontSize: 16, lineHeight: 22, marginBottom: 30 },
    exploreButton: {
        width: '70%',
        overflow: 'hidden',
        borderRadius: 16,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    exploreButtonGradient: { paddingVertical: 16, alignItems: 'center' },
    exploreButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, color: '#666' },
});

export default FavoritesScreen;
