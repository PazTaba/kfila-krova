import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ImageBackground
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

// Sample data - in a real app, you would receive this from the previous screen or fetch it
const eventDetailsData = {
    id: 1,
    title: 'מפגש מתנדבים',
    date: '15 באפריל, 19:00',
    location: 'מרכז קהילתי תל אביב',
    participants: 42,
    image: require('../../../assets/event1.jpg'), // Replace with actual image path
    description: 'מפגש מתנדבים חודשי בו נסקור את ההישגים של החודש הקודם, נגדיר יעדים לחודש הקרוב ונקיים סדנה מיוחדת בנושא גיוס משאבים. המפגש פתוח לכל המתנדבים הפעילים בארגון.',
    organizer: 'אורי כהן',
    contact: '054-1234567',
    agenda: [
        'פתיחה וסקירת חודש קודם (30 דקות)',
        'הגדרת יעדים לחודש הקרוב (45 דקות)',
        'הפסקה (15 דקות)',
        'סדנת גיוס משאבים (60 דקות)',
        'שאלות ודיון פתוח (30 דקות)'
    ],
    attendees: [
        { id: 1, name: 'אורי כהן', avatar: require('../../../assets/avatar1.jpg'), role: 'מארגן' },
        { id: 2, name: 'שרה לוי', avatar: require('../../../assets/avatar2.jpg'), role: 'משתתפת' },

    ]
};

const contributorDetailsData = {
    id: 1,
    name: 'אורי כהן',
    points: 1245,
    role: 'מתנדב מצטיין',
    avatar: require('../../../assets/avatar1.jpg'), // Replace with actual avatar path
    joinDate: 'הצטרף לפני 2 שנים',
    bio: 'אורי הוא מתנדב פעיל בקהילה כבר שנתיים. הוא מוביל פרויקטים בתחום החינוך ומסייע בארגון אירועים קהילתיים. בעל ניסיון רב בגיוס משאבים ובניהול מתנדבים.',
    skills: ['ארגון אירועים', 'גיוס משאבים', 'הדרכה', 'ניהול פרויקטים'],
    recentActivities: [
        { id: 1, title: 'ארגון מפגש מתנדבים', date: '15 באפריל, 2025', points: 50 },
        { id: 2, title: 'הדרכת מתנדבים חדשים', date: '10 באפריל, 2025', points: 35 },
        { id: 3, title: 'השתתפות בסדנת הכשרה', date: '2 באפריל, 2025', points: 20 }
    ],
    badges: [
        { id: 1, name: 'מוביל קהילה', icon: '🏆' },
        { id: 2, name: 'מנטור', icon: '🧠' },
        { id: 3, name: 'יזם חברתי', icon: '💡' }
    ]
};

