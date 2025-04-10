// import React, { useState } from 'react';
// import { View, TextInput, Text, StyleSheet } from 'react-native';

// export default function JobForm() {
//     const [title, setTitle] = useState('');
//     const [company, setCompany] = useState('');
//     const [location, setLocation] = useState('');
//     const [salary, setSalary] = useState('');

//     return (
//         <View style={styles.container}>
//             <TextInput style={styles.input} placeholder="שם משרה" value={title} onChangeText={setTitle} />
//             <TextInput style={styles.input} placeholder="חברה" value={company} onChangeText={setCompany} />
//             <TextInput style={styles.input} placeholder="מיקום" value={location} onChangeText={setLocation} />
//             <TextInput style={styles.input} placeholder="שכר" value={salary} onChangeText={setSalary} keyboardType="numeric" />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { gap: 16 },
//     input: {
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 12,
//         fontSize: 16,
//         borderColor: '#ccc',
//         borderWidth: 1
//     }
// });
