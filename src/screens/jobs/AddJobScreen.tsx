

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useUser } from '../../hooks/useUser';
import { useDraft } from '../../hooks/useDraft';
import { usePreferences } from '../../hooks/usePreferences';
import { useViewedItems } from '../../hooks/useViewedItems';


const JOB_INTERESTS = [
  { id: 'tech', name: 'טכנולוגיה', color: '#4ECDC4', icon: '💻' },
  { id: 'design', name: 'עיצוב', color: '#FF6B6B', icon: '🎨' },
  { id: 'marketing', name: 'שיווק', color: '#45B7D1', icon: '📊' },
  { id: 'management', name: 'ניהול', color: '#5D3FD3', icon: '👔' },
  { id: 'finance', name: 'פיננסים', color: '#2A9D8F', icon: '💰' },
  { id: 'healthcare', name: 'בריאות', color: '#F4A261', icon: '🏥' },
  { id: 'education', name: 'חינוך', color: '#9C6644', icon: '📚' },
  { id: 'sales', name: 'מכירות', color: '#588157', icon: '🤝' },
  { id: 'customerService', name: 'שירות לקוחות', color: '#BC4749', icon: '☎️' },
];

const JOB_TYPES = [
  { id: 'full', name: 'full' },
  { id: 'temp', name: 'temp' },
];

