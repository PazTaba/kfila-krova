import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';

type MarkerData = {
    id: string;
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
};

const markers: MarkerData[] = [
    {
        id: '1',
        title: 'ספה למכירה',
        description: '150 ש"ח, במצב מצוין',
        image: 'https://example.com/sofa.jpg',
        latitude: 32.0853,
        longitude: 34.7818,
    },
    {
        id: '2',
        title: 'עזרה במחשב',
        description: 'תיקון מהיר, ללא תשלום',
        image: 'https://example.com/computer_help.jpg',
        latitude: 32.0821,
        longitude: 34.7745,
    },
];

const MapScreen = () => {
    const initialRegion: Region = {
        latitude: 32.0853,
        longitude: 34.7818,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
            >
                {markers.map(marker => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                    >
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Image source={{ uri: marker.image }} style={styles.image} />
                                <Text style={styles.title}>{marker.title}</Text>
                                <Text style={styles.description}>{marker.description}</Text>
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
    },
});
