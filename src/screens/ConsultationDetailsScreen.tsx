import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ConsultationDetailsScreenRouteProp,
    ConsultationDetailsScreenNavigationProp,
    Answer,
} from '../navigation/navigation-types';

export default function ConsultationDetailsScreen() {
    const route = useRoute<ConsultationDetailsScreenRouteProp>();
    const navigation = useNavigation<ConsultationDetailsScreenNavigationProp>();
    const { consultation } = route.params;

    const [newAnswer, setNewAnswer] = useState('');
    const [answers, setAnswers] = useState<Answer[]>(consultation.answers || []); // מחזיק את כל התשובות
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const getUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserName(user.name || 'משתמש אנונימי');
            }
        };
        getUserData();
    }, []);

    const addAnswer = async () => {
        if (!newAnswer.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://172.20.10.3:3000/consultations/${consultation._id}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: newAnswer,
                    author: userName,
                    createdAt: new Date().toISOString(),
                    likes: 0, // Start with 0 likes
                }),
            });

            const data = await response.json();

            if (response.ok && data.answer) {
                setAnswers((prev) => [data.answer, ...prev]);
                setNewAnswer('');
            } else {
                Alert.alert('שגיאה', data.message || 'אירעה שגיאה בשליחת התשובה');
            }
        } catch (error) {
            console.error('❌ שגיאה בשליחת תשובה:', error);
            Alert.alert('שגיאה', 'אירעה שגיאה בשרת');
        } finally {
            setIsSubmitting(false);
        }
    };

    const sortedAnswers = [...answers].sort((a, b) => (b.likes || 0) - (a.likes || 0)); 

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-right" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>פרטי שאלה</Text>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <View style={styles.consultationCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryBadge}>{consultation.category}</Text>
                        <View style={styles.likesContainer}>
                            <Feather name="thumbs-up" size={16} color="#4A90E2" />
                            <Text style={styles.likesText}>{consultation.likes}</Text>
                        </View>
                    </View>

                    <Text style={styles.questionText}>{consultation.question}</Text>
                </View>

                {sortedAnswers.length > 0 ? (
                    sortedAnswers.map((answer, index) => (
                        <View 
                            key={answer.id} 
                            style={[
                                styles.answerCard, 
                                index === 0 ? styles.topAnswerCard : null
                            ]}
                        >
                            <View style={styles.answerCardHeader}>
                                <View style={styles.answerLikesContainer}>
                                    <Feather name="thumbs-up" size={16} color="#4A90E2" />
                                    <Text style={styles.answerLikesText}>{answer.likes || 0}</Text>
                                </View>
                                {index === 0 && (
                                    <Feather 
                                        name="check-circle" 
                                        size={20} 
                                        color="#4CAF50" 
                                        style={styles.topAnswerBadge} 
                                    />
                                )}
                            </View>
                            <Text style={styles.answerCardText}>{answer.text}</Text>
                            {answer.createdAt && (
                                <Text style={styles.answerCardMeta}>
                                    נכתב ב־{new Date(answer.createdAt).toLocaleDateString('he-IL')}
                                    {` על ידי ${answer.author || 'משתמש אנונימי'}`}
                                </Text>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noAnswersText}>אין תשובות עדיין</Text>
                )}
            </ScrollView>

            <View style={styles.replyInputContainer}>
                <TouchableOpacity style={styles.sendButton} onPress={addAnswer} disabled={isSubmitting}>
                    <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.replyInput}
                    placeholder="הוסף תשובה..."
                    placeholderTextColor="#B0B0B0"
                    value={newAnswer}
                    onChangeText={setNewAnswer}
                    editable={!isSubmitting}
                    multiline
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        marginRight: 'auto',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4A4A4A',
        marginLeft: 'auto',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    consultationCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
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
        marginBottom: 10,
    },
    categoryBadge: {
        backgroundColor: '#E6F2FF',
        color: '#4A90E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        fontSize: 12,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likesText: {
        marginLeft: 5,
        color: '#4A4A4A',
        fontSize: 14,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
        textAlign: 'right',
    },
    answerCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topAnswerCard: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    answerCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    answerLikesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    answerLikesText: {
        marginLeft: 5,
        color: '#4A4A4A',
        fontSize: 14,
    },
    topAnswerBadge: {
        marginLeft: 10,
    },
    answerCardText: {
        fontSize: 14,
        color: '#4A4A4A',
        textAlign: 'right',
        marginBottom: 5,
    },
    answerCardMeta: {
        fontSize: 12,
        color: '#B0B0B0',
        textAlign: 'right',
    },
    noAnswersText: {
        textAlign: 'center',
        color: '#B0B0B0',
        marginTop: 20,
        fontSize: 16,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    replyInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        marginRight: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        fontSize: 14,
        textAlign: 'right',
    },
    sendButton: {
        backgroundColor: '#4A90E2',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});