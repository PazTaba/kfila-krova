// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { authStyles } from '../../styles/AuthStyles';
import * as Location from 'expo-location';

type AuthMode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    // ניקוי שגיאות קודמות
    setError('');

    // בדיקות תקינות
    if (mode === 'register') {
      // בדיקות הרשמה
      if (!name.trim()) {
        setError('אנא הזן שם מלא');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות');
        return;
      }
    }

    // בדיקת תקינות אימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('כתובת דוא"ל אינה תקינה');
      return;
    }

    // בדיקת תקינות סיסמה
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    try {
      // קבלת הרשאות מיקום
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('נדרשת הרשאת מיקום להמשך');
        return;
      }

      // קבלת מיקום נוכחי
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      if (mode === 'login') {
        // לוגיקת התחברות
        // await AuthService.login({ email, password });
        console.log('התחברות:', { email, password });
      } else {
        // לוגיקת הרשמה
        // await AuthService.register({ 
        //   name, 
        //   email, 
        //   password,
        //   location: { latitude, longitude }
        // });
        console.log('הרשמה:', { 
          name, 
          email, 
          password,
          location: { latitude, longitude }
        });
      }
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב');
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={authStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image 
          source={require('../assets/logo.png')} 
          style={authStyles.logo} 
        />

        {mode === 'register' && (
          <View style={authStyles.inputContainer}>
            <TextInput
              style={[authStyles.input, authStyles.inputRTL]}
              placeholder="שם מלא"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={authStyles.inputContainer}>
          <TextInput
            style={[authStyles.input, authStyles.inputRTL]}
            placeholder="דוא"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={authStyles.inputContainer}>
          <TextInput
            style={[authStyles.input, authStyles.inputRTL]}
            placeholder="סיסמה"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {mode === 'register' && (
          <View style={authStyles.inputContainer}>
            <TextInput
              style={[authStyles.input, authStyles.inputRTL]}
              placeholder="אימות סיסמה"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        )}

        {error ? (
          <Text style={authStyles.errorText}>{error}</Text>
        ) : null}

        <View style={authStyles.buttonContainer}>
          <TouchableOpacity 
            style={authStyles.button}
            onPress={handleAuth}
          >
            <Text style={authStyles.buttonText}>
              {mode === 'login' ? 'התחבר' : 'הירשם'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={authStyles.switchText}>
            {mode === 'login' 
              ? 'אין לך חשבון? הירשם' 
              : 'כבר יש לך חשבון? התחבר'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;