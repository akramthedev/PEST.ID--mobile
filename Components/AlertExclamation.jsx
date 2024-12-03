import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AlertExclamation = ({ message, visible }) => {
  const [position] = useState(new Animated.Value(-100)); // Animation starts from the top

  useEffect(() => {
    if (visible) {
      Animated.timing(position, {
        toValue: 20, // Position where the alert will be displayed
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Hide the alert after 3 seconds
      setTimeout(() => {
        Animated.timing(position, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 5000);
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.alertBox, {
      transform: [{ translateY: position }],
      backgroundColor: '#FFF4E5', // Same background color from your example (light yellowish)
      borderColor: 'transparent' // Border color (yellowish for warnings)
    }]}>
      <Ionicons
        name="alert-circle"
        size={24}
        color="#FFAB00" // Icon color (same yellowish for warnings)
        style={styles.icon}
      />
      <Text style={[styles.alertText, { color: '#FFAB00' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alertBox: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex : 999999999999999
  },
  icon: {
    marginRight: 10,
  },
  alertText: {
    fontSize: 16,
    paddingRight : 23,
    fontWeight: '600',
  },
});

export default AlertExclamation;
