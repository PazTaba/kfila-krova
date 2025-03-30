import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';

export type MarketplaceStackParamList = {
  Marketplace: undefined;
  AddProduct: undefined;
  Products:undefined
};

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="Products" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}
