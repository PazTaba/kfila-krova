import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput,
    ScrollView,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { 
    useRoute, 
    useNavigation 
} from '@react-navigation/native';
import { 
    ConsultationDetailsScreenRouteProp, 
    ConsultationDetailsScreenNavigationProp 
} from '../navigation/navigation-types';

type Consultation = {
    id: string;
    question: string;
    answers: string[];
    likes: number;
    category: string;
};

type Reply = {
    id: string;
    text: string;
    author: string;
    likes: number;
};

export default function ConsultationDetailsScreen() {
    const route = useRoute<ConsultationDetailsScreenRouteProp>();
    const navigation = useNavigation<ConsultationDetailsScreenNavigationProp>();
    const { consultation } = route.params;

    const [newReply, setNewReply] = useState('');
    const [replies, setReplies] = useState<Reply[]>([
        {
            id: '1',
            text: 'אכן, Lenovo IdeaPad מעולה למטרה זו',
            author: 'משתמש 1',
            likes: 5
        },
        {
            id: '2',
            text: 'אני ממליץ לבדוק גם את המפרט המדויק של המחשב',
            author: 'משתמש 2',
            likes: 3
        }
    ]);

    const addReply = () => {
        if (newReply.trim()) {
            const reply: Reply = {
                id: String(replies.length + 1),
                text: newReply,
                author: 'משתמש נוכחי',
                likes: 0
            };
            setReplies([...replies, reply]);
            setNewReply('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-right" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>פרטי שיחה</Text>
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.consultationCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryBadge}>
                            {consultation.category}
                        </Text>
                        <View style={styles.likesContainer}>
                            <Feather name="thumbs-up" size={16} color="#4A90E2" />
                            <Text style={styles.likesText}>{consultation.likes}</Text>
                        </View>
                    </View>

                    <Text style={styles.questionText}>
                        {consultation.question}
                    </Text>

                    <View style={styles.answersContainer}>
                        {consultation.answers.map((answer, index) => (
                            <View key={index} style={styles.answerItem}>
                                <Feather name="check-circle" size={16} color="#4CAF50" />
                                <Text style={styles.answerText}>{answer}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.repliesTitle}>תגובות</Text>

                {replies.map((reply) => (
                    <View key={reply.id} style={styles.replyCard}>
                        <View style={styles.replyHeader}>
                            <Text style={styles.replyAuthor}>{reply.author}</Text>
                            <View style={styles.likesContainer}>
                                <Feather name="thumbs-up" size={14} color="#4A90E2" />
                                <Text style={styles.likesText}>{reply.likes}</Text>
                            </View>
                        </View>
                        <Text style={styles.replyText}>{reply.text}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.replyInputContainer}>
                <TouchableOpacity 
                    style={styles.sendButton} 
                    onPress={addReply}
                >
                    <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.replyInput}
                    placeholder="הוסף תגובה..."
                    placeholderTextColor="#B0B0B0"
                    value={newReply}
                    onChangeText={setNewReply}
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
        marginBottom: 10,
        textAlign: 'right',
    },
    answersContainer: {
        marginTop: 10,
    },
    answerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        justifyContent: 'flex-end',
    },
    answerText: {
        marginLeft: 8,
        color: '#7A7A7A',
        fontSize: 14,
    },
    repliesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 10,
        textAlign: 'right',
    },
    replyCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    replyAuthor: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4A4A4A',
    },
    replyText: {
        fontSize: 14,
        color: '#7A7A7A',
        textAlign: 'right',
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