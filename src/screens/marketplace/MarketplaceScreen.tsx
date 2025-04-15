import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, Image, TextInput, Modal, StyleSheet
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useAnalytics } from '../../hooks/useAnalytics';
import {analyticsService} from '../../services/AnalyticsService';

import ScreenTemplate from '../ScreenTemplate';

export default function MarketplaceScreen() {
    const { trackScreen, trackSearch, trackItemView } = useAnalytics();
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

    useEffect(() => {
        trackScreen('MarketplaceScreen');
    }, []);

    const filterProducts = () => {
        let filtered = [...products];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            trackSearch(searchQuery, filtered.length);
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

    // Filter button for header right
    const FilterButton = () => (
        <TouchableOpacity onPress={() => setIsFiltersModalVisible(true)}>
            <Feather
                name="filter"
                size={24}
                color="#4A4A4A"
            />
        </TouchableOpacity>
    );

    // Render product items for the template
    const renderProductItems = () => {
        if (filteredProducts.length === 0) {
            return null; // Empty state will be handled by ScreenTemplate
        }

        return filteredProducts.map((product) => (
            <TouchableOpacity
                key={product._id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                    trackItemView(product._id, 'product');
                    navigation.navigate('Products', { productId: product._id });
                }}
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
        ));
    };

    // Filters Modal Component
    const FiltersModal = () => {
        const [minPrice, setMinPrice] = useState<string>('');
        const [maxPrice, setMaxPrice] = useState<string>('');
        const [maxDistance, setMaxDistance] = useState<string>('');

        const applyFilters = () => {
            const filters = {
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
            };

            setActiveFilters(filters);
            setIsFiltersModalVisible(false);

            // Track analytics
            analyticsService.trackFilterApplied(filters);
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

                        <View style={styles.filtersContent}>
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
                        </View>

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

    // Prepare categories with "all" option
    const allCategories = [
        { _id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
        ...categories
    ];

    return (
        <>
            <ScreenTemplate
                type="list"
                title="שוק מוצרים"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="חפש מוצרים..."
                headerRight={<FilterButton />}
                renderItems={renderProductItems}
                emptyStateText={searchQuery ? 'לא נמצאו מוצרים תואמים לחיפוש' : 'אין מוצרים בקטגוריה זו'}
                onAddPress={() => navigation.navigate('AddProduct')}
                addButtonLabel="הוסף מוצר"

                // Use the built-in category selector
                showCategorySelector={true}
                categories={allCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
            />

            <FiltersModal />
        </>
    );
}

const styles = StyleSheet.create({
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
    image: {
        width: 120,
        height: 120
    },
    details: {
        flex: 1,
        padding: 15,
        justifyContent: 'center'
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 10
    },
    productInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    infoText: {
        fontSize: 14,
        color: '#7A7A7A',
        marginLeft: 5
    },
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