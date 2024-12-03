import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, {useState, useEffect} from 'react';
import {View,Text,StyleSheet,ActivityIndicator,TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';import { useAuth } from '../Helpers/AuthContext';
import { ENDPOINT_API } from './endpoint';


const Test = ({ navigation, route }) => {


      const URL = `${ENDPOINT_API}hallo`;
      const [loading, setLoading] = useState(true);
      const [isOffline, setIsOffline] = useState(false);
      const [data, setData] = useState(null);

      
      const fetchData = async () => {
        setLoading(true);
  
        // Check for internet connection
        const netInfo = await NetInfo.fetch();
        setIsOffline(!netInfo.isConnected);
  
        if (netInfo.isConnected) {
          try {
            // status = online     
            const response = await axios.get(URL);
            setData(response.data);
            // caching data 
            await AsyncStorage.setItem(URL, JSON.stringify(response.data));
          } catch (error) {
            console.error('Error fetching data online', error);
          }
        } else {
            // retrieving cached data
            const cachedData = await AsyncStorage.getItem(URL);
            if (cachedData) {
              setData(JSON.parse(cachedData));
            }
        }
  
        setLoading(false);
      };
    
      
      useEffect(() => {  
        fetchData();
      }, []);  
    
 

  
    return (
      <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : isOffline ? (
            <Text style={{ color: 'red' }}>You are offline. Showing cached data.</Text>
          ) : (
            <Text style={{ color: 'green' }}>You are online. Showing live data.</Text>
          )}
        <Text>{data ? data.x : 'No data available'}</Text>
      </View>
    );
};




const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: 110,
      backgroundColor: '#fff',
    }
})

export default Test;
