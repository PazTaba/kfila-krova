import React, { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConsultationForm() {
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const loadDraft = async () => {
            const draft = await AsyncStorage.getItem('consultationDraft');
            if (draft) {
                const data = JSON.parse(draft);
                setQuestion(data.question || '');
                setCategory(data.category || '');
                setDescription(data.description || '');
            }
        };
        loadDraft();
    }, []);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="שאלה"
                value={question}
                onChangeText={setQuestion}
            />
            <TextInput
                style={styles.input}
                placeholder="קטגוריה"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="תיאור נוסף"
                value={description}
                onChangeText={setDescription}
                multiline
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 16 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderColor: '#ccc',
        borderWidth: 1
    }
});
