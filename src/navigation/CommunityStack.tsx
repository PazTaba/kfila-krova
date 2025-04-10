import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import CommunityScreen from '../screens/community/CommunityScreen';
import AddCommunityScreen from '../screens/community/AddCommunityScreen';
import CommunityDetailsScreen from '../screens/community/CommunityDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function CommunityStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="AddCommunity" component={AddCommunityScreen} />
            <Stack.Screen name="CommunityDetails" component={CommunityDetailsScreen} />
        </Stack.Navigator>
    );
}
