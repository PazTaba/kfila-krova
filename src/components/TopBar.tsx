// components/TopBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

const TopBar = ({ toggleSidebar, navigation }: any) => {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                <Feather name="menu" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.searchButton}
                onPress={() => navigation.navigate('Search')}
            >
                <Feather name="search" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    menuButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
});

export default TopBar;