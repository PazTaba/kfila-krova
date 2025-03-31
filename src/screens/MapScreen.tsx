import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useProducts } from '../hooks/useProducts';
import { useLocation } from '../hooks/useLocation';
import { useFocusEffect } from '@react-navigation/native';

const MapScreen = () => {
    const { products, fetchProducts } = useProducts();
    const { location }:any = useLocation();

    const initialRegion: Region = {
        latitude: location?.latitude || 32.0853,
        longitude: location?.longitude || 34.7818,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
            >
                {products.map(product => (
                    <Marker
                        key={product._id}
                        coordinate={{
                            latitude: product.latitude,
                            longitude: product.longitude,
                        }}
                    >
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Image source={{ uri: `http://172.20.10.3:3000${product.image}` }} style={styles.image} />
                                <Text style={styles.title}>{product.name}</Text>
                                <Text style={styles.description}>₪{product.price} - {product.address}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
};

export default MapScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    callout: {
        width: 200,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 5,
        alignItems: 'center',
    },
    image: {
        width: 180,
        height: 100,
        borderRadius: 8,
        marginBottom: 6,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
