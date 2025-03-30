import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/navigation-types';
import { useUser } from '../hooks/useUser';
import { useLocation } from '../hooks/useLocation';
import { format } from 'date-fns';
import {he} from 'date-fns/locale/he';


type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ProfileScreen({ navigation }: ProfileScreenProps): React.JSX.Element {
    const { user } = useUser();
    const { location } = useLocation();

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            </SafeAreaView>
        );
    }

    const registrationDate = user.registrationDate
        ? format(new Date(user.registrationDate), 'dd/MM/yyyy', { locale: he })
        : 'לא זמין';

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: user.profileImage || 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>פרטים אישיים</Text>

                    <View style={styles.profileItem}>
                        <Ionicons name="call" size={20} color="#666" />
                        <Text style={styles.profileItemText}>{user.phoneNumber || 'טלפון לא זמין'}</Text>
                    </View>

                    <View style={styles.profileItem}>
                        <Ionicons name="calendar" size={20} color="#666" />
                        <Text style={styles.profileItemText}>תאריך הצטרפות: {registrationDate}</Text>
                    </View>

                    <View style={styles.profileItem}>
                        <Ionicons name="person" size={20} color="#666" />
                        <Text style={styles.profileItemText}>מין: {user.gender === 'male' ? 'זכר' : user.gender === 'female' ? 'נקבה' : 'אחר'}</Text>
                    </View>

                    <View style={styles.profileItem}>
                        <Ionicons name="fitness" size={20} color="#666" />
                        <Text style={styles.profileItemText}>גיל: {user.age ?? 'לא זמין'}</Text>
                    </View>

                    <View style={styles.profileItem}>
                        <Ionicons name="location" size={20} color="#666" />
                        <Text style={styles.profileItemText}>
                            מיקום נוכחי: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'לא זמין'}
                        </Text>
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
        top: 100,
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
