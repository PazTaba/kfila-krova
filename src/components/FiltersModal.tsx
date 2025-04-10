import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    TextInput
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface FilterInput {
    key: string;
    placeholder?: string;
    type?: 'text' | 'numeric';
}

interface FilterSection {
    label: string;
    inputs: FilterInput[];
}

interface FiltersModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: Record<string, any>) => void;
    onReset: () => void;
    modalTitle?: string;
    children?: React.ReactNode;

    initialValues?: Record<string, any>;
    filterSections?: FilterSection[];

    selectedCategories?: string[];
    toggleCategory?: (category: string) => void;
    selectedSort?: string;
    setSelectedSort?: (sort: string) => void;
    showDefaultFilters?: boolean;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
    visible,
    onClose,
    onApply,
    onReset,
    modalTitle = 'סנן תוצאות',
    children,
    initialValues = {},
    filterSections = [],
    selectedCategories = [],
    toggleCategory,
    selectedSort,
    setSelectedSort,
    showDefaultFilters = false
}) => {
    const memoizedInitialValues = useMemo(() => initialValues, [JSON.stringify(initialValues)]);
    const [formState, setFormState] = useState<Record<string, any>>(memoizedInitialValues);

    useEffect(() => {
        setFormState(memoizedInitialValues);
    }, [memoizedInitialValues]);

    const handleInputChange = (key: string, value: string) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        const cleaned: Record<string, any> = {};
        for (const key in formState) {
            const val = formState[key];
            const num = Number(val);
            cleaned[key] = isNaN(num) || val === '' ? val : num;
        }
        onApply(cleaned);
    };

    const renderDynamicFilters = () => {
        if (!filterSections.length) return null;

        return (
            <>
                {filterSections.map((section, index) => (
                    <View key={index} style={{ marginBottom: 20 }}>
                        <Text style={styles.sectionLabel}>{section.label}</Text>
                        {section.inputs.map(input => (
                            <TextInput
                                key={input.key}
                                style={styles.input}
                                placeholder={input.placeholder}
                                keyboardType={input.type === 'numeric' ? 'numeric' : 'default'}
                                value={formState[input.key]?.toString() || ''}
                                onChangeText={text => handleInputChange(input.key, text)}
                            />
                        ))}
                    </View>
                ))}
            </>
        );
    };

    const renderDefaultFilters = () => {
        if (!showDefaultFilters) return null;

        return (
            <View>
                <Text style={{ fontWeight: 'bold' }}>קטגוריות</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 10 }}>
                    {selectedCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => toggleCategory?.(cat)}
                            style={{
                                padding: 10,
                                backgroundColor: '#eee',
                                borderRadius: 8
                            }}
                        >
                            <Text>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={{ fontWeight: 'bold' }}>מיון לפי</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    {['distance', 'priceLowToHigh', 'priceHighToLow'].map((sort) => (
                        <TouchableOpacity
                            key={sort}
                            onPress={() => setSelectedSort?.(sort)}
                            style={{
                                padding: 10,
                                backgroundColor: selectedSort === sort ? '#6C5CE7' : '#eee',
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: selectedSort === sort ? 'white' : 'black' }}>
                                {sort === 'distance' ? 'מרחק' :
                                    sort === 'priceLowToHigh' ? 'מחיר עולה' :
                                        'מחיר יורד'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{modalTitle}</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.modalBody}>
                                {children ? children : (
                                    <>
                                        {renderDynamicFilters()}
                                        {renderDefaultFilters()}
                                    </>
                                )}
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.actionButton, styles.reset]} onPress={onReset}>
                                    <Text style={[styles.actionButtonText, { color: '#6C5CE7' }]}>איפוס</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.apply]} onPress={handleApply}>
                                    <Text style={styles.actionButtonText}>החל סינון</Text>
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
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        maxHeight: '85%',
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
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
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
        gap: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    apply: {
        backgroundColor: '#6C5CE7',
        marginLeft: 10
    },
    reset: {
        backgroundColor: '#F4F4F4',
    },
    actionButtonText: {
        fontWeight: '600',
        fontSize: 16,
        color: 'white'
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        fontSize: 16
    }
});

export default FiltersModal;
