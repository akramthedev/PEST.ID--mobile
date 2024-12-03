import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef } from 'react';
import { Image,TextInput, ScrollView,Alert, StyleSheet, TouchableOpacity,RefreshControl , Text, View, PanResponder, Animated, Dimensions, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../Helpers/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINT_API } from './endpoint'; 
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
const { width: screenWidth, height : screenHeight  } = Dimensions.get('window');
import LoaderSVG from '../images/Loader.gif'
import { Svg, Path } from 'react-native-svg';
import ActivityCard from '../Components/ActivityCard';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';






const formatDateForCreatedAt = (dateString) => {
  const date = new Date(dateString);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12 || 12; // Convert to 12-hour format and handle midnight as 12

  return `${dayName} ${day} ${monthName} ${year} - ${hour}:${minute} ${period}`;
};




 


const Broadcast = () => {


  
    const [showError, setShowError] = useState(false);
    const [messageError,setmessageError] = useState("");
    const [messageSuccess,setmessageSuccess] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [role, setRole] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [dataBroadCast, setDataBroadCast] = useState(null);
    const [loadingData, setloadingData] = useState(true);
    const [IDCurrent, setIDCurrent] = useState(null);
    const [loadingDelete, setloadingDelete] = useState(false);
    const [isCreateClicked,setIsCreateClicked] = useState(false);
    const [titreAnnonce,setTitreAnnonce] = useState("");
    const [descAnnonce,setDescAnnonce] = useState("");
    const {settriggerIt, triggerIt } = useAuth();
    const [loadingCreating, setloadingCreating] = useState(false);
    const  navigation  =  useNavigation();
    const  slideAnim   =  useRef(new Animated.Value(screenWidth)).current;
    const [isModifiedClicked,setIsModifiedClicked] = useState(false);
    const [NoDataOfBroadCast,setNoDataOfBroadCast] = useState(null);
    const [isNoticeSeen, setIsNoticeSeen] = useState(false);
    const [fontsLoaded] = useFonts({
      'DMSerifDisplay': require('../fonts/DMSerifDisplay-Regular.ttf'),  
    });
     



    const fetchData = async()=>{
      setDataBroadCast(null);
      setDescAnnonce('');
      setTitreAnnonce('');
        try{
            setloadingData(true);
            const userId = await AsyncStorage.getItem('userId');
            const userIdNum = parseInt(userId);
            const token = await getToken();
        
            const resp = await axios.get(`${ENDPOINT_API}broadcast`, {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            });
            
            if(resp.status === 200){
                setDataBroadCast(resp.data);
                setTitreAnnonce(resp.data.title);
                setDescAnnonce(resp.data.description);
                setNoDataOfBroadCast(false);
              }
            else if(resp.status === 201){
              setNoDataOfBroadCast(true);
            }
            else{
                setDataBroadCast(null);
            }

        }     
        catch(e){
            setDataBroadCast(null);
            setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
            setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);
            console.log(e.message);
        } finally{
            setloadingData(false); 
        }
      } 
    
    
      useFocusEffect(
        useCallback(() => {
          fetchData();
        }, [navigation])
      );
  



      const createBroadCast = async()=>{
        if(titreAnnonce.length <= 5 || titreAnnonce === null || titreAnnonce === undefined || titreAnnonce === "" ){
          
          setmessageError("Les informations du Braodcast sont très courtes ! ");
            setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);


          return;
        }
        else if(descAnnonce.length <= 5 || descAnnonce === null || descAnnonce === undefined || descAnnonce === "" ){
          
          setmessageError("Les informations du Braodcast sont très courtes ! ");
            setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);


          return;
        }
        else{
          try{
              setloadingCreating(true);
              const userId = await AsyncStorage.getItem('userId');
              const userIdNum = parseInt(userId);
              const token = await getToken();
          
              let data = {
                title : titreAnnonce,
                description : descAnnonce
              }

              const resp = await axios.post(`${ENDPOINT_API}broadcast`, data ,{
                  headers: {
                  'Authorization': `Bearer ${token}`
                  }
              });
              
              if(resp.status === 200){
                  setIsCreateClicked(false);
                  setmessageSuccess("Votre Broadcast a été créé avec succès!");
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 3000);
                  setTimeout(() => {
                    setmessageSuccess("");
                  }, 4000);    
                    
                  fetchData();              

                }
              else{
                setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
                setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);

              }

          }     
          catch(e){
            setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
            setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
        setTimeout(() => {
          setmessageError("");
        }, 4000);

              console.log(e.message);
          } finally{
            setloadingCreating(false); 
          }
        }
      } 

      


      
      const updateBroadCast = async()=>{
        if(titreAnnonce.length < 5 && descAnnonce.length < 10){
          Alert.alert("Les informations du Braodcast sont très courtes ! ");
          return;
        }
        else{
          try{
              setloadingCreating(true);
              const userId = await AsyncStorage.getItem('userId');
              const userIdNum = parseInt(userId);
              const token = await getToken();
          
              let data = {
                title : titreAnnonce,
                description : descAnnonce
              }

              const resp = await axios.patch(`${ENDPOINT_API}broadcast`, data ,{
                  headers: {
                  'Authorization': `Bearer ${token}`
                  }
              });
              
              if(resp.status === 200){
                  setIsModifiedClicked(false);
                  setmessageSuccess("Votre Broadcast a été modifié avec succès!");
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
              }, 3000);
              setTimeout(() => {
                setmessageSuccess("");
              }, 4000);        
            
              }
              else{
                setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
                setShowError(true);

            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);
              }

          }     
          catch(e){
              setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
                setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);

              console.log(e.message);
          } finally{
            setloadingCreating(false); 
          }
        }
      }



      const handleClickDelete = async()=>{
        setloadingDelete(true);
          try{
              const userId = await AsyncStorage.getItem('userId');
              const userIdNum = parseInt(userId);
              const token = await getToken();
          
            
              const resp = await axios.delete(`${ENDPOINT_API}broadcast` ,{
                  headers: {
                  'Authorization': `Bearer ${token}`
                  }
              });
              
              if(resp.status === 200){
                fetchData();
                setmessageSuccess("Votre Broadcast a été supprimé avec succès!");
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
              }, 3000);
              setTimeout(() => {
                setmessageSuccess("");
              }, 4000);
               
                }
              else{
                setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
                setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);

              }

          }     
          catch(e){
              setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
                setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);

              console.log(e.message);
          } finally{
            setloadingDelete(false); 

          }
       
      }


      const annuler = ()=>{
        if(dataBroadCast === null || (dataBroadCast.title === null && dataBroadCast.description === null )){
          setTitreAnnonce("");
          setDescAnnonce("");
        }
        else{
          setTitreAnnonce(dataBroadCast.title);
          setDescAnnonce(dataBroadCast.description);
        }
        setIsCreateClicked(false);
      }

      const annulerModification = ()=>{
        setTitreAnnonce(dataBroadCast.title);
        setDescAnnonce(dataBroadCast.description);
        setIsModifiedClicked(false);
      }

      


    useEffect(()=>{
        const x = async ()=>{
          const rolex = JSON.parse(await AsyncStorage.getItem('type'));
          setRole(rolex);
          }
        x();
      },[navigation]);
 
      

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






      const checkIfNoticeSeenOrNot = async ()=>{
       if(role !== null && role !== undefined){
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
            
             
            if(parseInt(response.data.isBroadcastSeen) === 0 ){
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
      }

      useEffect(()=>{
        checkIfNoticeSeenOrNot(); 
      }, [role]);


      

      const handleClickFreshStart = async()=>{
        try{
          const userId = await AsyncStorage.getItem('userId');
          const userIdNum = parseInt(userId);
           
          const token = await getToken(); 
          const response = await axios.get(`${ENDPOINT_API}notice9/${userIdNum}`, {
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
    return(
        <>

          <AlertError message={messageError} visible={showError} />
          <AlertSuccess message={messageSuccess} visible={showSuccess} />


          {
            isNoticeSeen && 
            <View style={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: 10000,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent dark background
              justifyContent: 'center', 
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: 'white', // White popup
                padding: 20, 
                borderRadius: 10, 
                width: '90%', 
                shadowColor: '#000', 
                shadowOpacity: 0.2, 
                shadowRadius: 10,
                elevation: 5 // Shadow for Android
              }}>

                <TouchableOpacity style={{
                    backgroundColor: 'black', 
                    height: 35,
                    width: 35,
                    alignItems: "center", 
                    justifyContent: "center",  
                    position: "absolute",
                    top: 14,
                    right: 14,              
                    borderRadius: 100, 
                    zIndex: 9999,
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
                  alignItems: "flex-end", 
                }}>
                  <Svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 57 57">
                    <Path   
                      fill="#FFC017" 
                      d="m39.637 40.831-5.771 15.871a1.99 1.99 0 0 1-3.732 0l-5.771-15.87a2.02 2.02 0 0 0-1.194-1.195L7.298 33.866a1.99 1.99 0 0 1 0-3.732l15.87-5.771a2.02 2.02 0 0 0 1.195-1.194l5.771-15.871a1.99 1.99 0 0 1 3.732 0l5.771 15.87a2.02 2.02 0 0 0 1.194 1.195l15.871 5.771a1.99 1.99 0 0 1 0 3.732l-15.87 5.771a2.02 2.02 0 0 0-1.195 1.194"
                    />
                  </Svg>
                  &nbsp;&nbsp;
                  Station Broadcast
                </Text>
                
                {
                  role !== null && role !== undefined && 
                  <>
                  {
                    role === "superadmin" ? 
                    <>
                      <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '400', 
                      marginBottom: 21 
                  }}>
                      • <Text style={{ 
                          fontSize: 18, 
                          fontWeight: '700', 
                          marginBottom: 21 
                      }}>Informer les utilisateurs</Text> : envoyez des messages à tous les utilisateurs pour les tenir au courant des nouveautés et mises à jour.
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
                        }}>Annoncer les maintenances</Text> : avertissez les utilisateurs des périodes de maintenance et des modifications à venir pour les préparer.
                    </Text>
                    </>
                    :
                    <>


<Text style={{ 
                      fontSize: 18, 
                      fontWeight: '400', 
                      marginBottom: 21 
                  }}>
                      • <Text style={{ 
                          fontSize: 18, 
                          fontWeight: '700', 
                          marginBottom: 21 
                      }}>Etre Informé </Text> : vous recevrez des messages pour vous tenir au courant des nouveautés et mises à jour.
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
                        }}>Annonces des maintenances</Text> : vous serez avertissé des périodes de maintenance et des modifications à venir pour vous préparer.
                    </Text>


                    </>
                  }
                  </>
                }
              </View>
            </View>
          }





            {
            isMenuVisible && (
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
                
                <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>
                    <Ionicons style={styles.iconX} name="close" size={20} color="#325A0A" />
                    </Text>
                </TouchableOpacity>
                </Animated.View>
            )}






        {
          !isCreateClicked && !isModifiedClicked ? 
          <View style={styles.container}>
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
                        <Text style={styles.titleText}>Station Broadcast</Text>
                        <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
                            <Ionicons name="menu" size={24} color="#3E6715" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                    {
                      loadingData === true && dataBroadCast === null  ? 
                        <View style={{ height : 577, alignItems : "center", justifyContent : "center", flexDirection : "row" }} >
                          <Image
                            source={LoaderSVG}  
                            style={styles.imageJOZNJORSFDOJFSWNVDO} 
                          />
                          <Text style={{ fontSize : 15,color : "gray", textAlign : "center" }} >&nbsp;&nbsp;Chargement...</Text>
                        </View>
                        :
                        <>
                        {
                          dataBroadCast === null ? 
                          <View style={{ height : 577, alignItems : "center", justifyContent : "center" }} >
                            <Text style={{ fontSize : 15,color : "gray", textAlign : "center" }} >Aucun broadcast diffusé.</Text>
                          </View>
                          :
                          <View 
                            style={{
                              paddingRight : 23, 
                              paddingLeft : 23
                            }}
                          >


                            <Text
                              style={[
                                styles.input33333,
                                {

                                }
                              ]}  
                            >
                              &nbsp;
                            </Text>


                            <Text
                              style={[
                                styles.input333,
                                {
                                  fontFamily : "DMSerifDisplay",
                                  fontSize : 33,
                                }
                              ]}  
                            >
                              {
                                titreAnnonce
                              }
                            </Text>



                            <Text
                              style={[
                                styles.input333,
                                {
                                  color : "#a8a8a8", 
                                  fontSize : 15, 
                                  fontWeight : "400", 
                                  marginTop :0, 
                                  marginBottom : 40 , 
                                  }
                              ]}  
                            >
                              {
                                dataBroadCast && <>
                                <Ionicons name="time-outline" size={15} color="#a8a8a8" />
                                &nbsp;
                                {
                                  formatDateForCreatedAt(dataBroadCast.created_at)
                                }
                                </>
                              }
                            </Text>



                            <Text
                              style={[
                                styles.input333,
                                {
                                  color : "black", 
                                  fontSize : 17, 
                                  fontWeight : "400"
                                }
                              ]}  
                            >
                              {
                                descAnnonce
                              }
                            </Text>



                            <Text
                              style={[
                                styles.input333,
                                {
                                  color : "black", 
                                  fontSize : 16, 
                                  fontWeight : "400", 
                                  margin : 0,
                                  marginTop:28,
                                }
                              ]}  
                            >
                              L'équipe PCS AGRI
                            </Text>


                          </View>
                        }
                        </>
                    }
                    </ScrollView>
                    {
                      role !== null && role !== undefined && 
                      <>
                      {
                        role === "superadmin" && 
                        <>
                          {
                      NoDataOfBroadCast !== null && 
                      <>
                      {
                        NoDataOfBroadCast === true  ? 

                          <TouchableOpacity   style={[
                              styles.addButtonXX,
                              { opacity: loadingData ? 0.3 : 1 }
                            ]}   
                            disabled={loadingData || loadingCreating || loadingDelete }                            onPress={
                              ()=>{
                                setIsCreateClicked(true);
                              }
                            }
                          >
                            <Ionicons name="megaphone-outline" size={19} color="white" />
                            <Text style={styles.addButtonXXText}>  
                              &nbsp;
                              Créer un Broadcast
                            </Text>
                          </TouchableOpacity>
                          :
                     

                            
                            <View

                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width : "100%",
                                height : 100,
                                padding : 23,
                                paddingBottom : 21
                              }}

                            >

                              <TouchableOpacity   style={[
                                  styles.cancelXXXXXXX,
                                  { opacity: loadingData ? 0.3 : 1 }
                                ]}   
                                disabled={loadingData || loadingCreating || loadingDelete }  
                                onPress={
                                  ()=>{
                                    handleClickDelete();
                                  }
                                }
                              >
                                <Text style={styles.addButtonXXTextXXXX}>  
                                  Supprimer
                                </Text>
                              </TouchableOpacity>


                              <TouchableOpacity   style={[
                                  styles.addButtonXXXXXX,
                                  { opacity: loadingData ? 0.3 : 1 }
                                ]}   
                                disabled={loadingData || loadingCreating || loadingDelete }                                onPress={
                                  ()=>{
                                    setIsModifiedClicked(true);
                                  }
                                }
                              >
                                <Text style={styles.addButtonXXText}>      
                                  Modifier le Broadcast
                                </Text>
                              </TouchableOpacity>

                              </View>


                      }
                      </>
                      
                     
                    }
                        </>
                      }
                      </> 
                    }
            </View>
            :
            <>
            {
              role !== null && role !== undefined && 
              <>
              {
                role === "superadmin" && 
                    <View style={styles.container}>
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
                            <Text style={styles.titleText}>Station Broadcast</Text>
                            <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
                                <Ionicons name="menu" size={24} color="#3E6715" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                          style={{
                            paddingRight : 23, 
                            paddingLeft : 23
                          }}
                        >
                          <Text style={styles.label}>Titre</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Veuillez saisir le titre de l'annonce..."
                            value={titreAnnonce}
                            onChangeText={setTitreAnnonce}
                          />

                          <Text style={styles.label}>Description</Text>
                          <TextInput
                            style={[styles.inputDDD, { height: "66.666%" }]}
                            placeholder="Veuillez saisir la description de l'annonce..."
                            value={descAnnonce}
                            onChangeText={setDescAnnonce}
                            multiline={true}
                            numberOfLines={10}
                          />


                        </ScrollView>
                        {

                          isCreateClicked ? 

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              width : "100%",
                              padding : 23,
                              paddingBottom : 21
                            }}
                          >
                            <TouchableOpacity   style={[
                                styles.cancelXXX,
                                { opacity: loadingData || loadingCreating ? 0.3 : 1 }
                              ]}   
                              disabled={loadingData || loadingCreating || loadingDelete }                          onPress={
                                ()=>{
                                  setIsCreateClicked(false);
                                  annuler();
                                }
                              }
                            >
                              <Text style={styles.addButtonXXTextXX}>   
                                &nbsp;
                                Annuler
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity   style={[
                              styles.addButtonXXXX,
                              { opacity: loadingData || loadingCreating ? 0.3 : 1 }
                            ]}   
                            disabled={loadingData || loadingCreating || loadingDelete }                        onPress={
                              ()=>{
                                createBroadCast();
                              }
                            }
                          >
                            <Text style={styles.addButtonXXText}>  
                              {
                                loadingCreating ? "Enregistrement..." : "Sauvegarder"
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>
                        :
                        <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              width : "100%",
                              padding : 23,
                              paddingBottom : 21
                            }}
                          >
                            <TouchableOpacity   style={[
                                styles.cancelXXX,
                                { opacity: loadingData || loadingCreating ? 0.3 : 1 }
                              ]}   
                              disabled={loadingData || loadingCreating || loadingDelete }                          onPress={
                                ()=>{
                                  setIsModifiedClicked(false);
                                  annulerModification();
                                }
                              }
                            >
                              <Text style={styles.addButtonXXTextXX}>  
                                &nbsp;
                                Annuler
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity   style={[
                              styles.addButtonXXXX,   
                              { opacity: loadingData || loadingCreating ? 0.3 : 1 }
                            ]}   
                            disabled={loadingData || loadingCreating || loadingDelete }                        onPress={
                              ()=>{
                                updateBroadCast();
                              }
                            }
                          >
                            <Text style={styles.addButtonXXText}>  
                              {
                                loadingCreating ? "Enregistrement..." : "Sauvegarder"
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>

                        }
                </View>
              }
              </>
            }
            </> 
        }




            
        
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
      backgroundColor: "#F3FFE8",
      borderColor : "#DCDCDC", 
      alignItems: "center",
      borderRadius: 10,
      width : "31.3%",    borderWidth : 1,
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
    menuText: {
      fontSize: 16,
      color: 'black',
      marginLeft: 16,
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

      addButtonXX: {
        backgroundColor: '#487C15',
        borderRadius: 10,
        flexDirection : "row",
        paddingVertical: 15,
        justifyContent : "center",
        alignItems: 'center',
        marginVertical: 20,
        marginLeft: 23,
        marginRight: 23,
      },

      addButtonXXXX: {
        backgroundColor: '#487C15',
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 16,
      width: '64%',
      alignItems: 'center',
      },

      addButtonXXXXXX: {
        backgroundColor: '#487C15',
      borderRadius: 10,
      width: '64%',
      alignItems: 'center',
      justifyContent : "center"
      },

      addButtonXXText: {
        color: '#fff',
        fontSize: 16,
        alignItems : "center", 
        justifyContent : "center"
      },

      addButtonXXTextXX: {
        color: 'black',
        fontSize: 16,
        alignItems : "center", 
        justifyContent : "center"
      },addButtonXXTextXXXX : {
        color: 'white',
        fontSize: 16,
        alignItems : "center", 
        justifyContent : "center"
      },
      cancelXXX : {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 15,
        width: '32%',
        alignItems: 'center',
      },

      cancelXXXXXXX : {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical : 16,        
        backgroundColor : "#AF0000",
        width: '32%',
        alignItems: 'center',
      },

      label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight : "bold"
      },
      label33: {
        fontSize: 16,
        marginBottom: 8,
        marginTop : 15,
        fontWeight : "bold"
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        fontSize : 16,
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 16,
        height: 48,
        
      },

      input333 : {
        borderRadius: 10,
        fontSize : 16,
        marginBottom: 15,
      },
      
      input33333 : {
        borderRadius: 10,
        fontSize : 0,
        marginBottom: 5,
      },
      inputDDD: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        fontSize : 16,
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 16,
        paddingBottom : 20,
        height: 48,
        paddingTop : 20,
        textAlignVertical: 'top'
      },



});



export default Broadcast;