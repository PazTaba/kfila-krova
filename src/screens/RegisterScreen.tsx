import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { RegisterScreenProps } from '../navigation/navigation-types';
import { User, Location as UserLocation, Gender } from '../types/User';
import { AuthResponse, ApiError } from '../types/api';
import { useLocation } from '../contexts/LocationContext';
import { updateUserLocation } from '../utils/updateUserLocation';
import { useUser } from '../hooks/useUser';


const API_BASE_URL = 'http://172.20.10.3:3000';

const GenderSelection = ({ selectedGender, onGenderChange }: {
    selectedGender: Gender;
    onGenderChange: (gender: Gender) => void;
}) => {
    const options: { value: Gender; label: string; icon: string }[] = [
        { value: 'male', label: 'זכר', icon: 'male' },
        { value: 'female', label: 'נקבה', icon: 'female' },
        { value: 'other', label: 'אחר', icon: 'transgender' },
    ];


    return (
        <View style={styles.genderContainer}>
            <View style={styles.genderButtonGroup}>
                {options.map((g) => (
                    <TouchableOpacity
                        key={g.value}
                        style={[styles.genderButton, selectedGender === g.value && styles.selectedGenderButton]}
                        onPress={() => onGenderChange(g.value)}
                    >
                        <Ionicons
                            name={`${g.icon}-outline` as any}
                            size={24}
                            color={selectedGender === g.value ? 'white' : '#007BFF'}
                        />
                        <Text style={[
                            styles.genderButtonText,
                            selectedGender === g.value && styles.selectedGenderButtonText,
                        ]}>
                            {g.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

function RegisterScreen({ navigation }: RegisterScreenProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>('other');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useUser();
    const { setLocation } = useLocation();


    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword || !age) {
            Alert.alert('שגיאה', 'יש למלא את כל השדות החובה');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
            return;
        }

        const parsedAge = parseInt(age);
        if (isNaN(parsedAge) || parsedAge <= 0) {
            Alert.alert('שגיאה', 'יש להזין גיל תקין');
            return;
        }

        setIsLoading(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            let userLocation: UserLocation | undefined;

            if (status === 'granted') {
                const result = await Location.getCurrentPositionAsync({});
                userLocation = {
                    latitude: result.coords.latitude,
                    longitude: result.coords.longitude,
                };

                await updateUserLocation(setLocation); // שמירה גם ב־AsyncStorage וגם בקונטקסט

            }

            const body = {
                name,
                email,
                password,
                gender,
                age: parsedAge,
                phoneNumber,
                location: userLocation,
            };

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: AuthResponse | ApiError = await response.json();

            if (response.ok) {
                const { user, token } = data as AuthResponse;
                await login(user, token); // שמירה ב־Context
                navigation.replace('MainTabs'); // מעבר אוטומטי ל־Home
            } else {
                const { message } = data as ApiError;
                Alert.alert('שגיאה', message || 'שגיאת שרת');
            }
        } catch (err) {
            console.error('Register error:', err);
            Alert.alert('שגיאה', 'תקלה בתקשורת עם השרת');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>הרשמה</Text>
                    <Input icon="person-outline" placeholder="שם מלא" value={name} onChangeText={setName} />
                    <Input icon="mail-outline" placeholder="דוא״ל" value={email} onChangeText={setEmail} />
                    <Input icon="call-outline" placeholder="טלפון (אופציונלי)" value={phoneNumber} onChangeText={setPhoneNumber} />
                    <Input icon="calendar-outline" placeholder="גיל" value={age} onChangeText={setAge} keyboardType="numeric" />
                    <GenderSelection selectedGender={gender} onGenderChange={setGender} />
                    <PasswordInput
                        placeholder="סיסמה"
                        value={password}
                        onChangeText={setPassword}
                        visible={isPasswordVisible}
                        toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
                    />
                    <PasswordInput
                        placeholder="אימות סיסמה"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        visible={isPasswordVisible}
                        toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleRegister} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>הירשם</Text>}
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

const Input = ({ icon, ...props }: { icon: string } & TextInput['props']) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={24} color="#666" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholderTextColor="#666" textAlign="right" {...props} />
    </View>
);

const PasswordInput = ({ placeholder, value, onChangeText, visible, toggleVisibility }: any) => (
    <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
            placeholder={placeholder}
            placeholderTextColor="#666"
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!visible}
            textAlign="right"
        />
        <TouchableOpacity onPress={toggleVisibility} style={styles.showPasswordButton}>
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={24} color="#666" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loginContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
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
    inputIcon: { paddingHorizontal: 10 },
    input: { flex: 1, height: 50, paddingHorizontal: 10, fontSize: 16 },
    showPasswordButton: { paddingHorizontal: 10 },
    loginButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    registerContainer: { flexDirection: 'row-reverse', justifyContent: 'center', marginTop: 20 },
    registerPrompt: { marginLeft: 5, color: '#666' },
    registerText: { color: '#007BFF', fontWeight: 'bold' },
    genderContainer: {
        marginBottom: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    genderLabel: { fontSize: 16, color: '#333', marginBottom: 10, textAlign: 'right' },
    genderButtonGroup: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
    genderButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '30%',
    },
    selectedGenderButton: { backgroundColor: '#007BFF' },
    genderButtonText: { marginRight: 5, color: '#007BFF', fontWeight: 'bold' },
    selectedGenderButtonText: { color: 'white' },
});

export { RegisterScreen };