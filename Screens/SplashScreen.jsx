import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState('');
  const [title, setTitle] = useState('');
  const fullText = "Powered by PCS AGRI";
  const titleText = "PEST ID";

  useEffect(() => {
    // Animate opacity for both text elements
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: true,
    }).start();

    // Show TITLE ("PEST ID") first
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex < titleText.length) {
        setTitle((prev) => prev + titleText[titleIndex]);
        titleIndex++;
      } else {
        clearInterval(titleInterval);
        // After 1500ms delay, start showing "Powered by PCS AGRI"
        setTimeout(() => {
          let textIndex = 0;
          const typingInterval = setInterval(() => {
            if (textIndex < fullText.length) {
              setDisplayText((prev) => prev + fullText[textIndex]);
              textIndex++;
            } else {
              clearInterval(typingInterval);
            }
          }, 63); // Typing interval for "Powered by PCS AGRI"
        }, 1000); // 1500ms delay
      }
    }, 80); // Typing interval for "PEST ID"

    // Cleanup intervals on unmount
    return () => {
      clearInterval(titleInterval);
    };
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Text style={styles.typingText2}>
        {title}
      </Text>
      <Text style={styles.typingText}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  typingText: {
    fontSize: 15,
    marginTop: 13,
    fontWeight: '400',
    color: '#696969',
    fontFamily: 'sans-serif-light',
  },
  typingText2: {
    fontSize: 30,
    fontWeight: '800',
    color: '#487C15',
  },
});

export default SplashScreen;
