import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Share,
    SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// Define the JobDetails type
interface JobDetails {
    id: number;
    title: string;
    company: string;
    type: string;
    location: string;
    salary: string;
    interest: string;
    description?: string;
    requirements?: string[];
    contactEmail?: string;
    contactPhone?: string;
    postedDate?: string;
}

// Define the route params type
type RouteParams = {
    JobDetails: {
        job: JobDetails;
    };
};

export default function JobDetailsScreen() {
    const route = useRoute<RouteProp<RouteParams, 'JobDetails'>>();
    const navigation = useNavigation();
    const { job } = route.params;

    // Function to get the interest color based on job interest
    const getInterestColor = (interest: string): string => {
        const interestColors: { [key: string]: string } = {
            'tech': '#4ECDC4',
            'design': '#FF6B6B',
            'marketing': '#45B7D1',
            'management': '#5D3FD3',
            'finance': '#2A9D8F',
            'healthcare': '#F4A261',
            'education': '#9C6644',
            'sales': '#588157',
            'customerService': '#BC4749',
        };
        return interestColors[interest] || '#4A90E2';
    };

    // Function to get the interest icon based on job interest
    const getInterestIcon = (interest: string): string => {
        const interestIcons: { [key: string]: string } = {
            'tech': '💻',
            'design': '🎨',
            'marketing': '📊',
            'management': '👔',
            'finance': '💰',
            'healthcare': '🏥',
            'education': '📚',
            'sales': '🤝',
            'customerService': '☎️',
        };
        return interestIcons[interest] || '🌐';
    };

    // Function to get the interest name in Hebrew
    const getInterestName = (interest: string): string => {
        const interestNames: { [key: string]: string } = {
            'tech': 'טכנולוגיה',
            'design': 'עיצוב',
            'marketing': 'שיווק',
            'management': 'ניהול',
            'finance': 'פיננסים',
            'healthcare': 'בריאות',
            'education': 'חינוך',
            'sales': 'מכירות',
            'customerService': 'שירות לקוחות',
        };
        return interestNames[interest] || 'כללי';
    };

    // Get the mock description if not provided
    const jobDescription = job.description || 'אנחנו מחפשים מועמד/ת מוכשר/ת ומנוסה לתפקיד זה. המועמד/ת האידיאלי/ת יהיה בעל/ת ניסיון בתחום, יכולת עבודה עצמאית, ומיומנויות תקשורת מצוינות. התפקיד כולל אחריות על פיתוח וניהול פרויקטים, עבודה בצוות, ופתרון בעיות מורכבות.';

    // Get the mock requirements if not provided
    const jobRequirements = job.requirements || [
        'ניסיון של לפחות 3 שנים בתחום',
        'יכולת עבודה בצוות',
        'יכולת למידה עצמאית',
        'יכולת עבודה תחת לחץ',
        'שליטה בכלים רלוונטיים',
    ];

    // Function to share the job
    const shareJob = async () => {
        try {
            await Share.share({
                message: `משרה: ${job.title} בחברת ${job.company}. שכר: ${job.salary}. מיקום: ${job.location}`,
                title: `שיתוף משרה: ${job.title}`,
            });
        } catch (error) {
            console.error('Error sharing job:', error);
        }
    };

    // Function to handle job application
    const applyForJob = () => {

        alert('תודה על הגשת המועמדות! נחזור אליך בהקדם.');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-right" size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>פרטי משרה</Text>
                    <TouchableOpacity onPress={shareJob} style={styles.shareButton}>
                        <Feather name="share-2" size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.companyName}>{job.company}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                            <Feather name="map-pin" size={18} color="#4A4A4A" />
                            <Text style={styles.detailText}>{job.location}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Feather name="clock" size={18} color="#4A4A4A" />
                            <Text style={styles.detailText}>{job.type}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Feather name="dollar-sign" size={18} color="#4A4A4A" />
                            <Text style={styles.detailText}>{job.salary}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailText}>{getInterestIcon(job.interest)}</Text>
                            <Text style={[styles.detailText, { color: getInterestColor(job.interest) }]}>
                                {getInterestName(job.interest)}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Feather name="calendar" size={18} color="#4A4A4A" />
                            <Text style={styles.detailText}>{new Date(job.postedDate ?? "").toLocaleDateString('he-IL')}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>תיאור המשרה</Text>
                        <Text style={styles.sectionContent}>{jobDescription}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>דרישות התפקיד</Text>
                        {jobRequirements.map((requirement, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <Feather name="check" size={18} color="#4A90E2" />
                                <Text style={styles.requirementText}>{requirement}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>פרטי קשר</Text>
                        <View style={styles.contactItem}>
                            <Feather name="mail" size={18} color="#4A4A4A" />
                            <Text style={styles.contactText}>{job.contactEmail || 'jobs@' + job.company.toLowerCase().replace(/\s/g, '') + '.co.il'}</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Feather name="phone" size={18} color="#4A4A4A" />
                            <Text style={styles.contactText}>{job.contactPhone || '03-123-4567'}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.saveButton}>
                        <Feather name="bookmark" size={20} color="#4A90E2" />
                        <Text style={styles.saveButtonText}>שמור</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={applyForJob}>
                        <Text style={styles.applyButtonText}>הגש מועמדות</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 30,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    shareButton: {
        padding: 8,
    },
    scrollContent: {
        padding: 16,
    },
    jobHeader: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A4A4A',
        textAlign: 'right',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 18,
        color: '#7A7A7A',
        textAlign: 'right',
    },
    detailsContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'flex-end',
    },
    detailText: {
        fontSize: 16,
        color: '#4A4A4A',
        marginRight: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 12,
        textAlign: 'right',
    },
    sectionContent: {
        fontSize: 16,
        color: '#7A7A7A',
        lineHeight: 24,
        textAlign: 'right',
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'flex-end',
    },
    requirementText: {
        fontSize: 16,
        color: '#7A7A7A',
        marginRight: 8,
        textAlign: 'right',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'flex-end',
    },
    contactText: {
        fontSize: 16,
        color: '#7A7A7A',
        marginRight: 8,
    },
    actionContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        padding: 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 12,
        flex: 1,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
        marginRight: 8,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flex: 2,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});