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
import Slider from '@react-native-community/slider';

interface RadiusModalProps {
    visible: boolean;
    setVisible: (show: boolean) => void;
    matchRadius: number;
    setMatchRadius: (radius: number) => void;
}

const RadiusModal: React.FC<RadiusModalProps> = ({
    visible,
    setVisible,
    matchRadius,
    setMatchRadius
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => setVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark" />
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>הגדר רדיוס חיפוש</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setVisible(false)}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <View style={styles.radiusValueContainer}>
                                    <Text style={styles.radiusValue}>{matchRadius}</Text>
                                    <Text style={styles.radiusUnit}>ק"מ</Text>
                                </View>

                                <Slider
                                    style={styles.radiusSlider}
                                    minimumValue={1}
                                    maximumValue={30}
                                    step={1}
                                    value={matchRadius}
                                    onValueChange={setMatchRadius}
                                    minimumTrackTintColor="#6C5CE7"
                                    maximumTrackTintColor="rgba(108, 92, 231, 0.2)"
                                    thumbTintColor="#6C5CE7"
                                />

                                <View style={styles.radiusLabels}>
                                    <Text style={styles.radiusLabel}>1 ק"מ</Text>
                                    <Text style={styles.radiusLabel}>30 ק"מ</Text>
                                </View>

                                <View style={styles.radiusDescription}>
                                    <Ionicons name="information-circle-outline" size={20} color="#6C5CE7" />
                                    <Text style={styles.radiusDescriptionText}>
                                        רדיוס גדול יותר יציג יותר מוצרים, אך ייתכן שהם יהיו רחוקים יותר ממיקומך הנוכחי.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => setVisible(false)}
                                >
                                    <Text style={styles.applyButtonText}>שמור הגדרות</Text>
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
    radiusValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 24,
    },
    radiusValue: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#6C5CE7',
    },
    radiusUnit: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6C5CE7',
        marginLeft: 6,
    },
    radiusSlider: {
        width: '100%',
        height: 40,
    },
    radiusLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    radiusLabel: {
        color: '#666',
        fontSize: 14,
    },
    radiusDescription: {
        flexDirection: 'row',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    radiusDescriptionText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
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

export default RadiusModal;
