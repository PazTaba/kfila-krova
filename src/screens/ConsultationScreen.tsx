import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Consultation } from '../navigation/navigation-types';





export default function ConsultationScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchTerm, setSearchTerm] = useState('');
    const [consultations, setConsultations] = useState<Consultation[]>([
        {
            id: '1',
            question: 'איזה מחשב נייד כדאי לקנות לסטודנט בתקציב מוגבל?',
            answers: ['מומלץ על Lenovo IdeaPad', 'Dell Inspiron מעולה גם כן'],
            likes: 24,
            category: 'מחשבים'
        },
        {
            id: '2',
            question: 'איפה כדאי לטייל בארץ בחורף?',
            answers: ['אילת מעולה', 'מומלץ על טיול בנגב'],
            likes: 17,
            category: 'טיולים'
        }
    ]);

    const openConsultationDetails = (consultation: Consultation) => {
        navigation.navigate('ConsultationDetails', { consultation });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>התייעצות</Text>
            </View>

            <View style={styles.searchContainer}>
                <Feather 
                    name="search" 
                    size={20} 
                    color="#B0B0B0" 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="חפש שאלות..."
                    placeholderTextColor="#B0B0B0"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {consultations.map((consultation) => (
                    <TouchableOpacity 
                        key={consultation.id} 
                        style={styles.consultationCard}
                        activeOpacity={0.7}
                        onPress={() => openConsultationDetails(consultation)} // הוספנו פונקציית לחיצה
                    >
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
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>שאל שאלה</Text>
                <Feather name="plus-circle" size={20} color="white" />
            </TouchableOpacity>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4A4A4A',
        flex: 1,
        textAlign: 'right',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        textAlign: 'right',
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
    addButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
    },
});