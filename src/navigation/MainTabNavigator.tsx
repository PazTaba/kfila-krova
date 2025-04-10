import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CommunityScreen from '../screens/community/CommunityScreen';
import ConsultationStack from './ConsultationStack';
import MarketplaceStack from './MarketplaceStack';
import SlideHomeStack from './SlideHomeStack';
import JobsStack from './JobsStack';
import CommunityStack from './CommunityStack';

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
            <Tab.Screen name="Home" component={SlideHomeStack} />
            <Tab.Screen name="Marketplace" component={MarketplaceStack} />
            <Tab.Screen name="Consultation" component={ConsultationStack} />
            <Tab.Screen name="Jobs" component={JobsStack} />
            <Tab.Screen name="Community" component={CommunityStack} />
        </Tab.Navigator>
    );
}
