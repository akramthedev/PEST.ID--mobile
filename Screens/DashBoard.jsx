import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView,Image, StyleSheet,ImageBackground,RefreshControl, TouchableOpacity, Text, View, PanResponder, Animated, Dimensions, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import {LineChartX} from './DashboardLineChart';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';  
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons'; 
import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
import { useAuth } from '../Helpers/AuthContext';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import LoaderSVG from '../images/Loader.gif';
import axios from "axios";
import rateLimit from 'axios-rate-limit';
const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, // maximum number of requests
  perMilliseconds: 1000, // time window in milliseconds
});
import { Svg, Path } from 'react-native-svg';
           
   
export default function Dashboard({ route }) {


  const [role, setRole] = useState(null);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [otherData, setotherData] = useState(null);
  const { settriggerIt, triggerIt } = useAuth();
  const [refreshing, setRefreshing] = useState(false);


  const [fontsLoaded] = useFonts({
    'DMSerifDisplay': require('../fonts/DMSerifDisplay-Regular.ttf'),  
  });
  



  const [chartDates, setChartDates] = useState([]);
  const [loadingData, setloadingData] = useState(true);
  const [moucheData, setMoucheData] = useState([]);
  const [thripsData, setThripsData] = useState([]);
  const [mineusesData, setMineusesData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const navigation = useNavigation();
  const [selectedChart, setSelectedChart] = useState('Mouches');
  const [viewType, setViewType] = useState('Year'); 
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [IDCurrent, setIDCurrent] = useState(null);
  const [isNoticeSeen, setIsNoticeSeen] = useState(false);
  const [isFirstTime, setisFirstTime] = useState(false);
  const [showItX, setshowItX] = useState(false);
  const [loaderOther, setLoaderOther] = useState(true);



  

  const fetchData = async () => {
    setloadingData(true);
    const dailyAggregatedData = {}; // Stores aggregated insect counts by date
    const dates = new Set();
  
    const userId = await AsyncStorage.getItem('userId');
    const userIdNum = parseInt(userId);
    const token = await getToken();
  
    if (!token || !userIdNum) {
      setloadingData(false);
      return;
    }
  
    try {
      const resp = await axios.get(`${ENDPOINT_API}users/${userIdNum}/predictions/with/images`, {
        headers: {
          'Authorization': `Bearer ${token}`      
        }
      });
       
      if (resp.status === 200) {

        console.log(resp.data[0]);

        resp.data.forEach(prediction => {
          const date = new Date(prediction.created_at);
          const dayAndMonthString = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' }).slice(0, 2)}`;
          
          // If this dayAndMonthString doesn't exist in dailyAggregatedData, initialize it
          if (!dailyAggregatedData[dayAndMonthString]) {
            dailyAggregatedData[dayAndMonthString] = {
              mouches: 0,
              mineuses: 0,
              thrips: 0
            };
          }
  
          // Aggregate the insect counts for the day
          dailyAggregatedData[dayAndMonthString].mouches += prediction.images.reduce((acc, image) => acc + (image.class_A || 0), 0);
          dailyAggregatedData[dayAndMonthString].mineuses += prediction.images.reduce((acc, image) => acc + (image.class_B || 0), 0);
          dailyAggregatedData[dayAndMonthString].thrips += prediction.images.reduce((acc, image) => acc + (image.class_C || 0), 0);
  
          // Add the date to the set of unique dates
          dates.add(dayAndMonthString);
        });
  
        // Convert aggregated data into arrays expected by the chart component
        const moucheResults = [];
        const mineusesResults = [];
        const thripsResults = [];
  
        Array.from(dates).forEach(day => {
          moucheResults.push({ date: day, count: dailyAggregatedData[day].mouches });
          mineusesResults.push({ date: day, count: dailyAggregatedData[day].mineuses });
          thripsResults.push({ date: day, count: dailyAggregatedData[day].thrips });
        });
  
        // Set the data for each insect type and unique chart dates
        setMoucheData(moucheResults);
        setMineusesData(mineusesResults);
        setThripsData(thripsResults);
        setChartDates(Array.from(dates)); // Unique dates only
      }
    } catch (e) {
      console.log('Error fetching data:', e);
    } finally {
      setloadingData(false);
    }
  };
  
 


  const fetchDataOther = async()=>{
    try{

      setLoaderOther(true);
      setotherData(null);
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
      const token = await getToken();


      const resp = await axios.get(`${ENDPOINT_API}user-other-data/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(resp.status === 200){
        setotherData(resp.data);
      }
      else{
        setotherData(null);
      }
    }     
    catch(e){
      setotherData(null);
      console.log(e.message);
    } finally{
      setLoaderOther(false); 
    }
  } 





useFocusEffect(
  useCallback(() => {
    fetchDataOther();
    fetchData();
  }, []));




  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchDataOther();
    setRefreshing(false);
  };



  
  useEffect(()=>{
    const x = async ()=>{
      const rolex = JSON.parse(await AsyncStorage.getItem('type'));
      setRole(rolex);
      }
    x();
  },[ ]);
 

 
   

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




  



  useFocusEffect(
    useCallback(() => {
      const x = async ()=>{
        try{
          const userId = await AsyncStorage.getItem('userId');
          const userIdNum = parseInt(userId);
          setIDCurrent(userIdNum);
          const token = await getToken(); 
          const response = await axios.get(`${ENDPOINT_API}user/${userIdNum}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if(response.status === 200){
            
            if(parseInt(response.data.is_first_time_connected) === 0 ){
              setisFirstTime(true);
              setshowItX(false);
            }
            else{
              setisFirstTime(false);
              setshowItX(true);
            }

            if(parseInt(response.data.dashboard_notice) === 0 ){
              setIsNoticeSeen(true);
            }
            else{
              setIsNoticeSeen(false);
            }


          }
        }
        catch(e){
          console.log(e.message);
        }
      }
      x(); 

      
  }, []));









 

  const handleClickFreshStart = async()=>{
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




  const handleClickFreshStart2 = async()=>{
    try{
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
       
      const token = await getToken(); 
      const response = await axios.get(`${ENDPOINT_API}notice4/${userIdNum}`, {
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
    }
  }

  



 


  if (!fontsLoaded) {
    return null;  
  }





  return (

    <>
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
            <Text style={styles.menuText}>Tableau de bord</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => { navigation.navigate('Profile', { id: 666 }); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="person-outline" size={24} color="black" />
              <Text style={styles.menuText}>Mon Profile</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
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
                <Text style={styles.menuText}>Liste des Utilisateurs</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { navigation.navigate('SuperAdminDemande'); toggleMenu(); }} style={styles.menuItem}>
                <Ionicons name="mail-outline" size={24} color="black" />
                <Text style={styles.menuText}>Demandes Clients</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
              </TouchableOpacity>
              
              </>
            }

            <TouchableOpacity onPress={() => { navigation.navigate('Historique'); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="grid-outline" size={24} color="black" />
              <Text style={styles.menuText}>Mes Calculs</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
 
            <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnCalcul'); toggleMenu(); }} style={styles.menuItem}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
              <Text style={styles.menuText}>Ajouter un calcul</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
            </TouchableOpacity>
            
            
            {
              (role && (role.toLowerCase() === "superadmin" || role.toLowerCase() === "admin") ) &&
                <>
                  <TouchableOpacity onPress={() => { navigation.navigate('MesFermes'); toggleMenu(); }} style={styles.menuItem}>
                  <Ionicons name="leaf-outline" size={24} color="black" />
                  <Text style={styles.menuText}>Mes fermes</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUneFerme'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter une ferme</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnePlaque'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter une plaque</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                  </TouchableOpacity>
                  {
                  IDCurrent && 
                  <TouchableOpacity onPress={() => { navigation.navigate('MesPersonels',{id : IDCurrent}); toggleMenu(); }} style={styles.menuItem}>
                  <Ionicons name="people-outline" size={24} color="black" />
                  <Text style={styles.menuText}>Mes personnels</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
                </TouchableOpacity>
                 }
                  <TouchableOpacity onPress={() => { navigation.navigate('AjouterUnPersonel'); toggleMenu(); }} style={styles.menuItem}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ajouter un personnel</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
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
              <Text style={styles.menuText}>Se déconnecter</Text><Ionicons style={{ position : "absolute",right:23 }}  name="chevron-forward" size={24} color="#565656" />
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
          {
            /*
            <View style={styles.footer}>
              <Text style={styles.footerText}>PCS AGRI</Text>
              <Text style={styles.footerText}>© all rights reserved • 2024</Text>
            </View>
            */
          }
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>
              <Ionicons style={styles.iconX} name="close" size={20} color="#325A0A" />
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

    <View style={styles.container}>



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
                  handleClickFreshStart2();
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
              Tableau de board
            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

              Ici, vous avez accès à une vue d'ensemble complète et visuelle de vos activités grâce à des graphiques interactifs.

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
            }}>Visualisation des tendances</Text> : identifiez facilement les tendances importantes grâce à des représentations graphiques claires et intuitives. Ces graphiques vous aident à mieux comprendre vos résultats et à anticiper les prochaines étapes.

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
            }}>Comparaison et optimisation</Text> : comparez les performances des différentes fermes, serres ou équipes. Cela vous permet d’optimiser vos stratégies et d’améliorer la précision de vos prédictions

            </Text>

          </View>
        </View>
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
                  handleClickFreshStart();
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
            loadingData &&
            <View style={{ position: "absolute", left :23 ,zIndex: 10,}} > 
              <Image
                source={LoaderSVG}  
                style={styles.imageJOZNJORSFDOJFSWNVDO} 
              />
            </View>
          }
          <Text style={styles.titleText}>Tableau de Board</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
            <Ionicons name="menu" size={24} color="#3E6715" />
          </TouchableOpacity>
        </View>
 


        { role !== null && loaderOther === false &&  loadingData === false  && otherData!== null &&  chartDates !== null &&  
          <>
          {
            role !== "staff" &&
            <>
        <View
          style={{
            alignItems : "center",
            flexDirection : "row", 
            justifyContent : "space-between", 
            width : "auto", 
            height : 105, 
            paddingRight : 23, 
            paddingLeft : 23 
          }}
        >
          <View
            style={{
              height : 105, 
              width : "30%", 
              flexDirection : "column",
              backgroundColor : '#f3ffe8',
              borderRadius : 10
            }}
          >
            <View
              style={{
                height : 75,
                alignItems : "center", 
                justifyContent : "center",
                width : "auto", 
              }}
            >
              <Text
                style={{
                  color : "#487C15", 
                  fontSize : 43,
                  fontFamily: 'DMSerifDisplay',      
                }}
              >
                {otherData.predictionsNumber}
              </Text>
            </View>
            <View
              style={{
                textAlign : "center", 
                alignItems : "center", 
                justifyContent : "flex-start",
                height : 30, 
                width : "auto"
              }}
            >
              <Text
                  style={{
                    color : "#2a2a2a", 
                    fontWeight : "400", 
                    fontSize : 15
                  }}
              >
                Prédiction<>{otherData.predictionsNumber !== 1 && "s"}</>
              </Text>
            </View>
          </View>
          <View
            style={{
              height : 105, 
              width : "30%", 
              flexDirection : "column",
              backgroundColor : '#f3ffe8',
              borderRadius : 10
            }}
          >
            <View
              style={{
                height : 75,
                alignItems : "center", 
                justifyContent : "center",
                width : "auto", 
              }}
            >
              <Text
                style={{
                  color : "#487C15", 
                  fontSize : 43,
                  fontFamily: 'DMSerifDisplay',      
                }}
              >
                {otherData.staffsNumber}
                </Text>
            </View>
            <View
              style={{
                textAlign : "center", 
                alignItems : "center", 
                justifyContent : "flex-start",
                height : 30, 
                width : "auto"
              }}
            >
              <Text
                  style={{
                    color : "#2a2a2a", 
                    fontWeight : "400", 
                    fontSize : 15
                  }}
              >
                Personnel<>{otherData.staffsNumber !== 1 && "s"}</>
              </Text>
            </View>
          </View>
          <View
            style={{
              height : 105, 
              width : "30%", 
              flexDirection : "column",
              backgroundColor : '#f3ffe8',
              borderRadius : 10
            }}
          >
            <View
              style={{
                height : 75,
                alignItems : "center", 
                justifyContent : "center",
                width : "auto", 
              }}
            >
              <Text
                style={{
                  color : "#487C15", 
                  fontSize : 43,
                  fontFamily: 'DMSerifDisplay',      
                }}
              >
                {otherData.farmsNumber}
                </Text>
            </View>
            <View
              style={{
                textAlign : "center", 
                alignItems : "center", 
                justifyContent : "flex-start",
                height : 30, 
                width : "auto"
              }}
            >
              <Text
                  style={{
                    color : "#2a2a2a", 
                    fontWeight : "400", 
                    fontSize : 15
                  }}
              >
                Ferme<>{otherData.farmsNumber !== 1 && "s"}</>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.hr} />


      </>
          }
          </>
        }

       {
              loaderOther === false &&  loadingData === false  && otherData!== null &&  chartDates !== null &&
              <>
        {
          chartDates.length !== 0 && 
          <>
                   


              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.BtnXXX, selectedChart === 'Mouches' ? styles.activeBtn : null]} 
                  onPress={() =>{ setSelectedChart('Mouches');   } }>
                  <Text style={[styles.BtnXXXText, selectedChart === 'Mouches' ? styles.activeBtnText : null]}>Mouches</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.BtnXXX, selectedChart === 'Mineuses' ? styles.activeBtn : null]} 
                  onPress={() => {setSelectedChart('Mineuses');   }}>
                  <Text style={[styles.BtnXXXText, selectedChart === 'Mineuses' ? styles.activeBtnText : null]}>Tuta</Text>
                </TouchableOpacity>
 
              </View>


          </> 
        }
        </>
       }
          <View
            
            style={styles.graphicContainer}>
          {
              loaderOther === false &&  loadingData === false  && otherData!== null &&  chartDates !== null &&
              <>
              {
                chartDates.length !== 0 && 
                <>
                  <Text style={styles.graphicContainerText}>
                    Nombre des {selectedChart} en fonction des jours
                  </Text>
                </>
              }
            </>
          }
            {   
              loaderOther === false &&  loadingData === false  && otherData!== null &&  chartDates !== null ? 
              (
                chartDates && chartDates.length !== 0  ? 
              <>

                {viewType === 'Year' && (
                  chartDates && selectedChart && moucheData && thripsData && mineusesData && 
                  <LineChartX chartDates={chartDates} selectedChart={selectedChart} moucheData={moucheData} thripsData={thripsData} mineusesData={mineusesData} />
                )}

              </>
              :
              <View style={{ height : 100, alignItems : "center", justifyContent : "center", flexDirection : "row" }} > 
                <Text style={{ color : "gray" }} > 
                  &nbsp;&nbsp;&nbsp;Aucune donnée disponible.
                </Text>
              </View>
            )
          
            :
            <View style={{ height : 400, alignItems : "center", justifyContent : "center", flexDirection : "row" }} > 
                <Image
                  source={LoaderSVG}  
                  style={styles.imageJOZNJORSFDOJFSWNVDO} 
                />
                
                <Text style={{ color : "gray" }} > 
                  &nbsp;&nbsp;&nbsp;Chargement du graphique...
                </Text>
              </View>

          
          }









           
          </View>
         


        
      </ScrollView>
      

      
      
      

      

    </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 23,
  },
  
  titleContainer: {
    marginTop : 18,

    marginBottom : 23,
    alignItems: 'center',
    position : "relative"
  },
  menu: {
    position: "absolute",
    right: 23,
    zIndex: 10,
  },
  imageJOZNJORSFDOJFSWNVDO : {
    height : 23, width : 23
  },
  titleText: {
    color: 'black',
    fontSize: 19,
    fontWeight: 'bold',
  },
  viewTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 23,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 23,
  },
  pickerContainer: {
    marginHorizontal: 23,
    marginBottom: 10,borderColor : "#DCDCDC", 
    borderWidth : 1,
    borderRadius : 8,overflow : "hidden"
  },
  picker: {
    backgroundColor: '#F3FFE8',
    borderRadius: 10,
    height: 50,     
    justifyContent: 'center',
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    flex: 1,
    borderRadius: 0,
  },
  BtnXXX: {
    height: 41,
    backgroundColor: "white",
    borderColor : "#DCDCDC", 
    alignItems: "center",
    borderRadius: 10,
    width : "48%",    borderWidth : 1,
    justifyContent: "center",
  },
  BtnXXX11 : {
    height: 41,
    backgroundColor: "#F3FFE8",
    borderColor : "#DCDCDC", 
    alignItems: "center",
    borderWidth : 1,
    borderRadius: 10,
    width : "48.4%",
    justifyContent: "center",
  },
  BtnXXXText: {
    color: "black",
    fontSize : 16,
    fontWeight: "400",
  },
  activeBtn: {
   backgroundColor : "#487C15", 
   borderColor : "white",
  },
  activeBtnText :{
    color : "white"
  },
  graphicContainerText: {
    color: "#AEAEAE",
    fontSize: 14,
    marginBottom : 20
  },
  //pop Up Menu 
  popup: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '107%',
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

  menuItem22: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    textAlign : "center",
    width : "100%"
  },
  menuText: {
    fontSize: 16,
    color: 'black',
    marginLeft: 16,
  },
  menuText22: {
    textAlign : "center",
    fontSize: 16,
    color: '#b7b7b7',
    width : "100%",
    fontWeight : "300",
    paddingLeft : 40,
    paddingRight :40,
  },
  footer: {
    position: 'absolute',
    bottom: 70,
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
  infoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom : 11
  },
  titleXX: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#000000',
    color : "black",
    marginBottom : 11
  },
  info: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 6
  },
  resultsContainer: {
    marginBottom: 20,
  },
  carouselContainer: {
    position: 'relative',
  },
  joesofwvdc : {
    color : "black", 
    marginLeft : 24, 
    marginBottom : 10, 
    fontSize : 16, 
    fontWeight : '400', 
   },
   joesofwvdcjoesofwvdc : {
     color : "black", 
     marginLeft : 24, 
     marginBottom : 10, 
     fontSize : 16, 
     fontWeight : '600', 
    },
    hr: {
      borderBottomColor: '#EFEFEF', 
      borderBottomWidth: 1,         
      marginTop : 20,
      marginBottom : 20,
      marginRight : 23, 
      marginLeft : 23
    },
});
