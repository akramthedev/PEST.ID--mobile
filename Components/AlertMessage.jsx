import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AlertMessage = ({ type, message, visible }) => {
  const [position] = useState(new Animated.Value(-100)); // Animation starts from the top

  useEffect(() => {
    if (visible) {
      Animated.timing(position, {
        toValue: 20, // Where the alert will be displayed
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
      }, 3000);
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.alertBox, { 
      transform: [{ translateY: position }], 
      backgroundColor: type === 'success' ? '#E4F3D6' : '#F7D7D7', 
      borderColor : "transparent"
    }]}>
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
        size={24} 
        color={type === 'success' ? '#5A991C' : '#D11313'} 
        style={styles.icon} 
      />
      <Text style={[styles.alertText, { color: type === 'success' ? '#5A991C' : '#D11313' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// Success Alert
export const AlertSuccess = ({ message, visible }) => {
  return <AlertMessage type="success" message={message} visible={visible} />;
};

// Error Alert
export const AlertError = ({ message, visible }) => {
  return <AlertMessage type="error" message={message} visible={visible} />;
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
    fontWeight: '600',
    paddingRight : 23,

  },
});
