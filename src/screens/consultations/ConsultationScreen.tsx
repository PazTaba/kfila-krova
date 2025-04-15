import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Consultation } from '../../navigation/navigation-types';
import { useCategories } from '../../hooks/useCategories';
import ScreenTemplate from '../ScreenTemplate';

export default function ConsultationScreen({ navigation }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { categories } = useCategories();

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
                const allAnswers = consultation.answers || [];
                const topTwoAnswers = [...allAnswers]
                    .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
                    .slice(0, 2);

                return {
                    ...consultation,
                    answers: topTwoAnswers,
                    allAnswers, // שדה זמני רק לצורך ניווט למסך פרטים
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
        const temp = {
            ...consultation,
            answers: (consultation as any).allAnswers ?? consultation.answers, // 👈 פתרון זמני
        };

        navigation.navigate('ConsultationDetails', { consultation: temp });
    };


    const filteredConsultations = consultations.filter((consultation) => {
        const matchesSearch = consultation.question.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || consultation.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Render items for the ScreenTemplate
    const renderConsultations = () => {
        if (filteredConsultations.length === 0) {
            return null; // Empty state will be handled by the template
        }

        return filteredConsultations.map((consultation) => (
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
                        <Text style={styles.creatorText}>{consultation.author}</Text>
                        <Text style={styles.dateText}>
                            {formatDate(consultation.createdAt ?? "")}
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
        ));

    };

    const allCategories = [
        { _id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
        ...categories
    ];

    return (
        <ScreenTemplate
            type="list"
            title="התייעצויות"
            isLoading={isLoading}
            error={error}
            searchPlaceholder="חפש שאלות..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onRetry={fetchConsultations}
            renderItems={renderConsultations}
            onAddPress={() => navigation.navigate('AddConsultation')}
            addButtonLabel="שאל שאלה"
            emptyStateText="אין התייעצויות זמינות"
            emptyStateIcon="inbox"

            // Use the built-in category selector
            showCategorySelector={true}
            categories={allCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
        />
    );
}

const styles = StyleSheet.create({
    categoriesWrapper: {
        marginBottom: 10,
        paddingBottom: 5,
        zIndex: 1,
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
        zIndex: 0,
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
    noAnswersText: {
        color: '#718096',
        fontStyle: 'italic',
        textAlign: 'right',
        paddingVertical: 5,
    },
});