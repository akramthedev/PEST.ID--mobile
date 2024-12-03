import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import { useCallback } from 'react';
import AlertExclamationBroadcast from '../Components/AlertExclamationBroadcast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import {Image ,ScrollView, StyleSheet, TouchableOpacity, Text, View,RefreshControl , PanResponder, Animated, Dimensions, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../Components/CardCalculation'; 
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import axios from "axios"
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
const { width: screenWidth } = Dimensions.get('window');
import { useAuth } from '../Helpers/AuthContext';
import LoaderSVG from '../images/Loader.gif'
import rateLimit from 'axios-rate-limit';
import { Svg, Path } from 'react-native-svg';
import getDeviceInfo from '../Helpers/getDeviceInfos';
const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5,  
  perMilliseconds: 1000,  
});
const SkeletonButtonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 555,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 555,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const animatedStyle = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonButtonLoader, 
        { backgroundColor: animatedStyle },
      ]}
    />
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
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 555,
          useNativeDriver: false,
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







const History = ({route}) => {


  const [fontsLoaded] = useFonts({
    'DMSerifDisplay': require('../fonts/DMSerifDisplay-Regular.ttf'),  
  });

  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [role, setRole] = useState(null);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");
  const { settriggerIt, triggerIt } = useAuth();
  const [allPredictions,setAllPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [IDCurrent, setIDCurrent] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [isNoticeSeen, setIsNoticeSeen] = useState(false);
  const [showBroad, setshowBroad] = useState(false);
  const [isFirstTime, setisFirstTime] = useState(false);
  const [showItX, setshowItX] = useState(false);
  const [renderhim, setrenderhim] = useState(false);
  const [dataBroadCast, setdataBroadCast] = useState(null); // New loading state
  const [isLoadingNoticeSeenX, setIsLoadingNoticeSeenX] = useState(true); // New loading state
  const [isNoticeSeenX, setIsNoticeSeenX] = useState(null);
  const [triggerIt2, settriggerIt2] = useState(false);



  const checkIfNoticeSeenOrNot = async () => {
      const token = await getToken();
      setshowBroad(false);
      if (token) {
        setIsLoadingNoticeSeenX(true);  
        try {
          const userId = await AsyncStorage.getItem('userId');
          const userIdNum = parseInt(userId);
          const response = await axios.get(`${ENDPOINT_API}user/${userIdNum}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            if(parseInt(response.data.isNoticeOfBroadCastSeen) === 1){
              setshowBroad(false);
            }
            else{
              const resp2 = await axios.get(`${ENDPOINT_API}broadcast`, {
                  headers: {
                  'Authorization': `Bearer ${token}`
                  }
              });

              if(resp2.status === 200){
                setdataBroadCast(resp2.data);
                setshowBroad(true);
              }
              else{
                setshowBroad(false);
              }
            }
            setIsNoticeSeenX(parseInt(response.data.isNoticeOfBroadCastSeen));
          } else {
            setIsNoticeSeenX(1);
            setshowBroad(false)
          }
        } catch (e) {
          setIsNoticeSeenX(1);
          setshowBroad(false)
          console.log(e.message);
        } finally {
          setIsLoadingNoticeSeenX(false); 
        }
      }
    
  };
 

  useFocusEffect(
    useCallback(() => {
      checkIfNoticeSeenOrNot();
    }, [navigation,triggerIt2])
  );
  

  
  
  useEffect(() => {
    const fetchData = async () => {
      try {

        const [roleData, userIdData] = await Promise.all([
          AsyncStorage.getItem('type'),
          AsyncStorage.getItem('userId'),
        ]);
  
        const rolex = JSON.parse(roleData);
        setRole(rolex);
  
        const userIdNum = parseInt(userIdData);
        setIDCurrent(userIdNum);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
  
    fetchData();
  }, []);


  

  const fetchDataPrediction = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);

      // Récupérer le token
      const token = await getToken(); 

      // Faire la première requête pour récupérer les prédictions
      const predictionsResponse = await axiosInstance.get(`${ENDPOINT_API}users/${userIdNum}/predictions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (predictionsResponse.status === 200) {
        setAllPredictions(predictionsResponse.data);
        setTimeout(()=>{
          setrenderhim(!renderhim);
        }, 200);
      }
      else {
        setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
        setShowError(true);
        setTimeout(() => {
          setShowError(false);   
        }, 3000);
        setTimeout(() => {
          setmessageError("");
        }, 4000);
      }

      // Faire la deuxième requête pour récupérer les informations utilisateur
      const userResponse = await axios.get(`${ENDPOINT_API}user/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.status === 200) {
        if (parseInt(userResponse.data.is_first_time_connected) === 0) {
          setisFirstTime(true);
          setshowItX(false);
        } else {
          setisFirstTime(false);
          setshowItX(true);
        }

        setIsNoticeSeen(parseInt(userResponse.data.historique_notice) === 0);
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
    } finally {
      setLoading(false);
    }
  };





  useFocusEffect(
    useCallback(() => {
      
      fetchDataPrediction();
  
    }, [navigation ])
  );
  





 
  const toggleMenu = () => {
    if (isMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsMenuVisible(false);
      });
    } else {
      setIsMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };


  
 


  const formatDate = (dateString) => {
    const date = new Date(dateString);  
    const day = String(date.getDate()).padStart(2, '0');  
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const year = date.getFullYear();  
    return `${day}/${month}/${year}`; 
  };
 
   
  const handleClickWelcomSeen = async()=>{
    try{
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
       
      const token = await getToken(); 
      const response = await axios.get(`${ENDPOINT_API}user_is_welcomed_done/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);

      if (response.data.user) {
        console.log(response.data.user);
      }
       
    }
    catch(e){
      console.log(e.message);
      Alert.alert(JSON.stringify(e.message));
    }
  }


  const handleClickFreshStart = async()=>{
    try{
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
       
      const token = await getToken(); 
      const response = await axiosInstance.get(`${ENDPOINT_API}notice1/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);

      if (response.data.user) {
        console.log(response.data.user);
      }
       
    }
    catch(e){
      console.log(e.message);
      Alert.alert(JSON.stringify(e.message));
    }
  }

     

  

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
           Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setIsMenuVisible(false);
          });
        }
      },
    })
  ).current;







  const sortedPredictions = () => {
    let sortedData = [...allPredictions];
  
    if (sortOrder === 'date') {
      sortedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      sortedData = sortedData.reverse();
    }
  
    return sortedData;
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDataPrediction();
    setRefreshing(false);
  };



  if (!fontsLoaded) {
    return null;  
  }



  return (
    <View style={styles.container}>

      <AlertError message={messageError} visible={showError} />
      <AlertSuccess message={messageSuccess} visible={showSuccess} />

        {
          showBroad === true && 
          <AlertExclamationBroadcast  settriggerIt2={settriggerIt2} triggerIt2={triggerIt2}  message={dataBroadCast.title}  />
        }


      {
        isFirstTime && 
        <View style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex : 10000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond sombre transparent
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: 'white', // Pop-up en blanc
            padding: 20, 
            borderRadius: 10, 
            width: '90%', 
            shadowColor: '#000', 
            shadowOpacity: 0.2, 
            shadowRadius: 10,
            elevation: 5 // Ombre pour Android
          }}>


<TouchableOpacity style={{
                backgroundColor: 'black', 
                height : 35,
                width : 35,
                alignItems : "center", 
                justifyContent : "center",  
                position : "absolute",
                top : 9,
                right : 9,              
                borderRadius: 100, 
                zIndex : 9999,
              }}
                disabled={false}
                onPress={()=>{
                  setisFirstTime(false);
                  setshowItX(true);
                  handleClickWelcomSeen();
                }}
              >
                 <Ionicons name="close" size={24} color="white" />

              </TouchableOpacity>
              
            <Text style={{ 
              fontSize: 23, 
              fontWeight: 'bold', 
              marginBottom: 25 , 
              marginTop : 10,

              alignItems  :"flex-end", 
            }}>

              <Svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 57 57">
                <Path 
                  fill="#FFC017" 
                  d="m39.637 40.831-5.771 15.871a1.99 1.99 0 0 1-3.732 0l-5.771-15.87a2.02 2.02 0 0 0-1.194-1.195L7.298 33.866a1.99 1.99 0 0 1 0-3.732l15.87-5.771a2.02 2.02 0 0 0 1.195-1.194l5.771-15.871a1.99 1.99 0 0 1 3.732 0l5.771 15.87a2.02 2.02 0 0 0 1.194 1.195l15.871 5.771a1.99 1.99 0 0 1 0 3.732l-15.87 5.771a2.02 2.02 0 0 0-1.195 1.194"
                />
              </Svg>
              &nbsp;&nbsp;
              Bienvenue !
            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              Nous sommes ravis de vous accueillir parmi nous. Vous avez fait un excellent choix en rejoignant notre communauté. 

            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              • Explorez toutes les fonctionnalités disponibles pour tirer le meilleur parti de notre service.

            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              • N'hésitez pas à consulter notre centre d'aide pour toute question ou assistance.

            </Text>
  
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 21,
            }}>
              Bonne exploration !
            </Text>

     
          </View>
        </View>
      }


 
      {
          (isNoticeSeen && showItX) &&         
        <View style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex : 10000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond sombre transparent
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: 'white', // Pop-up en blanc
            padding: 20, 
            borderRadius: 10, 
            width: '90%', 
            shadowColor: '#000', 
            shadowOpacity: 0.2, 
            shadowRadius: 10,
            elevation: 5 // Ombre pour Android
          }}>

<TouchableOpacity style={{
                backgroundColor: 'black', 
                height : 35,
                width : 35,
                alignItems : "center", 
                justifyContent : "center",  
                position : "absolute",
                top : 9,
                right : 9,              
                borderRadius: 100, 
                zIndex : 9999,
              }}
                disabled={false}
                onPress={()=>{
                  setIsNoticeSeen(false);
                  handleClickFreshStart();
                }}
              >
                 <Ionicons name="close" size={24} color="white" />

              </TouchableOpacity>

            <Text style={{ 
              fontSize: 23, 
              fontWeight: 'bold', 
              marginBottom: 25 , 
              marginTop : 18,
              alignItems  :"flex-end", 
            }}>
              <Svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 57 57">
                <Path   
                  fill="#FFC017" 
                  d="m39.637 40.831-5.771 15.871a1.99 1.99 0 0 1-3.732 0l-5.771-15.87a2.02 2.02 0 0 0-1.194-1.195L7.298 33.866a1.99 1.99 0 0 1 0-3.732l15.87-5.771a2.02 2.02 0 0 0 1.195-1.194l5.771-15.871a1.99 1.99 0 0 1 3.732 0l5.771 15.87a2.02 2.02 0 0 0 1.194 1.195l15.871 5.771a1.99 1.99 0 0 1 0 3.732l-15.87 5.771a2.02 2.02 0 0 0-1.195 1.194"
                />
              </Svg>
              &nbsp;&nbsp;
              Historique des Calculs
            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              Ici, vous trouverez tous les calculs que vous avez réalisés jusqu'à présent. Cela vous permet de :
            
            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              • <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              marginBottom: 21 
            }}>Voir vos anciennes prédictions </Text> : chaque calcul que vous effectuez est sauvegardé ici afin que vous puissiez le consulter à tout moment.

            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              • <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              marginBottom: 21 
            }}>Modifier vos prédictions</Text> : si vous souhaitez ajuster certains paramètres ou corriger une erreur dans un calcul précédent, vous pouvez facilement modifier chaque prédiction en cliquant sur la prédiction voulue.

            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              • <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              marginBottom: 21 
            }}>Supprimer des prédictions </Text> : si un calcul n'est plus nécessaire ou si vous souhaitez nettoyer votre historique, vous pouvez également supprimer les prédictions que vous ne souhaitez plus conserver.

            </Text>
  
 
          </View>
        </View>
      }



      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
          

         

        <View style={styles.titleContainer}>
        {
            loading && 
            <View style={{ position: "absolute", left :23 ,zIndex: 10,}} > 
              <Image
                source={LoaderSVG}  
                style={styles.imageJOZNJORSFDOJFSWNVDO} 
              />
            </View>
          }
          <Text style={styles.titleText}>Historique des Calculs</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
            <Ionicons name="menu" size={24} color="#3E6715" />
          </TouchableOpacity>
        </View>


        {
          allPredictions && 
          <>
          {
            allPredictions.length >= 2 && 
            <>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={sortOrder === "default" ? styles.modifyButtonEFSKDKC : styles.modifyButton }  
                  onPress={()=>{setSortOrder('default');}}
                >
                  <Text style={sortOrder === "default" ? styles.buttonText : styles.buttonText1}>Ordre par défaut
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={sortOrder === "date" ? styles.modifyButtonEFSKDKC : styles.modifyButton }  
                  onPress={()=>{setSortOrder('date');}}
                >
                  <Text style={sortOrder === "date" ? styles.buttonText : styles.buttonText1}>
                    Ordre par date&nbsp;
                    <MaterialIcons
                      name="moving"  
                      size={18}
                      color="black"
                      style={{ transform: [{ rotate: '45deg' }], marginLeft : 5 }}  
                    />
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.hr} />
            </>
          }
          </>
        }


        {loading ? (
          <>
              <SkeletonLoader />
              <SkeletonLoader />
          </>
        ) : (
          <>
          {
            allPredictions !== null && 
            <>
            {
              allPredictions.length === 0 ? 
              <View style={{ height : 577, alignItems : "center", justifyContent : "center" }} >
                <Text style={{ fontSize : 15,color : "gray", textAlign : "center" }} >Aucune donnée disponible.</Text>
              </View>
                :
                <>
                  {
                    sortedPredictions().map((predic) => (
                        <Card
                          key={predic.id} 
                          id={predic.id}
                          idPlaque={predic.plaque_id}
                          idFarm={predic.farm_id}
                          idSerre={predic.serre_id}
                          date={formatDate(predic.created_at)}
                          percentage={predic.result}
                          renderhim={renderhim}
                        />
                      ))
                  }
                </>
            }
            </>
          }
          </>
        )}
      </ScrollView>

      {loading ? (
        <View style={styles.skeletonButtonContainer}>
            <SkeletonButtonLoader />
        </View>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('AjouterUnCalcul')}  style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Ajouter un nouveau calcul</Text>
        </TouchableOpacity>
      )}

      
      
{isMenuVisible && (
        <Animated.View
          style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <ScrollView style={styles.popupContent}>
            <TouchableOpacity onPress={() => { navigation.navigate('Dashboard'); toggleMenu(); }} style={styles.logo}>
               
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { navigation.navigate('Dashboard'); toggleMenu(); }} style={styles.menuItem}>
            <Ionicons name="speedometer-outline" size={24} color="black" />
            <Text style={styles.menuText}>Tableau de bord</Text>
              <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => { navigation.navigate('Profile', { id: 666 }); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="person-outline" size={24} color="black" />
              <Text style={styles.menuText}>Mon Profile</Text>
              <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
 

            {
                        (role && (role.toLowerCase() === "superadmin") ) &&
                        <TouchableOpacity onPress={() => { navigation.navigate('Broadcast'); toggleMenu(); }} style={styles.menuItem}>
                            <Ionicons name="megaphone-outline" size={24} color="black" />
                            <Text style={styles.menuText}>Station Broadcast</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                        </TouchableOpacity>
                        }

           
            {
              (role && (role.toLowerCase() === "superadmin") )&&
              <>
              <TouchableOpacity onPress={() => { navigation.navigate('MesClients'); toggleMenu(); }} style={styles.menuItem}>
                <Ionicons name="people-outline" size={24} color="black" />
                <Text style={styles.menuText}>Liste des Utilisateurs</Text>
                <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { navigation.navigate('SuperAdminDemande'); toggleMenu(); }} style={styles.menuItem}>
                <Ionicons name="mail-outline" size={24} color="black" />
                <Text style={styles.menuText}>Demandes Clients</Text>
                <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
              </TouchableOpacity>
              
              </>
            }
   <TouchableOpacity onPress={() => { navigation.navigate('Historique'); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="grid-outline" size={24} color="black" />
              <Text style={styles.menuText}>Mes Calculs</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
           
   
            <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnCalcul'); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
              <Text style={styles.menuText}>Ajouter un calcul</Text>
              <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
            
            
            {
              (role && (role.toLowerCase() === "superadmin" || role.toLowerCase() === "admin") ) &&
                <>
                  <TouchableOpacity onPress={() => { navigation.navigate('MesFermes'); toggleMenu(); }} style={styles.menuItem}>
                  <Ionicons name="leaf-outline" size={24} color="black" />
                  <Text style={styles.menuText}>Mes fermes</Text>
                    <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUneFerme'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter une ferme</Text>
                    <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity> 
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnePlaque'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter une plaque</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                  {
                  IDCurrent && 
                  <TouchableOpacity onPress={() => { navigation.navigate('MesPersonels',{id : IDCurrent}); toggleMenu(); }} style={styles.menuItem}>
                  <Ionicons name="people-outline" size={24} color="black" />
                  <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  <Text style={styles.menuText}>Mes personnels</Text>
                </TouchableOpacity>
                 }
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnPersonel'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter un personnel</Text>
                    <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                </>
            }
            

               
            
            <TouchableOpacity 
                onPress={async ()=>{
                  deleteToken();
                  settriggerIt((prev) => !prev);
                  await AsyncStorage.removeItem('userId');
                  await AsyncStorage.removeItem('type');
                  setTimeout(()=>{
                    navigation.navigate('Home');
                  }, 400);
                }
              } 
                style={styles.menuItem}>
              <Ionicons name="log-out-outline" size={24} color="black" />
              <Text style={styles.menuText}>Se déconnecter</Text>
              <Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>


            <TouchableOpacity style={styles.menuItem}  >
            </TouchableOpacity>

            <TouchableOpacity style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 0,
                  textAlign : "center",
                  width : "100%"
                }}  >
                            <Text style={{
              textAlign : "center",
              fontSize: 16,
              color: '#b7b7b7',
              width : "100%",
              fontWeight : "300",
              paddingLeft : 40,
              paddingRight :40,
            }}>Découvrez notre plateforme web</Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 0,
                            textAlign : "center",
                            width : "100%"
                          }}  >
                        <Text style={{
              textAlign : "center",
              fontSize: 16,
              color: '#b7b7b7',
              width : "100%",
              fontWeight : "300",
              paddingLeft : 40,
              paddingRight :40,
            }}>www.pestid.com</Text>
            </TouchableOpacity>
            
            
          </ScrollView>






   
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>
              <Ionicons style={styles.iconX} name="close" size={20} color="#325A0A" />
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}


    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 23,
  },
  titleContainer: {
    marginBottom : 23,
    marginTop : 18,
    alignItems: 'center',
    position : "relative"
  },
  menu :{
    position : "absolute",
    right : 23,
    zIndex: 10, 
  }, 
  titleText: {
    color: 'black',
    fontSize: 19,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#487C15',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginLeft: 23,
    marginRight: 23,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  skeletonButtonContainer: {
    marginHorizontal: 23,
    marginVertical: 20,
  },
  skeletonButtonLoader: {
    width: '100%',
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
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

  //pop Up Menu 
  popup: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '105%',
    width: '100%',
    backgroundColor: 'white',  
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 15,
    zIndex: 9999,
  },
  popupContent: {
    padding: 20,
  },
  logo: {
    marginTop : 20,
    marginLeft : "auto",
    marginRight : "auto",
    marginBottom: 20,
    height : 27,
    width : 112,
  },
  imageLogo : {
    height : "100%", 
    width : "100%"
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
    height : 55,
  },
  menuText: {
    fontSize: 16,
    color: 'black',
    marginLeft: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#656565',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 35,
    right: 17,
    backgroundColor: '#dafdd2',
    padding: 10,
    borderRadius: 50,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight : 23, 
    marginLeft : 23, 
  },
  modifyButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d7d7d7',
    borderRadius: 7,
    height : 41,
    justifyContent : "center",
    alignItems : "center",
    width : "48%",
  },
  modifyButtonEFSKDKC : {
    backgroundColor: '#f6f6f6',  
    justifyContent : "center",
    alignItems : "center",
    borderRadius: 7,
    borderWidth : 1, 
    borderColor : "#d7d7d7",
    height : 41,
    width : "48%",
  },
  detailsButton: {
    backgroundColor: '#487C15',  
    justifyContent : "center",
    alignItems : "center",
    borderRadius: 7,
    height : 41,
    width : "48%"
  }, buttonText: {
    color: 'black',
    fontSize : 16,
    fontWeight : "500",
    alignItems : "center",
    justifyContent : "center",
  },
  buttonText1 : {
    fontSize : 16,
    fontWeight : "500",
    alignItems : "center",
    justifyContent : "center",
    color : "black",
  },
  hr: {
    borderBottomColor: '#eeeeee', 
    borderBottomWidth: 1,         
    marginTop : 16,
    marginBottom : 16,
    marginRight : 23, 
    marginLeft : 23,
  },

});

export default History;