export default function CommunityDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('info');

    // In a real app, you would receive the type and id from the route params
    // const { type, id } = route.params;
    // For this example, let's assume we're viewing an event
    const type = 'event'; // or 'contributor'

    const renderEventDetails = () => (
        <View style={styles.detailsContainer}>
            <ImageBackground
                source={eventDetailsData.image}
                style={styles.headerImage}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>חזרה</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{eventDetailsData.title}</Text>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                        onPress={() => setActiveTab('info')}
                    >
                        <Text style={styles.tabText}>פרטים</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'agenda' && styles.activeTab]}
                        onPress={() => setActiveTab('agenda')}
                    >
                        <Text style={styles.tabText}>סדר יום</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'attendees' && styles.activeTab]}
                        onPress={() => setActiveTab('attendees')}
                    >
                        <Text style={styles.tabText}>משתתפים</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'info' && (
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoValue}>{eventDetailsData.date}</Text>
                            <Text style={styles.infoLabel}>תאריך ושעה:</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoValue}>{eventDetailsData.location}</Text>
                            <Text style={styles.infoLabel}>מיקום:</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoValue}>{eventDetailsData.participants} משתתפים</Text>
                            <Text style={styles.infoLabel}>משתתפים:</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoValue}>{eventDetailsData.organizer}</Text>
                            <Text style={styles.infoLabel}>מארגן:</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoValue}>{eventDetailsData.contact}</Text>
                            <Text style={styles.infoLabel}>יצירת קשר:</Text>
                        </View>

                        <Text style={styles.sectionTitle}>תיאור האירוע</Text>
                        <Text style={styles.description}>{eventDetailsData.description}</Text>

                        <TouchableOpacity style={styles.registerButton}>
                            <Text style={styles.registerButtonText}>הירשם לאירוע</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'agenda' && (
                    <View style={styles.agendaContainer}>
                        <Text style={styles.sectionTitle}>סדר יום</Text>
                        {eventDetailsData.agenda.map((item, index) => (
                            <View key={index} style={styles.agendaItem}>
                                <Text style={styles.agendaText}>{item}</Text>
                                <Text style={styles.agendaNumber}>{index + 1}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'attendees' && (
                    <View style={styles.attendeesContainer}>
                        <Text style={styles.sectionTitle}>משתתפים ({eventDetailsData.attendees.length})</Text>
                        {eventDetailsData.attendees.map((attendee) => (
                            <View key={attendee.id} style={styles.attendeeCard}>
                                <View style={styles.attendeeInfo}>
                                    <Text style={styles.attendeeName}>{attendee.name}</Text>
                                    <Text style={styles.attendeeRole}>{attendee.role}</Text>
                                </View>
                                <Image source={attendee.avatar} style={styles.attendeeAvatar} />
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    const renderContributorDetails = () => (
        <View style={styles.detailsContainer}>
            <View style={styles.contributorHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>חזרה</Text>
                </TouchableOpacity>
                <Image source={contributorDetailsData.avatar} style={styles.contributorAvatar} />
                <Text style={styles.contributorName}>{contributorDetailsData.name}</Text>
                <Text style={styles.contributorRole}>{contributorDetailsData.role}</Text>
                <View style={styles.pointsContainer}>
                    <Text style={styles.pointsValue}>{contributorDetailsData.points}</Text>
                    <Text style={styles.pointsLabel}>נקודות</Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                        onPress={() => setActiveTab('info')}
                    >
                        <Text style={styles.tabText}>פרופיל</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
                        onPress={() => setActiveTab('activities')}
                    >
                        <Text style={styles.tabText}>פעילויות</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
                        onPress={() => setActiveTab('badges')}
                    >
                        <Text style={styles.tabText}>הישגים</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'info' && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.joinDate}>{contributorDetailsData.joinDate}</Text>
                        <Text style={styles.sectionTitle}>אודות</Text>
                        <Text style={styles.description}>{contributorDetailsData.bio}</Text>

                        <Text style={styles.sectionTitle}>כישורים</Text>
                        <View style={styles.skillsContainer}>
                            {contributorDetailsData.skills.map((skill, index) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.contactButton}>
                            <Text style={styles.contactButtonText}>שלח הודעה</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'activities' && (
                    <View style={styles.activitiesContainer}>
                        <Text style={styles.sectionTitle}>פעילויות אחרונות</Text>
                        {contributorDetailsData.recentActivities.map((activity) => (
                            <View key={activity.id} style={styles.activityCard}>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityDate}>{activity.date}</Text>
                                </View>
                                <View style={styles.activityPoints}>
                                    <Text style={styles.activityPointsText}>{activity.points}+</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'badges' && (
                    <View style={styles.badgesContainer}>
                        <Text style={styles.sectionTitle}>הישגים ותגים</Text>
                        <View style={styles.badgesGrid}>
                            {contributorDetailsData.badges.map((badge) => (
                                <View key={badge.id} style={styles.badgeItem}>
                                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                    <Text style={styles.badgeName}>{badge.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {type === 'event' ? renderEventDetails() : renderContributorDetails()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    detailsContainer: {
        flex: 1,
    },
    headerImage: {
        height: 200,
        width: '100%',
    },
    overlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 16,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'right',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007bff',
    },
    tabText: {
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    infoContainer: {
        paddingVertical: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
        color: '#555',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'right',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        textAlign: 'right',
        marginBottom: 16,
    },
    registerButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    agendaContainer: {
        paddingVertical: 8,
    },
    agendaItem: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    agendaNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#007bff',
        textAlign: 'center',
        lineHeight: 30,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 12,
    },
    agendaText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        textAlign: 'right',
    },
    attendeesContainer: {
        paddingVertical: 8,
    },
    attendeeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    attendeeAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    attendeeInfo: {
        flex: 1,
        marginRight: 12,
        alignItems: 'flex-end',
    },
    attendeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    attendeeRole: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    contributorHeader: {
        backgroundColor: '#f0f8ff',
        padding: 16,
        alignItems: 'center',
        position: 'relative',
    },
    contributorAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginVertical: 16,
        borderWidth: 3,
        borderColor: '#fff',
    },
    contributorName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contributorRole: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
    },
    pointsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffc107',
        marginRight: 4,
    },
    pointsLabel: {
        fontSize: 14,
        color: '#666',
    },
    joinDate: {
        fontSize: 14,
        color: '#999',
        textAlign: 'right',
        marginBottom: 16,
    },
    skillsContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    skillBadge: {
        backgroundColor: '#e9f5ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        margin: 4,
    },
    skillText: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    contactButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    activitiesContainer: {
        paddingVertical: 8,
    },
    activityCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    activityDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    activityPoints: {
        backgroundColor: '#fff8e1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginLeft: 12,
    },
    activityPointsText: {
        color: '#ffc107',
        fontWeight: 'bold',
    },
    badgesContainer: {
        paddingVertical: 8,
    },
    badgesGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    badgeItem: {
        width: '30%',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        margin: 4,
        alignItems: 'center',
    },
    badgeIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    badgeName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
});