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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { RegisterRequestBody } from '../navigation/navigation-types';
import { RootStackParamList } from '../navigation/navigation-types';
import { LoginScreenProps } from '../navigation/navigation-types';
// Define types for API responses and request bodies



// Configuration for API endpoint
const API_BASE_URL = 'http://local:3000'; // Replace with your server's IP/domain

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
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                // Navigate to Home screen
                navigation.replace('Home');
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
type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;


function RegisterScreen({ navigation }: RegisterScreenProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('שגיאה', 'אנא מלא את כל השדות');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
            return;
        }

        setIsLoading(true);

        try {
            // Get current location
            const { status } = await Location.requestForegroundPermissionsAsync();
            let location;
            if (status === 'granted') {
                const locationResult = await Location.getCurrentPositionAsync({});
                location = {
                    latitude: locationResult.coords.latitude,
                    longitude: locationResult.coords.longitude
                };
            }

            // Prepare registration data
            const registrationData: RegisterRequestBody = {
                name,
                email,
                password,
                location,
                phoneNumber
            };

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and user info
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                Alert.alert('הרשמה', 'ההרשמה בוצעה בהצלחה', [
                    { text: 'אישור', onPress: () => navigation.replace('Login') }
                ]);
            } else {
                // Handle registration error
                Alert.alert('שגיאה', data.message || 'ההרשמה נכשלה');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('שגיאה', 'בעיית תקשורת עם השרת');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>הרשמה</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="שם מלא"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            textAlign="right"
                        />
                    </View>

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
                            name="call-outline"
                            size={24}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="מספר טלפון (אופציונלי)"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
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

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={24}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="אימות סיסמה"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isPasswordVisible}
                            textAlign="right"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>הירשם</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <TouchableOpacity onPress={() => navigation.replace('Login')}>
                            <Text style={styles.registerText}>התחברות</Text>
                        </TouchableOpacity>
                        <Text style={styles.registerPrompt}>יש לך כבר חשבון?</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Styles remain the same as in the previous version

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

export { LoginScreen, RegisterScreen };