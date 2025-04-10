import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function ProductForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="שם מוצר" value={name} onChangeText={setName} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="תיאור" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.input} placeholder="מחיר" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="קטגוריה" value={category} onChangeText={setCategory} />
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
