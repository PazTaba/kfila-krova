// AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/home/ProfileScreen';
import SettingsScreen from '../screens/home/SettingsScreen';

import { RootStackParamList } from './navigation-types';
import HomeScreen from '../screens/home/HomeScreen';
import ProductDetailsScreen from '../screens/marketplace/ProductDetailsScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import HistoryScreen from '../screens/home/HistoryScreen';
import AddProductScreen from '../screens/marketplace/AddProductScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function SlideHomeStack() {
  return (

    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Product" component={ProductDetailsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />

    </Stack.Navigator>
  );
}