export default function AddJobScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { getDraft, saveDraft, clearDraft } = useDraft();
  const { preferences } = usePreferences();
  const { markAsViewed } = useViewedItems();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const draft = getDraft('job');
    if (draft) {
      setTitle(draft.title || '');
      setCompany(draft.company || '');
      setLocation(draft.location || '');
      setMinSalary(draft.minSalary || '');
      setMaxSalary(draft.maxSalary || '');
      setSelectedInterest(draft.selectedInterest || preferences.preferredCategories[0] || '');
      setSelectedType(draft.selectedType || '');
      setDescription(draft.description || '');
      setRequirements(draft.requirements || '');
      setContactEmail(draft.contactEmail || '');
      setContactPhone(draft.contactPhone || '');
    }
  }, []);

  useEffect(() => {
    saveDraft('job', {
      title, company, location, minSalary, maxSalary,
      selectedInterest, selectedType, description,
      requirements, contactEmail, contactPhone
    });
  }, [title, company, location, minSalary, maxSalary, selectedInterest, selectedType, description, requirements, contactEmail, contactPhone]);

  const handleSubmit = async () => {
    if (!title || !company || !location || !minSalary || !maxSalary || !selectedInterest || !selectedType) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות הנדרשים');
      return;
    }

    const requirementsArray = requirements
      ? requirements.split('\n').filter(item => item.trim() !== '')
      : [];

    const postedDate = new Date().toISOString();

    const newJob = {
      title,
      company,
      location,
      salary: `${minSalary}-${maxSalary} ₪`,
      interest: selectedInterest,
      type: selectedType,
      description,
      requirements: requirementsArray,
      contactEmail,
      contactPhone,
      postedDate
    };

    try {
      const response = await fetch(`http://172.20.10.3:3000/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בעת שליחת המשרה');
      }

      const data = await response.json();
      markAsViewed('jobs', data.id);
      clearDraft('job');

      Alert.alert('המשרה נוספה בהצלחה', 'המשרה נוספה למאגר המשרות', [
        { text: 'אישור', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('שגיאה בשליחת משרה:', error);
      Alert.alert('שגיאה', error.message || 'שגיאה לא צפויה');
    }
  };
  // Render the appropriate step based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>שלב 1/3: פרטי המשרה</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33%' }]} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>כותרת המשרה *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="לדוגמה: מפתח/ת Full Stack"
                  placeholderTextColor="#7A7A7A"
                  value={title}
                  onChangeText={setTitle}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>שם החברה *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="לדוגמה: סטארטאפ טכנולוגי"
                  placeholderTextColor="#7A7A7A"
                  value={company}
                  onChangeText={setCompany}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>מיקום *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="לדוגמה: תל אביב"
                  placeholderTextColor="#7A7A7A"
                  value={location}
                  onChangeText={setLocation}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>סוג משרה *</Text>
              <View style={styles.optionsContainer}>
                {JOB_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.optionButton,
                      selectedType === type.id && styles.selectedOption
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedType === type.id && styles.selectedOptionText
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.navigationButton, (!title || !company || !location || !selectedType) && styles.disabledButton]}
              onPress={() => setCurrentStep(2)}
              disabled={!title || !company || !location || !selectedType}
            >
              <Text style={styles.navigationButtonText}>הבא</Text>
              <Feather name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>שלב 2/3: תחום ושכר</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%' }]} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>תחום המשרה *</Text>
              <View style={styles.interestsGrid}>
                {JOB_INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.interestButton,
                      {
                        backgroundColor: selectedInterest === interest.id
                          ? interest.color
                          : '#f4f4f4'
                      }
                    ]}
                    onPress={() => setSelectedInterest(interest.id)}
                  >
                    <View style={styles.interestContent}>
                      <Text style={styles.interestIcon}>{interest.icon}</Text>
                      <Text
                        style={[
                          styles.interestName,
                          {
                            color: selectedInterest === interest.id
                              ? '#fff'
                              : '#4A4A4A'
                          }
                        ]}
                        numberOfLines={1}
                      >
                        {interest.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>משכורת (₪) *</Text>
              <View style={styles.salaryContainer}>
                <TextInput
                  style={styles.salaryInput}
                  placeholder="מקסימלי"
                  placeholderTextColor="#7A7A7A"
                  keyboardType="numeric"
                  value={maxSalary}
                  onChangeText={setMaxSalary}
                  textAlign="center"
                />
                <Text style={styles.salaryDivider}>-</Text>
                <TextInput
                  style={styles.salaryInput}
                  placeholder="מינימלי"
                  placeholderTextColor="#7A7A7A"
                  keyboardType="numeric"
                  value={minSalary}
                  onChangeText={setMinSalary}
                  textAlign="center"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={() => setCurrentStep(1)}
              >
                <Feather name="arrow-right" size={20} color="white" />
                <Text style={styles.navigationButtonText}>הקודם</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navigationButton, (!selectedInterest || !minSalary || !maxSalary) && styles.disabledButton]}
                onPress={() => setCurrentStep(3)}
                disabled={!selectedInterest || !minSalary || !maxSalary}
              >
                <Text style={styles.navigationButtonText}>הבא</Text>
                <Feather name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>שלב 3/3: פרטים נוספים</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>תיאור המשרה</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="פרט/י על המשרה, דרישות התפקיד והאחריות"
                placeholderTextColor="#7A7A7A"
                value={description}
                onChangeText={setDescription}
                textAlign="right"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>דרישות התפקיד</Text>
              <Text style={styles.helperText}>כל שורה תופיע כדרישה נפרדת</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="לדוגמה:
ניסיון של לפחות 3 שנים בתחום
יכולת עבודה בצוות"
                placeholderTextColor="#7A7A7A"
                value={requirements}
                onChangeText={setRequirements}
                textAlign="right"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>אימייל לשליחת קו״ח</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="דוא״ל"
                  placeholderTextColor="#7A7A7A"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  textAlign="right"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>טלפון</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="מספר טלפון"
                  placeholderTextColor="#7A7A7A"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  textAlign="right"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={() => setCurrentStep(2)}
              >
                <Feather name="arrow-right" size={20} color="white" />
                <Text style={styles.navigationButtonText}>הקודם</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>הוסף משרה</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-right" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הוספת משרה חדשה</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  formContainer: {
    padding: 20,
  },
  stepIndicator: {
    marginBottom: 20,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputRow: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 8,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#4A4A4A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#4A4A4A',
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  salaryDivider: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#4A4A4A',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  optionButton: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestButton: {
    width: '30%',
    height: 70,
    marginBottom: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  interestContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestIcon: {
    fontSize: 22,
    marginBottom: 5,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  navigationButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    flex: 1,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: '#7A7A7A',
    marginRight: 10,
    padding: 8,

  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
    shadowOpacity: 0.1,
  },
});