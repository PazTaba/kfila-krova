// screens/AddCommunityScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AddCommunityScreen() {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // סוגי פריטי קהילה אפשריים
    const COMMUNITY_TYPES = [
        { id: 'event', label: 'אירוע' },
        { id: 'post', label: 'פוסט' },
        { id: 'initiative', label: 'יוזמה' },
        { id: 'offer', label: 'הצעה' },
        { id: 'question', label: 'שאלה' }
    ];

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            // כאן תהיה הקריאה לשרת
            // לדוגמה:
            // const formData = new FormData();
            // formData.append('title', title);
            // formData.append('type', type);
            // formData.append('description', description);
            // formData.append('date', date);
            // formData.append('location', location);
            // if (image) {
            //   formData.append('image', {
            //     uri: image,
            //     name: 'community_image.jpg',
            //     type: 'image/jpeg'
            //   });
            // }

            // סימולציה של שליחה לשרת
            await new Promise(res => setTimeout(res, 1000));

            Alert.alert('הצלחה', 'הפריט נוסף לקהילה בהצלחה');
            navigation.goBack();
        } catch (error) {
            console.error('שגיאה בהוספת פריט קהילה:', error);
            Alert.alert('שגיאה', 'אירעה שגיאה בהוספת הפריט');
        } finally {
            setIsLoading(false);
        }
    };

    // הגדרת שדות הטופס
    const formFields = [
        {
            type: 'text',
            name: 'title',
            label: 'כותרת',
            placeholder: 'כותרת הפריט',
            value: title,
            onChange: setTitle,
            required: true,
            icon: 'type'
        },
        {
            type: 'options',
            name: 'type',
            label: 'סוג פריט',
            value: type,
            onChange: setType,
            required: true,
            options: COMMUNITY_TYPES
        },
        {
            type: 'image',
            name: 'image',
            label: 'תמונה (אופציונלי)',
            value: image,
            onChange: setImage
        },
        {
            type: 'textarea',
            name: 'description',
            label: 'תיאור',
            placeholder: 'תיאור הפריט',
            value: description,
            onChange: setDescription,
            icon: 'file-text',
            required: true
        },
        {
            type: 'text',
            name: 'date',
            label: 'תאריך (אם רלוונטי)',
            placeholder: 'תאריך',
            value: date,
            onChange: setDate,
            icon: 'calendar'
        },
        {
            type: 'text',
            name: 'location',
            label: 'מיקום (אם רלוונטי)',
            placeholder: 'מיקום',
            value: location,
            onChange: setLocation,
            icon: 'map-pin'
        }
    ];

    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('הרשאה נדרשת', 'יש צורך בהרשאה לגישה לגלריה');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('שגיאה בבחירת תמונה:', error);
            Alert.alert('שגיאה', 'אירעה שגיאה בבחירת תמונה');
        }
    };

    const renderField = (field:any, index:any) => {
        const { type, name, label, placeholder, value, onChange, required, icon, options } = field;

        switch (type) {
            case 'text':
                return (
                    <View style={styles.fieldContainer} key={index}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{label}</Text>
                            {required && <Text style={styles.required}>*</Text>}
                        </View>
                        <View style={styles.inputContainer}>
                            {icon && <Feather name={icon} size={18} color="#666" style={styles.icon} />}
                            <TextInput
                                style={styles.input}
                                placeholder={placeholder}
                                value={value}
                                onChangeText={onChange}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                );

            case 'textarea':
                return (
                    <View style={styles.fieldContainer} key={index}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{label}</Text>
                            {required && <Text style={styles.required}>*</Text>}
                        </View>
                        <View style={[styles.inputContainer, styles.textareaContainer]}>
                            {icon && <Feather name={icon} size={18} color="#666" style={[styles.icon, { alignSelf: 'flex-start', marginTop: 10 }]} />}
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder={placeholder}
                                value={value}
                                onChangeText={onChange}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                );

            case 'options':
                return (
                    <View style={styles.fieldContainer} key={index}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{label}</Text>
                            {required && <Text style={styles.required}>*</Text>}
                        </View>
                        <View style={styles.optionsContainer}>
                            {options.map((option:any) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.optionButton,
                                        value === option.id && styles.selectedOption
                                    ]}
                                    onPress={() => onChange(option.id)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            value === option.id && styles.selectedOptionText
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'image':
                return (
                    <View style={styles.fieldContainer} key={index}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handleImagePick}
                        >
                            {value ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: value }} style={styles.imagePreview} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => setImage(null)}
                                    >
                                        <Feather name="x" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Feather name="image" size={24} color="#666" />
                                    <Text style={styles.imagePlaceholderText}>לחץ לבחירת תמונה</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>הוספה לקהילה</Text>
                </View>

                <View style={styles.formContainer}>
                    {formFields.map((field, index) => renderField(field, index))}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>שמור פריט קהילה</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'right',
    },
    required: {
        color: '#e53935',
        fontSize: 16,
        marginRight: 4,
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: '#333',
        textAlign: 'right',
    },
    textareaContainer: {
        alignItems: 'flex-start',
    },
    textarea: {
        minHeight: 100,
        paddingTop: 12,
        paddingBottom: 12,
        textAlign: 'right',
    },
    optionsContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -4,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 4,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    selectedOption: {
        backgroundColor: '#3949ab',
        borderColor: '#3949ab',
    },
    optionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    selectedOptionText: {
        color: '#fff',
    },
    imagePickerButton: {
        width: '100%',
        height: 160,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    imagePreviewContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#3949ab',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});