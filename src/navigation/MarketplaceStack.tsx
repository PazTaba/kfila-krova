import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import AddProductScreen from '../screens/marketplace/AddProductScreen';
import ProductDetailsScreen from '../screens/marketplace/ProductDetailsScreen';

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
