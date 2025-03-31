// components/MatchBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MatchBanner = ({ count }:any) => {
  return (
    <View style={styles.matchBannerContainer}>
      <LinearGradient
        colors={['#6C5CE7', '#a29bfe']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.matchBanner}
      >
        <View style={styles.matchIconContainer}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#fff" />
        </View>
        <Text style={styles.matchBannerText}>
          {count} מוצרים נמצאים בסביבה שלך
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  matchBannerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
  },
  matchIconContainer: {
    marginRight: 12,
  },
  matchBannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchBanner;