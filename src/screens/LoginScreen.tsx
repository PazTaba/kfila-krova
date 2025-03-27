import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreenProps } from "../navigation/navigation-types"
import { updateUserLocation } from '../utils/location';

// Configuration for API endpoint
const API_BASE_URL = 'http://172.20.10.3:3000'; // Replace with your server's IP/domain




function LoginScreen({ navigation }: LoginScreenProps): React.JSX.Element {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert('שגיאה', 'אנא מלא את כל השדות');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and user info
                await updateUserLocation();
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                await AsyncStorage.setItem('token', data.token);
                console.log(data.token)
                await AsyncStorage.setItem('userId', data.user.id);


                // Navigate to Home screen
                navigation.replace('MainTabs');


            } else {
                // Handle login error
                Alert.alert('שגיאה', data.message || 'התחברות נכשלה');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('שגיאה', 'בעיית תקשורת עם השרת');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>התחברות</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={24}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="דואל"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            textAlign="right"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={24}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="סיסמה"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            textAlign="right"
                        />
                        <TouchableOpacity
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={styles.showPasswordButton}
                        >
                            <Ionicons
                                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>התחבר</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <TouchableOpacity onPress={navigateToRegister}>
                            <Text style={styles.registerText}>הרשמה</Text>
                        </TouchableOpacity>
                        <Text style={styles.registerPrompt}>אין לך חשבון?</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    inputIcon: {
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    showPasswordButton: {
        paddingHorizontal: 10,
    },
    loginButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerPrompt: {
        marginLeft: 5,
        color: '#666',
    },
    registerText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
});

export { LoginScreen };