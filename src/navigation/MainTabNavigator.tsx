import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// מסכים
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ConsultationScreen from '../screens/ConsultationScreen';
import JobsScreen from '../screens/JobsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import MarketplaceStack from './MarketplaceStack';


const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#ddd',
                    height: 60,
                },
                tabBarActiveTintColor: '#1E90FF',
                tabBarInactiveTintColor: 'gray',
                tabBarIcon: ({ color, size }) => {
                    let iconName: any;

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home-outline';
                            break;
                        case 'Marketplace':
                            iconName = 'cart-outline';
                            break;
                        case 'Help':
                            iconName = 'help-buoy-outline';
                            break;
                        case 'Consultation':
                            iconName = 'chatbox-ellipses-outline';
                            break;
                        case 'Jobs':
                            iconName = 'briefcase-outline';
                            break;
                        case 'Community':
                            iconName = 'people-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
            <Tab.Screen name="Marketplace" component={MarketplaceStack} options={{ title: 'Marketplace' }} />
            <Tab.Screen name="Consultation" component={ConsultationScreen} options={{ title: 'Consultation' }} />
            <Tab.Screen name="Jobs" component={JobsScreen} options={{ title: 'Jobs' }} />
            <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
            
        </Tab.Navigator>
    );
}
