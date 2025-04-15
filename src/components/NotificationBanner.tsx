// src/components/NotificationBanner.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Platform,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'event';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    expiresAt?: Date;
    dismissible?: boolean;
    action?: {
        label: string;
        onPress: () => void;
    };
}

interface NotificationBannerProps {
    notification: Notification;
    onDismiss?: (id: string) => void;
    autoDismiss?: boolean;
    autoDismissTimeout?: number;
    position?: 'top' | 'bottom';
    style?: object;
}

const getNotificationStyles = (type: NotificationType) => {
    const styles = {
        info: {
            startColor: '#6C5CE7',
            endColor: '#a29bfe',
            icon: 'info'
        },
        success: {
            startColor: '#2ECC71',
            endColor: '#4ECDC4',
            icon: 'check-circle'
        },
        warning: {
            startColor: '#F39C12',
            endColor: '#F4A261',
            icon: 'alert-triangle'
        },
        error: {
            startColor: '#E74C3C',
            endColor: '#FF6B6B',
            icon: 'alert-octagon'
        },
        event: {
            startColor: '#9B59B6',
            endColor: '#D6A2E8',
            icon: 'calendar'
        }
    };

    return styles[type];
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({
    notification,
    onDismiss,
    autoDismiss = true,
    autoDismissTimeout = 5000,
    position = 'top',
    style
}) => {
    const [slideAnim] = useState(new Animated.Value(position === 'top' ? -200 : 200));
    const [isDismissed, setIsDismissed] = useState(false);
    const [hasBeenSeen, setHasBeenSeen] = useState(false);

    useEffect(() => {
        const checkIfSeen = async () => {
            const seenNotifications = await AsyncStorage.getItem('seenNotifications');
            const seenArray = seenNotifications ? JSON.parse(seenNotifications) : [];

            if (seenArray.includes(notification.id)) {
                setHasBeenSeen(true);
                setIsDismissed(true);
                return;
            }

            // Show notification animation
            showNotification();
        };

        checkIfSeen();
    }, [notification.id]);

    useEffect(() => {
        if (notification.expiresAt) {
            const now = new Date();
            const expiry = new Date(notification.expiresAt);

            if (now > expiry) {
                setIsDismissed(true);
            }
        }
    }, [notification.expiresAt]);

    useEffect(() => {
        if (autoDismiss && !isDismissed && !hasBeenSeen) {
            const timer = setTimeout(() => {
                dismissNotification();
            }, autoDismissTimeout);

            return () => clearTimeout(timer);
        }
    }, [autoDismiss, isDismissed, hasBeenSeen]);

    const showNotification = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true
        }).start();
    };

    const dismissNotification = async () => {
        Animated.timing(slideAnim, {
            toValue: position === 'top' ? -200 : 200,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true
        }).start(() => {
            setIsDismissed(true);

            if (onDismiss) {
                onDismiss(notification.id);
            }
        });

        // Mark notification as seen
        try {
            const seenNotifications = await AsyncStorage.getItem('seenNotifications');
            const seenArray = seenNotifications ? JSON.parse(seenNotifications) : [];

            if (!seenArray.includes(notification.id)) {
                seenArray.push(notification.id);
                await AsyncStorage.setItem('seenNotifications', JSON.stringify(seenArray));
            }

            setHasBeenSeen(true);
        } catch (error) {
            console.error('Error saving seen notification:', error);
        }
    };

    if (isDismissed) {
        return null;
    }

    const notificationStyle = getNotificationStyles(notification.type);

    return (
        <Animated.View
            style={[
                styles.container,
                position === 'top' ? styles.topPosition : styles.bottomPosition,
                { transform: [{ translateY: slideAnim }] },
                style
            ]}
        >
            <LinearGradient
                colors={[notificationStyle.startColor, notificationStyle.endColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    <Feather name={notificationStyle.icon} size={24} color="white" style={styles.icon} />

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{notification.title}</Text>
                        <Text style={styles.message}>{notification.message}</Text>
                    </View>

                    {notification.dismissible !== false && (
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={dismissNotification}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <Feather name="x" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {notification.action && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            notification.action?.onPress();
                            dismissNotification();
                        }}
                    >
                        <Text style={styles.actionButtonText}>{notification.action.label}</Text>
                        <Feather name="chevron-left" size={18} color="white" />
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: width - 32,
        alignSelf: 'center',
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    topPosition: {
        top: Platform.OS === 'ios' ? 50 : 30,
    },
    bottomPosition: {
        bottom: Platform.OS === 'ios' ? 90 : 70,
    },
    gradient: {
        padding: 16,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'right',
    },
    message: {
        color: 'white',
        fontSize: 14,
        opacity: 0.9,
        textAlign: 'right',
    },
    closeButton: {
        padding: 4,
    },
    actionButton: {
        marginTop: 12,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default NotificationBanner;