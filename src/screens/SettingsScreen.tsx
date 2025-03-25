import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/navigation-types';



type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function SettingsScreen({ navigation }: SettingsScreenProps): React.JSX.Element {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.screenTitle}>הגדרות</Text>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>הגדרות כלליות</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>התראות</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>מצב לילה</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={darkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>שיתוף מיקום</Text>
            <Switch
              value={locationSharingEnabled}
              onValueChange={setLocationSharingEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={locationSharingEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="log-out" size={24} color="white" />
          <Text style={styles.actionButtonText}>התנתק</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingsSection: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SettingsScreen;