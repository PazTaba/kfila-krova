import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';


export default function AddProductScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [distance, setDistance] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [category, setCategory] = useState('');


    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImage(imageUri); // נשתמש רק ל-preview, ולא נעלה ל-Firebase
        }
    };

    const handleAdd = async () => {
        if (!name || !price || !distance || !image || !category) {
            Alert.alert('שגיאה', 'אנא מלא את כל השדות');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const userData = await AsyncStorage.getItem('userData');
            const userId = userData ? JSON.parse(userData).id : null;
            if (!userId) {
                Alert.alert('שגיאה', 'משתמש לא מזוהה');
                return;
            }
            

            const location = await Location.getCurrentPositionAsync({});
            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price);
            formData.append('distance', distance);
            formData.append('category', category);
            formData.append('userId', userId);
            formData.append('latitude', latitude.toString());
            formData.append('longitude', longitude.toString());

            formData.append('image', {
                uri: image,
                name: 'product.jpg',
                type: 'image/jpeg'
            } as any);

            const response = await fetch('http://172.20.10.3:3000/add-product', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unknown error');
            }

            Alert.alert('הצלחה', 'המוצר נוסף בהצלחה');
            navigation.navigate('Marketplace');
        } catch (error: any) {
            Alert.alert('שגיאה', 'אירעה שגיאה בהוספה');
            console.error(error);
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-right" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>הוספת מוצר חדש</Text>
            </View>

            <View style={styles.content}>
                {image ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image
                            source={{ uri: image }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setImage(null)}
                        >
                            <Feather name="x" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.uploadPlaceholder}
                        onPress={pickImage}
                    >
                        <Feather name="camera" size={32} color="#B0B0B0" />
                        <Text style={styles.uploadPlaceholderText}>העלה תמונה</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="שם המוצר"
                            placeholderTextColor="#B0B0B0"
                            value={name}
                            onChangeText={setName}
                        />
                        <Feather name="tag" size={20} color="#B0B0B0" style={styles.inputIcon} />
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="מחיר (₪)"
                            placeholderTextColor="#B0B0B0"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                        <Feather name="dollar-sign" size={20} color="#B0B0B0" style={styles.inputIcon} />
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="מרחק"
                            placeholderTextColor="#B0B0B0"
                            keyboardType="numeric"
                            value={distance}
                            onChangeText={setDistance}
                        />
                        <Feather name="map-pin" size={20} color="#B0B0B0" style={styles.inputIcon} />
                    </View>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="קטגוריה (למשל: furniture)"
                            placeholderTextColor="#B0B0B0"
                            value={category}
                            onChangeText={setCategory}
                        />
                        <Feather name="grid" size={20} color="#B0B0B0" style={styles.inputIcon} />
                    </View>

                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleAdd}
                >
                    <Text style={styles.submitButtonText}>הוסף מוצר</Text>
                    <Feather name="plus-circle" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4A4A4A',
        flex: 1,
        textAlign: 'right',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    imagePreviewContainer: {
        alignSelf: 'center',
        width: 150,
        height: 150,
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadPlaceholder: {
        alignSelf: 'center',
        width: 150,
        height: 150,
        borderRadius: 15,
        backgroundColor: '#E9E9E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadPlaceholderText: {
        color: '#B0B0B0',
        marginTop: 10,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 45,
        paddingVertical: 12,
        fontSize: 16,
        textAlign: 'right',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    inputIcon: {
        position: 'absolute',
        right: 15,
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
    },
});
