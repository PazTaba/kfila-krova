import React, { useState } from 'react';
import { 
  ScrollView, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from 'react-native';

// Sample community data
const communityData = {
  events: [
    {
      id: 1,
      title: 'מפגש מתנדבים',
      date: '15 באפריל, 19:00',
      location: 'מרכז קהילתי תל אביב',
      participants: 42,
      image: require('../../assets/event1.jpg') // Replace with actual image path
    },
    {
      id: 2,
      title: 'סדנת הכשרה מקצועית',
      date: '22 באפריל, 18:30',
      location: 'אולם וובינר מקוון',
      participants: 28,
      image: require('../../assets/event2.jpg') // Replace with actual image path
    }
  ],
  groups: [
    {
      id: 1,
      name: 'מתנדבים צעירים',
      members: 156,
      description: 'קבוצת מתנדבים למען הקהילה',
      icon: '🤝'
    },
    {
      id: 2,
      name: 'יזמים חברתיים',
      members: 87,
      description: 'רשת יזמים הפועלים לשינוי חברתי',
      icon: '💡'
    }
  ],
  topContributors: [
    {
      id: 1,
      name: 'אורי כהן',
      points: 1245,
      role: 'מתנדב מצטיין',
      avatar: require('../../assets/avatar1.jpg') // Replace with actual avatar path
    },
    {
      id: 2,
      name: 'שרה לוי',
      points: 1102,
      role: 'מנהיגת קהילה',
      avatar: require('../../assets/avatar2.jpg') // Replace with actual avatar path
    }
  ]
};

export default function CommunityScreen() {
  const [activeSection, setActiveSection] = useState('events');

  const renderEvents = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>אירועים קרובים</Text>
      {communityData.events.map(event => (
        <TouchableOpacity 
          key={event.id} 
          style={styles.eventCard}
          onPress={() => {/* Navigate to event details */}}
        >
          <Image source={event.image} style={styles.eventImage} />
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventSubtitle}>{event.date}</Text>
            <Text style={styles.eventSubtitle}>{event.location}</Text>
            <Text style={styles.eventParticipants}>
              {event.participants} משתתפים
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGroups = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>קבוצות קהילה</Text>
      {communityData.groups.map(group => (
        <TouchableOpacity 
          key={group.id} 
          style={styles.groupCard}
          onPress={() => {/* Navigate to group details */}}
        >
          <Text style={styles.groupIcon}>{group.icon}</Text>
          <View style={styles.groupDetails}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDescription}>{group.description}</Text>
            <Text style={styles.groupMembers}>
              {group.members} חברים
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTopContributors = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>מתנדבים מובילים</Text>
      {communityData.topContributors.map(contributor => (
        <TouchableOpacity 
          key={contributor.id} 
          style={styles.contributorCard}
          onPress={() => {/* Navigate to contributor profile */}}
        >
          <Image 
            source={contributor.avatar} 
            style={styles.contributorAvatar} 
          />
          <View style={styles.contributorDetails}>
            <Text style={styles.contributorName}>{contributor.name}</Text>
            <Text style={styles.contributorRole}>{contributor.role}</Text>
            <Text style={styles.contributorPoints}>
              {contributor.points} נקודות
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👨‍👩‍👧‍👦 קהילה</Text>
      
      {/* Section Navigation */}
      <View style={styles.sectionNavigation}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            activeSection === 'events' && styles.activeNavButton
          ]}
          onPress={() => setActiveSection('events')}
        >
          <Text style={styles.navButtonText}>אירועים</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            activeSection === 'groups' && styles.activeNavButton
          ]}
          onPress={() => setActiveSection('groups')}
        >
          <Text style={styles.navButtonText}>קבוצות</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            activeSection === 'contributors' && styles.activeNavButton
          ]}
          onPress={() => setActiveSection('contributors')}
        >
          <Text style={styles.navButtonText}>מובילים</Text>
        </TouchableOpacity>
      </View>

      {/* Render Active Section */}
      {activeSection === 'events' && renderEvents()}
      {activeSection === 'groups' && renderGroups()}
      {activeSection === 'contributors' && renderTopContributors()}
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
  sectionNavigation: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#f4f4f4',
  },
  activeNavButton: {
    backgroundColor: '#007bff',
  },
  navButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  eventDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventParticipants: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  groupDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
  },
  contributorCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contributorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  contributorDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contributorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contributorRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contributorPoints: {
    fontSize: 12,
    color: '#ffc107',
    marginTop: 4,
  },
});