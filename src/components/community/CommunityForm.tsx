import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function CommunityForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('event');

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="כותרת" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="תיאור" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.input} placeholder="סוג פריט (event / group / contributor)" value={type} onChangeText={setType} />
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

