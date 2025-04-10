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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../../types/Product';
import { Config } from '../../config/config';


function HistoryScreen() {
    const navigation = useNavigation();
    const [history, setHistory] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadHistory();
        loadFavorites();
    }, []);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const historyData = await AsyncStorage.getItem('viewHistory');
            if (historyData) {
                const parsedHistory = JSON.parse(historyData);

                // Fetch full product details for each history item
                const enrichedHistory = await Promise.all(
                    parsedHistory.map(async (item: Product) => {
                        try {
                            const response = await fetch(`${Config.API_URL}/products/${item._id}`);
                            const product = await response.json();
                            return {
                                ...product,
                                viewedAt: item.viewedAt,
                                formattedDate: formatDate(item.viewedAt)
                            };
                        } catch (error) {
                            console.error(`Failed to fetch product ${item._id}:`, error);
                            return null;
                        }
                    })
                );

                // Filter out failed requests and sort by most recent
                setHistory(
                    enrichedHistory
                        .filter(item => item !== null)
                        .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                );
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            Alert.alert('שגיאה', 'לא ניתן לטעון את ההיסטוריה');
        } finally {
            setIsLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const favoritesData = await AsyncStorage.getItem('favorites');
            if (favoritesData) {
                setFavorites(JSON.parse(favoritesData));
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Failed to load favorites status:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `לפני ${diffMins} דקות`;
        } else if (diffHours < 24) {
            return `לפני ${diffHours} שעות`;
        } else if (diffDays < 7) {
            return `לפני ${diffDays} ימים`;
        } else {
            // Format as dd/mm/yyyy
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        }
    };

    const clearHistory = async () => {
        Alert.alert(
            'מחיקת היסטוריה',
            'האם אתה בטוח שברצונך למחוק את היסטוריית הצפייה?',
            [
                {
                    text: 'ביטול',
                    style: 'cancel',
                },
                {
                    text: 'מחק',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('viewHistory');
                            setHistory([]);
                            Alert.alert('הצלחה', 'היסטוריית הצפייה נמחקה');
                        } catch (error) {
                            console.error('Failed to clear history:', error);
                            Alert.alert('שגיאה', 'לא ניתן למחוק את ההיסטוריה');
                        }
                    },
                },
            ]
        );
    };

    const toggleFavorite = async (productId) => {
        try {
            const isFavorite = favorites.includes(productId);
            let updatedFavorites;

            if (isFavorite) {
                // Remove from favorites
                updatedFavorites = favorites.filter(id => id !== productId);
            } else {
                // Add to favorites
                updatedFavorites = [...favorites, productId];
            }

            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Failed to update favorites:', error);
            Alert.alert('שגיאה', 'לא ניתן לעדכן את המועדפים');
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="time-outline" size={80} color="#DADADA" />
            <Text style={styles.emptyStateTitle}>אין היסטוריית צפייה</Text>
            <Text style={styles.emptyStateDescription}>
                מוצרים בהם צפית יופיעו כאן כדי שתוכל לחזור אליהם מאוחר יותר
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
            >
                <LinearGradient
                    colors={['#6C5CE7', '#a29bfe']}
                    style={styles.exploreButtonGradient}
                >
                    <Text style={styles.exploreButtonText}>גלה מוצרים</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderHistoryItem = (product) => (
        <TouchableOpacity
            key={product._id}
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: product._id })}
        >
            <Image
                source={{ uri: `${Config.API_URL}${product.image}` }}
                style={styles.productImage}
            />

            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productLocation}>
                    <Ionicons name="location-outline" size={14} color="#6C5CE7" /> {product.location || "מיקום לא ידוע"}
                </Text>
                <Text style={styles.viewedTime}>
                    <Ionicons name="time-outline" size={14} color="#666" /> {product.formattedDate}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(product._id)}
            >
                <Ionicons
                    name={favorites.includes(product._id) ? "heart" : "heart-outline"}
                    size={24}
                    color={favorites.includes(product._id) ? "#FF6B6B" : "#666"}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderHistoryByDate = () => {
        // Group history items by date
        const groupedHistory = history.reduce((groups, item) => {
            const date = new Date(item.viewedAt).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[date]) {
                groups[date] = [];
            }

            groups[date].push(item);
            return groups;
        }, {});

        return Object.entries(groupedHistory).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateDivider}>{date}</Text>
                {items.map(product => renderHistoryItem(product))}
            </View>
        ));
    };

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
                <Text style={styles.headerTitle}>היסטוריית צפייה</Text>
                {history.length > 0 ? (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearHistory}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.rightPlaceholder} />
                )}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>טוען היסטוריה...</Text>
                </View>
            ) : history.length === 0 ? (
                renderEmptyState()
            ) : (
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.productsList}
                    showsVerticalScrollIndicator={false}
                >
                    {renderHistoryByDate()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightPlaceholder: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    productsList: {
        padding: 16,
    },
    dateGroup: {
        marginBottom: 16,
    },
    dateDivider: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    productInfo: {
        flex: 1,
        marginHorizontal: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    viewedTime: {
        fontSize: 12,
        color: '#666',
    },
    favoriteButton: {
        justifyContent: 'center',
        padding: 8,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyStateDescription: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 30,
    },
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
    exploreButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    exploreButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default HistoryScreen;