import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/navigation-types';



type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ProfileScreen({ navigation }: ProfileScreenProps): React.JSX.Element {
    const [user] = useState({
        name: 'ישראל ישראלי',
        profileImage: 'https://example.com/profile.jpg',
        email: 'israel@example.com',
        phone: '054-1234567',
        address: 'תל אביב, ישראל',
        joinDate: '01/01/2023'
    });

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: user.profileImage }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>פרטים אישיים</Text>
                    <View style={styles.profileItem}>
                        <Ionicons name="call" size={20} color="#666" />
                        <Text style={styles.profileItemText}>{user.phone}</Text>
                    </View>
                    <View style={styles.profileItem}>
                        <Ionicons name="location" size={20} color="#666" />
                        <Text style={styles.profileItemText}>{user.address}</Text>
                    </View>
                    <View style={styles.profileItem}>
                        <Ionicons name="calendar" size={20} color="#666" />
                        <Text style={styles.profileItemText}>תאריך הצטרפות: {user.joinDate}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.editProfileButton}>
                    <Text style={styles.editProfileButtonText}>ערוך פרופיל</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    profileSection: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'right',
    },
    profileItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileItemText: {
        marginRight: 10,
        fontSize: 16,
    },
    editProfileButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    editProfileButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;