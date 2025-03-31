// components/Sidebar.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableWithoutFeedback,
    Platform,
    Alert
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Sidebar = ({ user, setUser, navigation, toggleSidebar, handleLogout }:any) => {
    const [sidebarAnim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(sidebarAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, []);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('אין הרשאה', 'נדרשת הרשאה לגלריה כדי לבחור תמונה');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            const selectedUri = result.assets[0].uri;
            const updatedUser = { ...user, profileImage: selectedUri };
            setUser(updatedUser);
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        }
    };

    return (
        <TouchableWithoutFeedback onPress={toggleSidebar}>
            <View style={styles.sidebarOverlay}>
                <TouchableWithoutFeedback>
                    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                                <Image
                                    source={{ uri: user?.profileImage || 'https://via.placeholder.com/100' }}
                                    style={styles.profileImage}
                                />
                                <View style={styles.editProfileBadge}>
                                    <Feather name="edit-2" size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.userName}>{user?.name || 'משתמש'}</Text>
                            <Text style={styles.userEmail}>{user?.email || ''}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => {
                                navigation.navigate('Profile');
                                toggleSidebar();
                            }}
                        >
                            <View style={styles.sidebarIconContainer}>
                                <Ionicons name="person-outline" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sidebarItemText}>פרופיל</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => {
                                navigation.navigate('Settings');
                                toggleSidebar();
                            }}
                        >
                            <View style={styles.sidebarIconContainer}>
                                <Ionicons name="settings-outline" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sidebarItemText}>הגדרות</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => {
                                navigation.navigate('Favorites');
                                toggleSidebar();
                            }}
                        >
                            <View style={styles.sidebarIconContainer}>
                                <Ionicons name="heart-outline" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sidebarItemText}>מועדפים</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => {
                                navigation.navigate('History');
                                toggleSidebar();
                            }}
                        >
                            <View style={styles.sidebarIconContainer}>
                                <Ionicons name="time-outline" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sidebarItemText}>היסטוריה</Text>
                        </TouchableOpacity>

                        <View style={styles.sidebarDivider} />

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => {
                                toggleSidebar();
                                handleLogout();
                            }}
                        >
                            <View style={[styles.sidebarIconContainer, { backgroundColor: '#FF6B6B' }]}>
                                <Ionicons name="log-out-outline" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sidebarItemText}>התנתק</Text>
                        </TouchableOpacity>

                        <View style={styles.versionInfo}>
                            <Text style={styles.versionText}>גרסה 1.0.0</Text>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: Dimensions.get('window').width * 0.75,
        backgroundColor: 'white',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 16,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#6C5CE7',
    },
    editProfileBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#6C5CE7',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    sidebarIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#6C5CE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    sidebarItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
        marginHorizontal: 24,
    },
    sidebarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 15,
    },
    versionInfo: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#999',
    },
});

export default Sidebar;