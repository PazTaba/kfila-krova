import React, { useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Product } from '../types/Product';
import { Job } from '../types/Jobs';
import { ConsultationClient } from '../types/Consultation';
import { HelpRequest } from '../types/HelpRequest';
import { Config } from '../config/config';

type MarkerItem = {
    id: string;
    title: string;
    subtitle?: string;
    type: 'product' | 'job' | 'consultation' | 'help';
    image?: string;
    latitude: number;
    longitude: number;
    category?: string;
    color: string;
    icon: string;
    uniqueId: string; // Added for unique identification
};

type Props = {
    products?: Product[];
    jobs?: Job[];
    consultations?: ConsultationClient[];
    navigation: any;
};

const MapMarkers: React.FC<Props> = ({
    products = [],
    jobs = [],
    consultations = [],
    navigation
}) => {

    // Convert products to marker items
    const productMarkers: MarkerItem[] = products.map((product, index) => ({
        id: product._id || `product-${index}`,
        title: product.name,
        subtitle: `₪${product.price}`,
        type: 'product',
        image: product.image,
        latitude: product.latitude,
        longitude: product.longitude,
        category: product.category,
        color: '#4ECDC4', // Default product color
        icon: 'package',
        uniqueId: `product-${product._id || index}`
    }));

    // Convert jobs to marker items
    const jobMarkers: MarkerItem[] = jobs
        .filter(job => job.latitude && job.longitude) // Only include jobs with location
        .map((job, index) => ({
            id: job._id || `job-${index}`,
            title: job.title,
            subtitle: job.company,
            type: 'job',
            latitude: job.latitude!,
            longitude: job.longitude!,
            category: job.interest,
            color: '#FF6B6B', // Default job color
            icon: 'briefcase',
            uniqueId: `job-${job._id || index}`
        }));

    // Convert consultations to marker items with guaranteed unique IDs
    const consultationMarkers: MarkerItem[] = consultations
        .filter(consultation =>
            consultation.location?.latitude &&
            consultation.location?.longitude
        )
        .map((consultation, index) => ({
            id: consultation.id || `fallback-consultation-${index}`,
            title: consultation.question,
            subtitle: consultation.category,
            type: 'consultation',
            latitude: consultation.location!.latitude,
            longitude: consultation.location!.longitude,
            category: consultation.category,
            color: '#6C5CE7', // Default consultation color 
            icon: 'help-circle',
            uniqueId: `consultation-${consultation.id || index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

    const allMarkers = [...productMarkers, ...jobMarkers, ...consultationMarkers];

    const handleMarkerPress = (item: MarkerItem) => {
        switch (item.type) {
            case 'product':
                navigation.navigate('Product', { productId: item.id });
                break;
            case 'job':
                // Find the full job object
                const job = jobs.find(j => j._id === item.id);
                if (job) {
                    navigation.navigate('JobDetails', { job });
                }
                break;
            case 'consultation':
                // Find the full consultation object using fallback if needed
                const consultation = consultations.find(c => c.id === item.id) ||
                    (item.id.startsWith('fallback-consultation-') ?
                        consultations[parseInt(item.id.replace('fallback-consultation-', ''))] :
                        undefined);
                if (consultation) {
                    navigation.navigate('ConsultationDetails', { consultation });
                }
                break;
        
        }
    };
    useEffect(() => {
        console.log('🟢 Products:', products.length);
        console.log('🔵 Jobs:', jobs.length);
        console.log('🟣 Consultations:', consultations.length);

    }, [products, jobs, consultations,]);


    const renderMarkerIcon = (item: MarkerItem) => {
        // For products with images
        if (item.type === 'product' && item.image) {
            return (
                <Image
                    source={{ uri: `${Config.API_URL}${item.image}` }}
                    style={styles.productImage}
                />
            );
        }

        // For all other types, use an icon with background
        return (
            <View style={[styles.markerIconContainer, { backgroundColor: item.color }]}>
                <Feather name={item.icon as any} size={16} color="white" />
            </View>
        );
    };

    return (
        <>
            {allMarkers.map((item) => (
                <Marker
                    key={item.uniqueId}
                    coordinate={{
                        latitude: item.latitude,
                        longitude: item.longitude
                    }}
                    tracksViewChanges={item.type === 'consultation'}
                >

                    <View style={styles.markerContainer}>
                        {renderMarkerIcon(item)}
                    </View>

                    <Callout
                        tooltip
                        onPress={() => {
                            Platform.OS === 'ios' && handleMarkerPress(item);
                        }}
                    >
                        <View style={styles.calloutContainer}>
                            {item.type === 'product' && item.image ? (
                                <Image
                                    source={{ uri: `${Config.API_URL}${item.image}` }}
                                    style={styles.calloutImage}
                                />
                            ) : (
                                <View style={[styles.calloutTypeContainer, { backgroundColor: item.color }]}>
                                    <Feather name={item.icon as any} size={24} color="white" />
                                    <Text style={styles.calloutTypeText}>
                                        {item.type === 'product' ? 'מוצר' :
                                            item.type === 'job' ? 'משרה' :
                                                item.type === 'consultation' ? 'התייעצות' : 'בקשת עזרה'}
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.calloutTitle}>{item.title}</Text>
                            {item.subtitle && (
                                <Text style={styles.calloutSubtitle}>{item.subtitle}</Text>
                            )}

                            <TouchableOpacity
                                style={[styles.calloutButton, { backgroundColor: item.color }]}
                                onPress={() => handleMarkerPress(item)}
                            >
                                <Text style={styles.calloutButtonText}>צפה בפרטים</Text>
                            </TouchableOpacity>
                        </View>
                    </Callout>
                </Marker>
            ))}
        </>
    );
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
    markerIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
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
    calloutTypeContainer: {
        width: '100%',
        height: 60,
        borderRadius: 8,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    calloutTypeText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'center',
    },
    calloutSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    calloutButton: {
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