import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expanded job interest areas with type definition
interface JobInterest {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  salary: string;
  interest: string;
  description: string;
  requirements: string[];
  contactEmail: string;
  contactPhone: string;
  postedDate: string;
  createdAt: string;
}


// Salary filter interface
interface SalaryFilters {
  minSalary?: number;
  maxSalary?: number;
}

// Job Interests Constants
const JOB_INTERESTS: JobInterest[] = [
  { id: 'all', name: 'הכל', color: '#4A90E2', icon: '🌐' },
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



export default function JobsScreen() {
  const navigation = useNavigation<any>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [jobInterest, setJobInterest] = useState<string>('all');
  const [jobType, setJobType] = useState<string>('all');
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<SalaryFilters>({});
  const [jobsData, setJobsData] = useState<Job[]>();
  const [favoriteJobs, setFavoriteJobs] = useState<string[]>([]);

  useEffect(() => {
    loadFavoriteJobs();
  }, []);

  const loadFavoriteJobs = async () => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) setFavoriteJobs(JSON.parse(data));
  };

  const toggleFavoriteJob = async (jobId: string) => {
    let updatedFavorites = [...favoriteJobs];
    if (favoriteJobs.includes(jobId)) {
      updatedFavorites = updatedFavorites.filter(id => id !== jobId);
    } else {
      updatedFavorites.push(jobId);
    }
    setFavoriteJobs(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };


  // Filters Modal Component
  const FiltersModal: React.FC = () => {
    const [minSalary, setMinSalary] = useState<string>('');
    const [maxSalary, setMaxSalary] = useState<string>('');

    const applyFilters = () => {
      const filters: SalaryFilters = {
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
      };
      setActiveFilters(filters);
      setIsFiltersModalVisible(false);
    };
    useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch('http://172.20.10.3:3000/jobs'); // שים כאן את כתובת ה-API שלך
          const data = await response.json();
          setJobsData(data);
        } catch (error) {
          console.error('שגיאה בטעינת המשרות:', error);
        }
      };

      fetchJobs();
    }, []);


    const resetFilters = () => {
      setMinSalary('');
      setMaxSalary('');
      setActiveFilters({});
      setIsFiltersModalVisible(false);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFiltersModalVisible}
        onRequestClose={() => setIsFiltersModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>סינון משרות</Text>
              <TouchableOpacity onPress={() => setIsFiltersModalVisible(false)}>
                <Feather name="x" size={24} color="#4A4A4A" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.filtersContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>טווח משכורת</Text>
                <View style={styles.salaryInputContainer}>
                  <TextInput
                    style={styles.salaryInput}
                    placeholder="משכורת מקסימלית"
                    placeholderTextColor="#7A7A7A"
                    keyboardType="numeric"
                    value={maxSalary}
                    onChangeText={setMaxSalary}
                  />
                  <TextInput
                    style={styles.salaryInput}
                    placeholder="משכורת מינימלית"
                    placeholderTextColor="#7A7A7A"
                    keyboardType="numeric"
                    value={minSalary}
                    onChangeText={setMinSalary}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>אפס סינונים</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>החל סינונים</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // Filter jobs based on search, interest, type, and salary
  const filteredJobs = jobsData?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInterest = jobInterest === 'all' || job.interest === jobInterest;
    const matchesType = jobType === 'all' || job.type === jobType;

    const matchesSalaryMin = activeFilters.minSalary === undefined ||
      parseFloat(job.salary.split('-')[0].replace(',', '')) >= activeFilters.minSalary;

    const matchesSalaryMax = activeFilters.maxSalary === undefined ||
      parseFloat(job.salary.split('-')[1].replace(',', '')) <= activeFilters.maxSalary;

    return matchesSearch && matchesInterest && matchesType && matchesSalaryMin && matchesSalaryMax;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsFiltersModalVisible(true)}>
          <Feather
            name="filter"
            size={24}
            color="#4A4A4A"
            style={{ marginLeft: 15 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💼 עבודות</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="חפש משרות..."
          placeholderTextColor="#7A7A7A"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScrollContainer}
      >
        {JOB_INTERESTS.map((interest) => {
          const isSelected = jobInterest === interest.id;
          return (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.categoryButton,
                { backgroundColor: isSelected ? interest.color : '#f4f4f4' }
              ]}
              onPress={() => setJobInterest(interest.id)}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>{interest.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    { color: isSelected ? '#fff' : '#4A4A4A' }
                  ]}
                  numberOfLines={1}
                >
                  {interest.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>


      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        style={styles.jobsScrollView}
      >
        {filteredJobs?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchTerm
                ? 'לא נמצאו משרות תואמות לחיפוש'
                : 'אין משרות בקטגוריה זו'}
            </Text>
          </View>
        ) : (
          filteredJobs?.map((job) => (
            <TouchableOpacity
              key={job._id}
              style={styles.jobCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('JobDetails', { job })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => toggleFavoriteJob(job._id)}>
                  <Ionicons
                    name={favoriteJobs.includes(job._id) ? 'heart' : 'heart-outline'}
                    size={22}
                    color={favoriteJobs.includes(job._id) ? '#FF6B6B' : '#999'}
                  />
                </TouchableOpacity>
                <Text style={styles.jobTitle}>{job.title}</Text>
              </View>

              <View style={styles.jobDetails}>
                <Text style={styles.jobDetailText}>{job.company}</Text>
                <Text style={styles.jobDetailText}>{job.location}</Text>
                <Text style={styles.jobTypeText}>{job.type}</Text>
                <Text style={styles.salaryText}>{job.salary}</Text>
              </View>
            </TouchableOpacity>

          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddJob')}
      >
        <Text style={styles.addButtonText}>הוסף משרה</Text>
        <Feather name="plus-circle" size={20} color="white" />
      </TouchableOpacity>

      {/* Filters Modal */}
      <FiltersModal />
    </View>
  );
}

// Styles remain the same as in the original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9'
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
    textAlign: 'right'
  },
  scrollViewContent: {
    padding: 20
  },
  typesScrollContainer: {
    maxHeight: 100,
    backgroundColor: 'white',
  },
  jobsScrollView: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  jobDetails: {
    alignItems: 'flex-end',
  },
  jobDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  jobTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
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
    marginRight: 10
  },
  typesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7A7A7A'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 50,
    textAlign: 'right',
    fontSize: 16,
    color: '#4A4A4A'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingTop: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A'
  },
  filtersContent: {
    padding: 20
  },
  filterSection: {
    marginBottom: 20
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 10
  },
  salaryInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  salaryInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    textAlign: 'right'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  resetButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#F4F4F4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  resetButtonText: {
    color: '#4A4A4A',
    fontWeight: '600'
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  interestsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  interestButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  interestsScrollContainer: {
    maxHeight: 100,
    backgroundColor: 'white',
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  categoriesScrollContainer: {
    maxHeight: 100,
    backgroundColor: 'white',
  },
  categoryButton: {
    width: 90,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

});