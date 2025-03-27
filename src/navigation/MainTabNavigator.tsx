import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ConsultationScreen from '../screens/ConsultationScreen'; // כאן אתה יכול להוסיף את מסך הייעוץ
import JobsScreen from '../screens/JobsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ConsultationStack from './ConsultationStack';
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Marketplace" component={MarketplaceStack} />
            <Tab.Screen name="Consultation" component={ConsultationStack} />
            <Tab.Screen name="Jobs" component={JobsScreen} />
            <Tab.Screen name="Community" component={CommunityScreen} />
        </Tab.Navigator>
    );
}
