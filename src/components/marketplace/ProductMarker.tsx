// components/ProductMarker.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import styles from '../../components/homeScreenStyles';
import { Config } from '../../config/config';


type ProductMarkerProps = {
    product: {
        _id: string;
        name: string;
        latitude: number;
        longitude: number;
        image: string;
    };
    navigation: any;
};

const ProductMarker: React.FC<ProductMarkerProps> = ({ product, navigation }) => {
    return (
        <Marker
            key={product._id}
            coordinate={{ latitude: product.latitude, longitude: product.longitude }}
            tracksViewChanges={false}
        >
            <View style={styles.markerContainer}>
                <Image source={{ uri: `${Config.API_URL}${product.image}` }} style={styles.productImage} />
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
                        source={{ uri: `${Config.API_URL}${product.image}` }}
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

export default ProductMarker;