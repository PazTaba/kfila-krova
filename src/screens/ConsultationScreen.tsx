import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Consultation } from '../navigation/navigation-types';

const CONSULTATION_CATEGORIES = [
    { id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
    { id: 'health', name: 'בריאות', icon: '🏥', color: '#FF6B6B' },
    { id: 'relationships', name: 'יחסים', icon: '❤️', color: '#4ECDC4' },
    { id: 'career', name: 'קריירה', icon: '💼', color: '#45B7D1' },
    { id: 'personal', name: 'אישי', icon: '🤔', color: '#FFA07A' },
    { id: 'finance', name: 'כספים', icon: '💰', color: '#5D3FD3' },
    { id: 'technology', name: 'טכנולוגיה', icon: '💻', color: '#2A9D8F' },
    { id: 'education', name: 'חינוך', icon: '📚', color: '#F4A261' },
    { id: 'legal', name: 'משפטי', icon: '⚖️', color: '#9C6644' },
];

export default function ConsultationScreen() {
    const navigation = useNavigation<any>();
    const [searchTerm, setSearchTerm] = useState('');
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const fetchConsultations = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://172.20.10.3:3000/consultations');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Received data is not an array');
            }

            const processedConsultations: Consultation[] = data.map((consultation: any) => {
                const sortedAnswers = (consultation.answers || [])
                  .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
                //   .slice(0, 2);
                return {
                  ...consultation,
                  answers: sortedAnswers
                };
              });
              
            setConsultations(processedConsultations);
            setError(null);
        } catch (error) {
            console.error('❌ שגיאה בטעינת התייעצויות:', error);
            setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
            setConsultations([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const openConsultationDetails = (consultation: Consultation) => {
        navigation.navigate('ConsultationDetails', { consultation }); // שולח את כל התשובות
    };
    

    const filteredConsultations = consultations.filter((consultation) => {
        const matchesSearch = consultation.question.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || consultation.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C6BED" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Feather name="alert-triangle" size={50} color="#FF6B6B" style={styles.errorIcon} />
                <Text style={styles.errorText}>נכשלה טעינת ההתייעצויות</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
                <TouchableOpacity onPress={fetchConsultations} style={styles.retryButton}>
                    <Feather name="refresh-cw" size={16} color="white" style={styles.retryIcon} />
                    <Text style={styles.retryButtonText}>נסה שוב</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>התייעצויות</Text>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="חפש שאלות..."
                    placeholderTextColor="#A0AEC0"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
                style={styles.categoriesScrollContainer}
            >
                {CONSULTATION_CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isSelected ? category.color : '#f4f4f4' }
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryName,
                                        { color: isSelected ? '#fff' : '#4A4A4A' }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {category.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {filteredConsultations.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Feather name="inbox" size={50} color="#CBD5E0" />
                    <Text style={styles.emptyStateText}>אין התייעצויות זמינות</Text>
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                >
                    {filteredConsultations.map((consultation) => (
                        <TouchableOpacity
                            key={consultation._id}
                            style={styles.consultationCard}
                            activeOpacity={0.8}
                            onPress={() => openConsultationDetails(consultation)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.categoryBadge}>{consultation.category}</Text>
                                <Text style={styles.questionText}>{consultation.question}</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <View style={styles.metadataContainer}>
                                    <Text style={styles.creatorText}>{consultation.creator}</Text>
                                    <Text style={styles.dateText}>
                                        {formatDate(consultation.createdAt)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.answersContainer}>
                                {consultation.answers && consultation.answers.length > 0 ? (
                                    consultation.answers.map((answer, index) => (
                                        <View
                                            key={answer.id}
                                            style={[
                                                styles.answerItem,
                                                index === 0 ? styles.topAnswer : null
                                            ]}
                                        >
                                            <Feather
                                                name="check-circle"
                                                size={20}
                                                color="#48BB78"
                                                style={styles.checkIcon}
                                            />
                                            <View style={styles.answerContent}>
                                                <Text style={styles.answerText}>{answer.text}</Text>
                                                <View style={styles.likesContainer}>
                                                    <Feather 
                                                        name="thumbs-up" 
                                                        size={12} 
                                                        color="#718096" 
                                                        style={styles.likeIcon}
                                                    />
                                                    <Text style={styles.answerLikes}>
                                                        {answer.likes}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noAnswersText}>אין תשובות עם לייקים</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddConsultation')}
            >
                <Text style={styles.addButtonText}>שאל שאלה</Text>
                <Feather name="plus-circle" size={20} color="white" style={styles.addButtonIcon} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'right',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginVertical: 15,
        borderRadius: 12,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#2D3748',
        textAlign: 'right',
    },
    categoriesScrollContainer: {
        maxHeight: 100,
        backgroundColor: 'white',
    },
    categoriesContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
    },
    categoryButton: {
        width: 90,
        height: 70,
        marginHorizontal: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIcon: { fontSize: 22, marginBottom: 5 },
    categoryName: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    consultationCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    categoryBadge: {
        backgroundColor: '#E6F2FF',
        color: '#2C6BED',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 10,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        textAlign: 'right',
        lineHeight: 24,
    },
    metadataContainer: {
        alignItems: 'flex-start',
        marginLeft: 'auto',
    },
    creatorText: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 3,
    },
    dateText: {
        fontSize: 12,
        color: '#718096',
    },
    answersContainer: {
        marginTop: 10,
    },
    answerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
    },
    topAnswer: {
        borderWidth: 1,
        borderColor: '#48BB78',
    },
    checkIcon: {
        marginLeft: 10,
    },
    answerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    answerText: {
        flex: 1,
        color: '#2D3748',
        fontSize: 14,
        textAlign: 'right',
        marginRight: 10,
        lineHeight: 20,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeIcon: {
        marginRight: 4,
    },
    answerLikes: {
        color: '#718096',
        fontSize: 12,
    },
    addButton: {
        backgroundColor: '#2C6BED',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 15,
        marginBottom: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C6BED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonIcon: {
        marginLeft: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F7FAFC',
    },
    errorIcon: {
        marginBottom: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#E53E3E',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2C6BED',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    retryIcon: {
        marginRight: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#718096',
        marginTop: 15,
    },
    noAnswersText: {
        color: '#718096',
        fontStyle: 'italic',
        textAlign: 'right',
        paddingVertical: 5,
    },
});