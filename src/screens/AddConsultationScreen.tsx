import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddConsultationScreen() {
    const navigation = useNavigation<any>();
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddConsultation = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId || !question || !category) {
            Alert.alert('שגיאה', 'אנא מלא את כל השדות החובה');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://172.20.10.3:3000/consultations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    question,
                    category,
                    description,
                    location: {
                        latitude: 0,
                        longitude: 0,
                    },
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('הצלחה', 'השאלה נשלחה בהצלחה');
                navigation.goBack();
            } else {
                Alert.alert('שגיאה', data.message || 'אירעה שגיאה');
            }
        } catch (error) {
            console.error('❌ Error sending consultation:', error);
            Alert.alert('שגיאה', 'אירעה שגיאה בשליחה');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-right" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>שאל שאלה חדשה</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="הכנס את השאלה"
                        placeholderTextColor="#B0B0B0"
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                        textAlign="right"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="בחר קטגוריה"
                        placeholderTextColor="#B0B0B0"
                        value={category}
                        onChangeText={setCategory}
                        textAlign="right"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="הוסף תיאור נוסף (לא חובה)"
                        placeholderTextColor="#B0B0B0"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlign="right"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddConsultation}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Feather name="loader" size={24} color="white" />
                    ) : (
                        <>
                            <Text style={styles.addButtonText}>שלח שאלה</Text>
                            <Feather name="send" size={20} color="white" />
                        </>
                    )}
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
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    input: {
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#4A4A4A',
    },
    addButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginTop: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
    },
});
