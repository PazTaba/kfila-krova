import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface FiltersModalProps {
    showFiltersModal: boolean;
    setShowFiltersModal: (show: boolean) => void;
    selectedCategories: string[];
    toggleCategory: (category: string) => void;
    selectedSort: string;
    setSelectedSort: (sort: string) => void;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
    showFiltersModal,
    setShowFiltersModal,
    selectedCategories,
    toggleCategory,
    selectedSort,
    setSelectedSort
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showFiltersModal}
            onRequestClose={() => setShowFiltersModal(false)}
        >
            <TouchableWithoutFeedback onPress={() => setShowFiltersModal(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>סנן תוצאות</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowFiltersModal(false)}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.filterCategoryTitle}>קטגוריות</Text>

                                <View style={styles.filterOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            selectedCategories.includes('all') && styles.filterChipSelected
                                        ]}
                                        onPress={() => toggleCategory('all')}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategories.includes('all') && styles.filterChipTextSelected
                                        ]}>הכל</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            selectedCategories.includes('food') && styles.filterChipSelected
                                        ]}
                                        onPress={() => toggleCategory('food')}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategories.includes('food') && styles.filterChipTextSelected
                                        ]}>מזון</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            selectedCategories.includes('clothing') && styles.filterChipSelected
                                        ]}
                                        onPress={() => toggleCategory('clothing')}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategories.includes('clothing') && styles.filterChipTextSelected
                                        ]}>בגדים</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            selectedCategories.includes('electronics') && styles.filterChipSelected
                                        ]}
                                        onPress={() => toggleCategory('electronics')}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategories.includes('electronics') && styles.filterChipTextSelected
                                        ]}>אלקטרוניקה</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            selectedCategories.includes('furniture') && styles.filterChipSelected
                                        ]}
                                        onPress={() => toggleCategory('furniture')}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategories.includes('furniture') && styles.filterChipTextSelected
                                        ]}>ריהוט</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.filterCategoryTitle}>מיון לפי</Text>

                                <View style={styles.sortOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.sortOption,
                                            selectedSort === 'distance' && styles.sortOptionSelected
                                        ]}
                                        onPress={() => setSelectedSort('distance')}
                                    >
                                        <Ionicons
                                            name="location"
                                            size={20}
                                            color={selectedSort === 'distance' ? "#fff" : "#6C5CE7"}
                                        />
                                        <Text style={[
                                            styles.sortOptionText,
                                            selectedSort === 'distance' && styles.sortOptionTextSelected
                                        ]}>מרחק</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.sortOption,
                                            selectedSort === 'popularity' && styles.sortOptionSelected
                                        ]}
                                        onPress={() => setSelectedSort('popularity')}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={20}
                                            color={selectedSort === 'popularity' ? "#fff" : "#6C5CE7"}
                                        />
                                        <Text style={[
                                            styles.sortOptionText,
                                            selectedSort === 'popularity' && styles.sortOptionTextSelected
                                        ]}>פופולריות</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.sortOption,
                                            selectedSort === 'newest' && styles.sortOptionSelected
                                        ]}
                                        onPress={() => setSelectedSort('newest')}
                                    >
                                        <Ionicons
                                            name="time"
                                            size={20}
                                            color={selectedSort === 'newest' ? "#fff" : "#6C5CE7"}
                                        />
                                        <Text style={[
                                            styles.sortOptionText,
                                            selectedSort === 'newest' && styles.sortOptionTextSelected
                                        ]}>חדש</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => setShowFiltersModal(false)}
                                >
                                    <Text style={styles.applyButtonText}>החל סינון</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6C5CE7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBody: {
        padding: 24,
    },
    filterCategoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6C5CE7',
        marginRight: 12,
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    filterChipSelected: {
        backgroundColor: '#6C5CE7',
        borderColor: '#6C5CE7',
    },
    filterChipText: {
        color: '#6C5CE7',
        fontWeight: '500',
    },
    filterChipTextSelected: {
        color: 'white',
    },
    sortOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#6C5CE7',
        flex: 1,
        marginHorizontal: 6,
        justifyContent: 'center',
    },
    sortOptionSelected: {
        backgroundColor: '#6C5CE7',
    },
    sortOptionText: {
        color: '#6C5CE7',
        fontWeight: '500',
        marginLeft: 8,
    },
    sortOptionTextSelected: {
        color: 'white',
    },
    applyButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default FiltersModal;