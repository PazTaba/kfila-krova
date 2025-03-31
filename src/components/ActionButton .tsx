// components/ActionButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ActionButton = ({ showActionPanel, toggleActionPanel }:any) => {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={toggleActionPanel}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#6C5CE7', '#a29bfe']}
        style={styles.actionButtonGradient}
      >
        <Feather name={showActionPanel ? "x" : "plus"} size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActionButton;