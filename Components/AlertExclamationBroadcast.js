import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ENDPOINT_API } from '../Screens/endpoint';
import { getToken } from '../Helpers/tokenStorage';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';




const AlertExclamationBroadcast = ({ settriggerIt2, triggerIt2, message }) => {


    const navigation = useNavigation();


    const click = async ()=>{
        try{

            const token = getToken();
            const userId = await AsyncStorage.getItem('userId');
            const userIdNum = parseInt(userId);
            const resp = await axios.get(`${ENDPOINT_API}userHaveSeenBroadCast/${userIdNum}`, {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            });
            settriggerIt2(!triggerIt2);
            navigation.navigate("Broadcast");
          }
        catch(e){
            console.log(e.message);
        }
    }


  return (
     
      <TouchableOpacity style={[styles.alertBox, {
        backgroundColor: '#FFF4E5', // Same background color from your example (light yellowish)
        borderColor: 'transparent',
        alignItems : "center"

      }]}
      
          onPress={click}
          activeOpacity={1} 
      >
           <Ionicons
              name="close"
              size={20}
              color="#FFF4E5" // Icon color (same yellowish for warnings)
              style={styles.iconXXX}
          />
        <Ionicons
          name="alert-circle"
          size={24}
          color="#FFAB00" // Icon color (same yellowish for warnings)
          style={styles.icon}
        />
        <View
          style={{
              flexDirection :"column", 
              width : "87%",
          }}
        >
          
  
          <Text style={[styles.alertText, { color: '#FFAB00', fontSize : 17, fontWeight : "700" }]}>
              {message}
          </Text>
          <Text style={[styles.alertText, { color: '#bb7d00', fontSize : 14, fontWeight : "500" }]}>
              Cliquez sur cette fenêtre pour en savoir plus.
          </Text>
        </View>
      </TouchableOpacity>
    
  );
};

const styles = StyleSheet.create({
  alertBox: {
    position: 'absolute',
    bottom:15,
    left: 15, 
    minHeight : 80,
    right: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginRight: 6,
  },
  iconXXX : {
    position : "absolute",
    right : 5, 
    top : 5, 
    backgroundColor : "#c58300", 
    borderRadius : 40
  },    
  alertText: {
    fontSize: 16,
    paddingRight : 23,
    fontWeight: '600',
  },
});

export default AlertExclamationBroadcast;
