// components/ModernFormTemplate.tsx
import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

// מגדיר את סוגי השדות המותרים כמילוליים מדויקים
type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'select' | 'options' | 'category';
type KeyboardType = 'default' | 'numeric' | 'email-address' | 'phone-pad';

interface FieldOption {
    id: string;
    label: string;
    color?: string;
    icon?: string;
}

interface FieldConfig {
    type: FieldType;
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    value: any;
    onChange: (value: any) => void;
    icon?: string; // נשתמש בשם של Feather icon
    options?: FieldOption[];
    rows?: number;
    keyboardType?: KeyboardType;
    helper?: string;
}

interface ModernFormTemplateProps {
    title: string;
    fields: FieldConfig[];
    onSubmit: () => void;
    isLoading?: boolean;
    submitLabel?: string;
    disabled?: boolean;
    onBack?: () => void;
    primaryColor?: string;
    secondaryColor?: string;
}

const { width } = Dimensions.get('window');

const FormTemplate: React.FC<ModernFormTemplateProps> = ({
    title,
    fields,
    onSubmit,
    isLoading = false,
    submitLabel = 'שמור',
    disabled = false,
    onBack,
    primaryColor = '#5B21B6',
    secondaryColor = '#8B5CF6'
}) => {
    // אנימציות להופעת שדות הטופס
    const fadeAnim = useRef(fields.map(() => new Animated.Value(0))).current;

    React.useEffect(() => {
        // הנפשה הדרגתית של השדות
        fadeAnim.forEach((anim, i) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: i * 80,
                useNativeDriver: true
            }).start();
        });
    }, []);

    const pickImage = async (onChange: (value: any) => void) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                aspect: [16, 9]
            });

            if (!result.canceled && result.assets.length > 0) {
                onChange(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const renderField = (field: FieldConfig, index: number) => {
        const isRequired = field.required ? ' *' : '';

        // מעטפת מונפשת לכל שדה
        const AnimatedFieldWrapper = ({ children }: { children: React.ReactNode }) => (
            <Animated.View
                key={index}
                style={{
                    opacity: fadeAnim[index],
                    transform: [
                        {
                            translateY: fadeAnim[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }
                    ]
                }}
            >
                {children}
            </Animated.View>
        );

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <AnimatedFieldWrapper>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{field.label}{isRequired}</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={field.placeholder || ''}
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    keyboardType={field.keyboardType || 'default'}
                                    textAlign="right"
                                />
                                {field.icon && (
                                    <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
                                        <Feather name={field.icon as any} size={18} color={primaryColor} />
                                    </View>
                                )}
                            </View>
                        </View>
                    </AnimatedFieldWrapper>
                );

            case 'textarea':
                return (
                    <AnimatedFieldWrapper>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{field.label}{isRequired}</Text>
                            {field.helper && (
                                <Text style={styles.helperText}>{field.helper}</Text>
                            )}
                            <View style={styles.textAreaWrapper}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder={field.placeholder || ''}
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    multiline
                                    numberOfLines={field.rows || 4}
                                    textAlignVertical="top"
                                    textAlign="right"
                                />
                                {field.icon && (
                                    <View style={[styles.textAreaIconContainer, { backgroundColor: `${primaryColor}20` }]}>
                                        <Feather name={field.icon as any} size={18} color={primaryColor} />
                                    </View>
                                )}
                            </View>
                        </View>
                    </AnimatedFieldWrapper>
                );

            case 'image':
                return (
                    <AnimatedFieldWrapper>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{field.label}{isRequired}</Text>
                            <TouchableOpacity
                                style={styles.imageUploadButton}
                                onPress={() => pickImage(field.onChange)}
                                activeOpacity={0.8}
                            >
                                {field.value ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image
                                            source={{ uri: field.value }}
                                            style={styles.imagePreview}
                                            resizeMode="cover"
                                        />
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                                            style={styles.imageGradient}
                                        >
                                            <TouchableOpacity
                                                style={styles.editImageButton}
                                                onPress={() => pickImage(field.onChange)}
                                            >
                                                <Feather name="edit" size={16} color="white" />
                                                <Text style={styles.editImageText}>ערוך</Text>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <View style={[styles.uploadIconContainer, { backgroundColor: `${primaryColor}20` }]}>
                                            <Feather name="image" size={28} color={primaryColor} />
                                        </View>
                                        <Text style={[styles.uploadText, { color: primaryColor }]}>
                                            לחץ להעלאת תמונה{isRequired}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </AnimatedFieldWrapper>
                );

            case 'options':
                return (
                    <AnimatedFieldWrapper>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{field.label}{isRequired}</Text>
                            <View style={styles.optionsContainer}>
                                {field.options?.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.optionButton,
                                            field.value === option.id && [
                                                styles.selectedOption,
                                                { backgroundColor: primaryColor }
                                            ]
                                        ]}
                                        onPress={() => field.onChange(option.id)}
                                        activeOpacity={0.7}
                                    >
                                        {option.icon && (
                                            <Feather
                                                name={option.icon as any}
                                                size={16}
                                                color={field.value === option.id ? 'white' : '#666'}
                                                style={{ marginLeft: 6 }}
                                            />
                                        )}
                                        <Text
                                            style={[
                                                styles.optionText,
                                                field.value === option.id && styles.selectedOptionText
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </AnimatedFieldWrapper>
                );

            case 'category':
                return (
                    <AnimatedFieldWrapper>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{field.label}{isRequired}</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {field.options?.map((option) => {
                                    const isSelected = field.value === option.id;
                                    const backgroundColor = isSelected
                                        ? option.color || primaryColor
                                        : `${option.color || primaryColor}10`;

                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.categoryButton,
                                                { backgroundColor }
                                            ]}
                                            onPress={() => field.onChange(option.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryText,
                                                    { color: isSelected ? 'white' : option.color || primaryColor }
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </AnimatedFieldWrapper>
                );

            case 'select':
                // עדיין לא מומש
                return null;

            default:
                return null;
        }
    };

    // בדיקה האם חסרים שדות חובה
    const validateForm = () => {
        return !fields.some(field => field.required && !field.value);
    };

    const isValid = validateForm();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Feather name="arrow-right" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {fields.map(renderField)}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: isValid && !disabled ? primaryColor : '#CACACA' },
                        (!isValid || disabled) && styles.submitButtonDisabled
                    ]}
                    onPress={onSubmit}
                    disabled={isLoading || !isValid || disabled}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>{submitLabel}</Text>
                            <Feather name="check-circle" size={20} color="white" style={{ marginRight: 10 }} />
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.requiredNote}>* שדות חובה</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F4F4F5',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'right',
    },
    helperText: {
        fontSize: 13,
        color: '#71717A',
        marginBottom: 6,
        textAlign: 'right',
    },
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textAreaWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    textAreaIconContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 16,
        fontSize: 16,
        color: '#333',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    imageUploadButton: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderStyle: 'dashed',
    },
    imagePreviewContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        justifyContent: 'flex-end',
        paddingBottom: 12,
        paddingHorizontal: 12,
    },
    editImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    editImageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    uploadPlaceholder: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    uploadIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '500',
    },
    optionsContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginLeft: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#F4F4F5',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: 'transparent',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    selectedOptionText: {
        color: 'white',
    },
    categoriesContainer: {
        paddingVertical: 8,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: 10,
        borderRadius: 50,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    requiredNote: {
        textAlign: 'center',
        color: '#A1A1AA',
        marginTop: 20,
        marginBottom: 20,
        fontSize: 13,
    }
});

export default FormTemplate;