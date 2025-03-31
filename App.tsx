import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { RootStackParamList } from './src/navigation/navigation-types';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import MapScreen from './src/screens/MapScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { startBackgroundLocationUpdates } from './src/utils/backgroundLocation';

// AppProvider החדש שמאגד את כל הקונטקסטים
import { AppProvider } from './src/contexts/AppProvider';

import { useUser } from './src/hooks/useUser';

const Stack = createNativeStackNavigator<RootStackParamList>();

// עטיפה נפרדת – נטען ניווט רק אחרי טעינת Auth
const AppNavigator = () => {
  const { user, isLoading, token } = useUser();

  React.useEffect(() => {
    if (token) {
      startBackgroundLocationUpdates();
      console.log('🔐 Token loaded:', token);
    }
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={token ? 'MainTabs' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// עטיפת כל האפליקציה בקונטקסטים
export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
