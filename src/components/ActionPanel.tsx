import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface ActionPanelProps {
    showActionPanel: boolean;
    actionPanelAnim: Animated.Value;
    setShowActionPanel: (show: boolean) => void;
    handleUpdateLocation: () => void;
    setShowRadiusModal: (show: boolean) => void;
    setShowFiltersModal: (show: boolean) => void;
    navigation: any;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
    showActionPanel,
    actionPanelAnim,
    setShowActionPanel,
    handleUpdateLocation,
    setShowRadiusModal,
    setShowFiltersModal,
    navigation
}) => {
    if (!showActionPanel) return null;

    return (
        <Animated.View style={[
            styles.actionPanel,
            { transform: [{ translateY: actionPanelAnim }] }
        ]}>
            <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                    setShowActionPanel(false);
                    handleUpdateLocation();
                }}
            >
                <LinearGradient
                    colors={['#6C5CE7', '#a29bfe']}
                    style={styles.actionIconGradient}
                >
                    <Feather name="navigation" size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>עדכן מיקום</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                    setShowActionPanel(false);
                    setShowRadiusModal(true);
                }}
            >
                <LinearGradient
                    colors={['#6C5CE7', '#a29bfe']}
                    style={styles.actionIconGradient}
                >
                    <Feather name="radio" size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>הגדר רדיוס</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                    setShowActionPanel(false);
                    setShowFiltersModal(true);
                }}
            >
                <LinearGradient
                    colors={['#6C5CE7', '#a29bfe']}
                    style={styles.actionIconGradient}
                >
                    <Feather name="filter" size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>סנן תוצאות</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                    setShowActionPanel(false);
                    navigation.navigate('AddProduct');
                }}
            >
                <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.actionIconGradient}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>הוסף מוצר</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    actionPanel: {
        position: 'absolute',
        bottom: 170,
        right: 20,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
        zIndex: 10,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        backgroundColor: 'white',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    actionIconGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '500',
        marginRight: 8,
    },
});

export default ActionPanel;