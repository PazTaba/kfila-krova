import React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function HelpScreen() {
  const helpSections = [
    {
      title: 'שאלות נפוצות',
      items: [
        'איך משתמשים באפליקציה?',
        'כיצד ניתן לאפס סיסמה?',
        'מה עושים אם נתקלים בבעיה?'
      ]
    },
    {
      title: 'דרכי תמיכה',
      items: [
        'צור קשר עם התמיכה הטכנית',
        'שלח דוח תקלה',
        'המדריך המלא למשתמש'
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🤝 עזרה</Text>
      
      {helpSections.map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={itemIndex} 
              style={styles.helpItem}
              onPress={() => {/* Handle item press */}}
            >
              <Text style={styles.helpItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'right' 
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
    color: '#333'
  },
  helpItem: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  helpItemText: {
    textAlign: 'right',
    color: '#333',
    fontSize: 16
  }
});