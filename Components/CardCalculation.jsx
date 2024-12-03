import React, {useEffect, useRef, useState} from 'react';
import {Image ,ScrollView, StyleSheet, TouchableOpacity, Text, View, PanResponder, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import { ENDPOINT_API } from '../Screens/endpoint';
import rateLimit from 'axios-rate-limit';
import { AlertError, AlertSuccess } from "./AlertMessage";
import { useFonts } from 'expo-font';
const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 10,  
  perMilliseconds: 1000,  
});

const CardCalculation = ({id, idFarm,idPlaque, idSerre,  date, percentage, renderhim  }) => {

  const { width: screenWidth } = Dimensions.get('window');
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [SerreSingle,setSerreSingle] = useState(null);
  const [FarmSingle,setFarmSingle] = useState(null);
  const [PlaqueSingle,setPlaqueSingle] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");



  const [fontsLoaded] = useFonts({
    'DMSerifDisplay': require('../fonts/DMSerifDisplay-Regular.ttf'),  
  });
  



  useEffect(()=>{
    const x = async ()=>{
      const rolex = JSON.parse(await AsyncStorage.getItem('type'));
      setRole(rolex);
     }
    x();
  },[ ]);

  const fetchData = async () => {
    if( idFarm !== null && idFarm !== undefined ){
      try {
        setFarmSingle(null);
        setSerreSingle(null);
        setLoading(true);
        const token = await getToken(); 
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        const rolex = JSON.parse(await AsyncStorage.getItem('type'));   

        const response = await axiosInstance.get(`${ENDPOINT_API}farmANDserre2/${idFarm}/${idSerre}/${idPlaque}/${userIdNum}/${rolex}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
 

        if (response.status === 200) {
          
          setFarmSingle(response.data.farm);
          setSerreSingle(response.data.serre);
          setPlaqueSingle(response.data.plaque);

        } else if (response.status === 234) {
          setSerreSingle({   
            ...SerreSingle, 
            name : "---",
          });
          setFarmSingle(response.data.farm);
          setPlaqueSingle({
            ...PlaqueSingle,
            name : "---"
          });
        }
        else if (response.status === 235) {
          setFarmSingle(response.data.farm);
          setSerreSingle(response.data.serre);
          setPlaqueSingle({
            ...PlaqueSingle,
            name : "---"
          });
        }
        else if(response.status === 233){
          setFarmSingle({
            name : "---",
          });
          setSerreSingle({
            name : "---",
          });
          setPlaqueSingle({
            ...PlaqueSingle,
            name : "---"
          });
        }
      } catch (error) {
        console.error('Erreur :', error.message);
        setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
        setShowError(true);
              setTimeout(() => {
                setShowError(false);
              }, 3000);
              setTimeout(() => {
                setmessageError("");
              }, 4000);
      } 
    }else{
      setFarmSingle({
        name : "---",
      });
      setPlaqueSingle({
        ...PlaqueSingle,
        name : "---"
      });
      setSerreSingle({
        name : "---",
      });
    }
    setLoading(false);

  };

 

  useEffect(()=>{
    fetchData();
  },[id,renderhim]);




  if (!fontsLoaded) {
    return null;  
  }


  
  return (

    <>
    {
      loading ? 
      <SkeletonLoader />
      : 
      <View 
        style={styles.card} 
        key={id} 
      >
        {
          id  && date && percentage  && 
          <>
        
          <View style={styles.row}>
            <Text style={styles.idText}>Ferme: {FarmSingle && FarmSingle.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.idText}>Serre: {SerreSingle && SerreSingle.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.idText}>Plaque: {PlaqueSingle && PlaqueSingle.name}</Text>
          </View>   


          
          <Text style={styles.dateText}>{date}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.detailsButton} onPress={() => {
                navigation.navigate('Calculation', { id: id, isToModify : false });
              }}  
            >
              <Text style={styles.buttonText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
          </>
        }
      </View>
    } 
    </>
  );
};





const SkeletonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 555,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 555,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const animatedStyle = (inputRange) => ({
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#e0e0e0', '#f0f0f0'],
    }),
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Animated.View style={[styles.skeletonTextSmall, animatedStyle([0, 1])]} />
        <Animated.View style={[styles.skeletonTextMedium, animatedStyle([0, 1])]} />
      </View>
      <View style={styles.skeletonRow}>
        <Animated.View style={[styles.skeletonTextSmall, animatedStyle([0, 1])]} />
        <Animated.View style={[styles.skeletonTextLarge, animatedStyle([0, 1])]} />
      </View>
      <Animated.View style={[styles.skeletonTextLine, animatedStyle([0, 1])]} />
      <Animated.View style={[styles.skeletonTextLine, animatedStyle([0, 1])]} />
      <Animated.View style={[styles.skeletonTextLine, animatedStyle([0, 1])]} />
      <View style={styles.skeletonRow}>
        <Animated.View style={[styles.skeletonButton, animatedStyle([0, 1])]} />
        <Animated.View style={[styles.skeletonButtonWide, animatedStyle([0, 1])]} />
      </View>
    </View>
  );
};




const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginLeft : 23,
    marginRight : 23,
    marginBottom: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, 
    elevation: 2,
    borderColor: "#f9f9f9",
    borderStyle : "solid",
    borderWidth : 1,
    shadowColor: "#8f8f8f", 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0, 
    shadowRadius: 7, 
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems : "center", 
    marginBottom: 5
  },
  idText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loremText: {
    fontSize: 14,
    color: '#8c8c8c',
  },
  percentageText: {
    fontSize: 35,
    color: '#373737', 
    textAlign : "right",
    fontFamily: 'DMSerifDisplay',
  },
  detailsText: {
    fontSize: 14,
    marginTop: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 0,
  },
  chrImpactText: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modifyButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 7,
    height : 39,
    justifyContent : "center",
    alignItems : "center",
    width : "48%"
  },
  detailsButton: {
    backgroundColor: '#f6f6f6',  
    justifyContent : "center",
    alignItems : "center",
    borderRadius: 7,
    height : 45,
    borderWidth : 1, 
    borderColor : "#d7d7d7",
    width : "100%"
  },
  buttonText: {
    color: 'black',
    fontSize : 16,
  },
  buttonText1 : {
    fontSize : 16,
    color : "black"
  },
  
  // Skeleton Loader Styles
  skeletonCard: {
    marginLeft: 23,
    marginRight: 23,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skeletonTextSmall: {
    width: '40%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  skeletonTextMedium: {
    width: '30%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  skeletonTextLarge: {
    width: '20%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  skeletonTextLine: {
    width: '100%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonButton: {
    width: '40%',
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  skeletonButtonWide: {
    width: '50%',
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },

  imageJOZNJORSFDOJFSWNVDO : {
    height : 23, width : 23
  },

});

export default CardCalculation;
