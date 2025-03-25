import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform,
    TextInput, Modal, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

type Product = {
    _id: string;
    name: string;
    price: number;
    distance: number;
    image: string;
    category: string;
};

const CATEGORIES = [
    { id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
    { id: 'electronics', name: 'אלקטרוניקה', icon: '💻', color: '#FF6B6B' },
    { id: 'clothing', name: 'ביגוד', icon: '👕', color: '#4ECDC4' },
    { id: 'furniture', name: 'ריהוט', icon: '🛋️', color: '#45B7D1' },
    { id: 'books', name: 'ספרים', icon: '📚', color: '#FFA07A' },
    { id: 'sports', name: 'ספורט', icon: '⚽', color: '#5D3FD3' },
    { id: 'home', name: 'בית', icon: '🏠', color: '#2A9D8F' },
    { id: 'cars', name: 'רכב', icon: '🚗', color: '#F4A261' },
    { id: 'jewelry', name: 'תכשיטים', icon: '💍', color: '#9C6644' },
    { id: 'garden', name: 'גינה', icon: '🌱', color: '#588157' },
    { id: 'pets', name: 'חיות מחמד', icon: '🐾', color: '#BC4749' },
    { id: 'music', name: 'מוזיקה', icon: '🎸', color: '#6A4C93' },
];

export default function MarketplaceScreen() {
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        minPrice?: number;
        maxPrice?: number;
        maxDistance?: number;
    }>({});

    // Filters Modal Component
    const FiltersModal = () => {
        const [minPrice, setMinPrice] = useState<string>('');
        const [maxPrice, setMaxPrice] = useState<string>('');
        const [maxDistance, setMaxDistance] = useState<string>('');

        const applyFilters = () => {
            const filters = {
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                maxDistance: maxDistance ? parseFloat(maxDistance) : undefined
            };
            setActiveFilters(filters);
            setIsFiltersModalVisible(false);
        };

        const resetFilters = () => {
            setMinPrice('');
            setMaxPrice('');
            setMaxDistance('');
            setActiveFilters({});
            setIsFiltersModalVisible(false);
        };

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isFiltersModalVisible}
                onRequestClose={() => setIsFiltersModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>סינון מוצרים</Text>
                            <TouchableOpacity onPress={() => setIsFiltersModalVisible(false)}>
                                <Feather name="x" size={24} color="#4A4A4A" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.filtersContent}>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>טווח מחירים</Text>
                                <View style={styles.priceInputContainer}>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="מחיר מקסימלי"
                                        placeholderTextColor="#7A7A7A"
                                        keyboardType="numeric"
                                        value={maxPrice}
                                        onChangeText={setMaxPrice}
                                    />
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="מחיר מינימלי"
                                        placeholderTextColor="#7A7A7A"
                                        keyboardType="numeric"
                                        value={minPrice}
                                        onChangeText={setMinPrice}
                                    />
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>מרחק מקסימלי</Text>
                                <TextInput
                                    style={styles.distanceInput}
                                    placeholder="מרחק מקסימלי בק״מ"
                                    placeholderTextColor="#7A7A7A"
                                    keyboardType="numeric"
                                    value={maxDistance}
                                    onChangeText={setMaxDistance}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={resetFilters}
                            >
                                <Text style={styles.resetButtonText}>אפס סינונים</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={applyFilters}
                            >
                                <Text style={styles.applyButtonText}>החל סינונים</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery, activeFilters]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://172.20.10.3:3000/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('error at loading product:', error);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Search query filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Price range filter
        if (activeFilters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.price >= activeFilters.minPrice!);
        }
        if (activeFilters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.price <= activeFilters.maxPrice!);
        }

        // Distance filter
        if (activeFilters.maxDistance !== undefined) {
            filtered = filtered.filter(p => p.distance <= activeFilters.maxDistance!);
        }

        setFilteredProducts(filtered);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsFiltersModalVisible(true)}>
                    <Feather
                        name="filter"
                        size={24}
                        color="#4A4A4A"
                        style={{ marginLeft: 15 }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>שוק מוצרים</Text>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="חפש מוצרים..."
                    placeholderTextColor="#7A7A7A"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
                style={styles.categoriesScrollContainer}
            >
                {CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isSelected ? category.color : '#f4f4f4' }
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryName,
                                        { color: isSelected ? '#fff' : '#4A4A4A' }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {category.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                style={styles.productsScrollView}
            >
                {filteredProducts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {searchQuery
                                ? 'לא נמצאו מוצרים תואמים לחיפוש'
                                : 'אין מוצרים בקטגוריה זו'}
                        </Text>
                    </View>
                ) : (
                    filteredProducts.map((product) => (
                        <TouchableOpacity
                            key={product._id}
                            style={styles.card}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: `http://172.20.10.3:3000${product.image}` }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={styles.details}>
                                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                                <View style={styles.productInfo}>
                                    <View style={styles.infoItem}>
                                        {/* <Feather name="dollar-sign" size={16} color="#4A4A4A" /> */}
                                        <Text style={styles.infoText}>₪{product.price}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Feather name="map-pin" size={16} color="#4A4A4A" />
                                        <Text style={styles.infoText}>{product.distance} ק"מ</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text style={styles.addButtonText}>הוסף מוצר</Text>
                <Feather name="plus-circle" size={20} color="white" />
            </TouchableOpacity>

            {/* Filters Modal */}
            <FiltersModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 20,
        backgroundColor: 'white', shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
        shadowRadius: 3, elevation: 2,
    },
    headerTitle: { fontSize: 20, fontWeight: '600', color: '#4A4A4A', flex: 1, textAlign: 'right' },
    scrollViewContent: { padding: 20 },
    categoriesScrollContainer: {
        maxHeight: 100,
        backgroundColor: 'white',
    },
    productsScrollView: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: { width: 120, height: 120 },
    details: { flex: 1, padding: 15, justifyContent: 'center' },
    name: { fontSize: 18, fontWeight: '600', color: '#4A4A4A', marginBottom: 10 },
    productInfo: { flexDirection: 'row', justifyContent: 'space-between' },
    infoItem: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, color: '#7A7A7A', marginLeft: 5 },
    addButton: {
        backgroundColor: '#4A90E2', paddingVertical: 15, paddingHorizontal: 20,
        marginHorizontal: 20, marginBottom: 20, borderRadius: 10,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 },
    categoriesContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
    },
    categoryButton: {
        width: 90,
        height: 70,
        marginHorizontal: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIcon: { fontSize: 22, marginBottom: 5 },
    categoryName: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyStateText: { fontSize: 16, color: '#7A7A7A' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderRadius: 15, margin: 15, paddingHorizontal: 15, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 50, textAlign: 'right', fontSize: 16, color: '#4A4A4A' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        paddingTop: 20,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A4A4A'
    },
    filtersContent: {
        padding: 20
    },
    filterSection: {
        marginBottom: 20
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4A4A4A',
        marginBottom: 10
    },
    priceInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    priceInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        textAlign: 'right'
    },
    distanceInput: {
        height: 50,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingHorizontal: 15,
        textAlign: 'right'
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0'
    },
    resetButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#F4F4F4',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    resetButtonText: {
        color: '#4A4A4A',
        fontWeight: '600'
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600'
    }
});