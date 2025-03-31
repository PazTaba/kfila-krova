import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import JobsScreen from '../screens/JobsScreen';
import AddJobScreen from '../screens/AddJobScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';

export type MarketplaceStackParamList = {
    Job: undefined;
    AddJob: undefined;
    JobDetails: undefined;

};

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function JobsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            

            <Stack.Screen name="Job" component={JobsScreen} />
            <Stack.Screen name="JobDetails" component={JobDetailsScreen} />

            <Stack.Screen name="AddJob" component={AddJobScreen} />
        </Stack.Navigator>
    );
}
