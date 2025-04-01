import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform,
    TextInput, Modal
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';

export default function MarketplaceScreen() {

    const navigation = useNavigation<any>();
    const { categories } = useCategories();
    const { products, fetchProducts } = useProducts();

    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        minPrice?: number;
        maxPrice?: number;
        maxDistance?: number;
    }>({});

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );
    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery, activeFilters]);

    const filterProducts = () => {
        let filtered = [...products];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeFilters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.price >= activeFilters.minPrice!);
        }

        if (activeFilters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.price <= activeFilters.maxPrice!);
        }

        if (activeFilters.maxDistance !== undefined) {
            filtered = filtered.filter(p => p.distance <= activeFilters.maxDistance!);
        }

        setFilteredProducts(filtered);
    };

    const FiltersModal = () => {
        const [minPrice, setMinPrice] = useState<string>('');
        const [maxPrice, setMaxPrice] = useState<string>('');
        const [maxDistance, setMaxDistance] = useState<string>('');

        const applyFilters = () => {
            setActiveFilters({
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
            });
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
                                        keyboardType="numeric"
                                        value={maxPrice}
                                        onChangeText={setMaxPrice}
                                    />
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="מחיר מינימלי"
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
                                    placeholder="מרחק בק״מ"
                                    keyboardType="numeric"
                                    value={maxDistance}
                                    onChangeText={setMaxDistance}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                                <Text style={styles.resetButtonText}>אפס סינונים</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>החל סינונים</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
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
                {[
                    { _id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
                    ...categories
                ].map((category) => {
                    const isSelected = selectedCategory === category._id;
                    return (
                        <TouchableOpacity
                            key={category._id}
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isSelected ? category.color : '#f4f4f4' }
                            ]}
                            onPress={() => setSelectedCategory(category._id)}
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
                            onPress={() => navigation.navigate('Products', { productId: product._id })}
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
        marginBottom: 20,
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