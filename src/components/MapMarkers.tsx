// components/MapMarkers.tsx
import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Product } from '../types/Product'; // תוודא שהנתיב נכון לפי המבנה שלך

type Props = {
    products: Product[];
    navigation: any;
};

const MapMarkers: React.FC<Props> = ({ products, navigation }) => {
    const renderProductMarker = (product: Product) => {
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
                        Platform.OS === 'ios' && navigation.navigate('Product', { productId: product._id });
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

    return <>{products.map((product) => renderProductMarker(product))}</>;
};


const styles = StyleSheet.create({
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
});

export default MapMarkers;