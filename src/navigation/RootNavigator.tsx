import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import AddProductScreen from '../screens/AddProductScreen';
import MainTabNavigator from './MainTabNavigator';
import ConsultationStack from './ConsultationStack'; // הסטאק החדש של הייעוץ
import { RootStackParamList } from './navigation-types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="ConsultationStack" component={ConsultationStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
