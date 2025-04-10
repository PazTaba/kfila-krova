import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import the template and custom components
import ScreenTemplate from '../ScreenTemplate';
import FiltersModal from '../../components/FiltersModal';

// Hooks
import { useJobs } from '../../hooks/useJobs';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFavorites } from '../../hooks/useFavorites';
import { useUser } from '../../hooks/useUser';
import { useCategories } from '../../hooks/useCategories';

export default function JobsScreen() {
  const navigation = useNavigation<any>();
  const { jobs, fetchJobs } = useJobs();
  const { isLoading } = useUser();
  const { trackScreen, trackSearch, trackFilterApplied, trackItemView } = useAnalytics();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { categories } = useCategories();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [filteredJobs, setFilteredJobs] = useState(jobs || []);

  // Track screen view
  useEffect(() => {
    trackScreen('JobsScreen');
  }, []);

  // Fetch jobs when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  // Filter jobs when dependencies change
  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory, activeFilters]);

  const filterJobs = () => {
    if (!jobs) return;
    let filtered = [...jobs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => job.title.toLowerCase().includes(term));
      trackSearch(searchTerm, filtered.length);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.interest === selectedCategory);
    }

    // Apply other filters
    if (activeFilters.minSalary) {
      filtered = filtered.filter(job => {
        const min = parseInt(job.salary.split('-')[0].replace(/[^\d]/g, ''));
        return min >= activeFilters.minSalary;
      });
    }

    if (activeFilters.maxSalary) {
      filtered = filtered.filter(job => {
        const max = parseInt(job.salary.split('-')[1].replace(/[^\d]/g, ''));
        return max <= activeFilters.maxSalary;
      });
    }

    setFilteredJobs(filtered);
  };

  const navigateToJobDetails = (job: any) => {
    trackItemView(job._id, 'job');
    navigation.navigate('JobDetails', { job });
  };

  // Render job cards 
  const renderJobs = () => {
    if (filteredJobs.length === 0) {
      return null; // Empty state is handled by the template
    }

    return filteredJobs.map((job) => (
      <TouchableOpacity
        key={job._id}
        style={styles.jobCard}
        activeOpacity={0.7}
        onPress={() => navigateToJobDetails(job)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => toggleFavorite('jobs', job._id)}>
            <Ionicons
              name={isFavorite('jobs', job._id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite('jobs', job._id) ? '#FF6B6B' : '#999'}
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
    ));
  };

  // Prepare categories with "all" option
  const allCategories = [
    { _id: 'all', name: 'הכל', icon: '🌐', color: '#4A90E2' },
    ...categories
  ];

  return (
    <>
      <ScreenTemplate
        type="list"
        title="💼 עבודות"
        isLoading={isLoading}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="חפש משרות..."
        emptyStateText={searchTerm ? 'לא נמצאו משרות תואמות לחיפוש' : 'אין משרות בקטגוריה זו'}
        headerRight={
          <TouchableOpacity onPress={() => setIsFiltersModalVisible(true)}>
            <Ionicons name="filter" size={24} color="#4A4A4A" style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        }
        renderItems={renderJobs}
        onAddPress={() => navigation.navigate('AddJob')}
        addButtonLabel="הוסף משרה"

        // Use the built-in category selector instead of topSection
        showCategorySelector={true}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <FiltersModal
        visible={isFiltersModalVisible}
        onClose={() => setIsFiltersModalVisible(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          trackFilterApplied(filters);
          setIsFiltersModalVisible(false);
        }}
        onReset={() => {
          setActiveFilters({});
          setIsFiltersModalVisible(false);
        }}
        initialValues={activeFilters}
        modalTitle="סינון משרות"
        filterSections={[
          {
            label: 'טווח שכר',
            inputs: [
              { key: 'minSalary', placeholder: 'שכר מינימלי', type: 'numeric' },
              { key: 'maxSalary', placeholder: 'שכר מקסימלי', type: 'numeric' },
            ]
          }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});