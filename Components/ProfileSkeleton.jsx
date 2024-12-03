import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
// hello World

const ProfileSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const animatedStyle = {
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#e0e0e0', '#f0f0f0'],
    }),
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Animated.View style={[styles.profileImage, animatedStyle]} />
      </View>
      <View style={styles.infoContainer}>
        <Animated.View style={[styles.skeletonTextLine, styles.fullWidth, animatedStyle]} />
        <Animated.View style={[styles.skeletonTextLine, styles.halfWidth, animatedStyle]} />
        <Animated.View style={[styles.skeletonTextLine, styles.halfWidth2, animatedStyle]} />
        <Animated.View style={[styles.skeletonTextLine, styles.halfWidth3, animatedStyle]} />
        <Animated.View style={[styles.skeletonTextLine, styles.halfWidth4, animatedStyle]} />
        <Animated.View style={[styles.skeletonTextLine, styles.halfWidth, animatedStyle]} />
      </View>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop : 42,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom:150, 
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    marginBottom: 30,
   },
  skeletonTextLine: {
    height: 33,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: '30%',
  },
  halfWidth2: {
    width: '80%',
  },
  halfWidth3: {
    width: '70%',
  },
  halfWidth4: {
    width: '90%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonButton: {
    height: 40,
    width: width * 0.4,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
});

export default ProfileSkeleton;
