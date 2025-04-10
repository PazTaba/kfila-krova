import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConsultationScreen from '../screens/consultations/ConsultationScreen';
import AddConsultationScreen from '../screens/consultations/AddConsultationScreen';
import ConsultationDetailsScreen from '../screens/consultations/ConsultationDetailsScreen';
import { ConsultationStackParamList } from './navigation-types';

const Stack = createNativeStackNavigator<ConsultationStackParamList>();

export default function ConsultationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Consultation" component={ConsultationScreen} />
      <Stack.Screen name="AddConsultation" component={AddConsultationScreen} />
      <Stack.Screen name="ConsultationDetails" component={ConsultationDetailsScreen} />
    </Stack.Navigator>
  );
}
