import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView,Image, StyleSheet,Alert,  TouchableOpacity,RefreshControl, Text, View, PanResponder, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; 
import CardAdmin from '../Components/CardAdmin2'
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import SkeletonLoader from "../Components/SkeletonLoader"
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
const { width: screenWidth } = Dimensions.get('window');
import { useAuth } from '../Helpers/AuthContext';
import LoaderSVG from '../images/Loader.gif'
import rateLimit from 'axios-rate-limit';
import { Svg, Path } from 'react-native-svg';

const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, // maximum number of requests
  perMilliseconds: 1000, // time window in milliseconds
});



export default function SuperAdminDemande({route}) {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");
  const [role, setRole] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(()=>{
    const x = async ()=>{
      const rolex = JSON.parse(await AsyncStorage.getItem('type'));
      setRole(rolex);
     }
    x();
  },[ ]);


  
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isXClicked = false;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const navigation = useNavigation();
  const { settriggerIt, triggerIt } = useAuth();
  const [AllUsers,setAllUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [NumberOfDemands, setNumberOfDemand] = useState(null);



 
  const fetchData = async () => {
    try {
      // Retrieve userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId, 10);

     
      // Retrieve token securely
      const token = await getToken(); 

      
      // Make the API request
      const response = await axiosInstance.get(`${ENDPOINT_API}users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if response is successful
      if (response.status === 200 ) {
        setAllUsers(response.data.users);

        // Count the number of demands based on conditions
        let demandCount = 0;
        response.data.users.forEach(user => {
          if (user.id !== userIdNum && user.canAccess === 0 && user.isEmailVerified === 0) {
            demandCount++;
          }
        });

        setNumberOfDemand(demandCount);
      } else {
        // Handle cases where users array is empty or invalid
        setAllUsers([]);
        setNumberOfDemand(0);
      }
    } catch (error) {
      console.error('Erreur :', error.message);

      // Display appropriate error messages
      setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setmessageError("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };



  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [navigation])
  );


  



  

  const [ID, SETID] = useState(null);

  useEffect(()=>{
    const x =async  ()=>{
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
      SETID(userIdNum);
    }
    x();
  }, []);







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


  const [IDCurrent, setIDCurrent] = useState(null);


  useFocusEffect(
    useCallback(() => {
      const x = async ()=>{
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        setIDCurrent(userIdNum);
      }
      x(); 
  }, []));


  



  
  const [isNoticeSeen, setIsNoticeSeen] = useState(false);

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
            if(parseInt(response.data.nouvelle_demande_notice) === 0 ){
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
      const response = await axios.get(`${ENDPOINT_API}notice6/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);

      if (response.data.user) {
        console.log(response.data.user);
      }
      else{
        console.warn(response.data);
      }
       
    }
    catch(e){
      console.log(e.message);
      Alert.alert(JSON.stringify(e.message));
    }
  }




  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };



  return (
    <View style={styles.container}>

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
              marginBottom: 25,
              marginTop : 10 , 
              alignItems  :"flex-end", 
            }}>

              <Svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 57 57">
                <Path   
                  fill="#FFC017" 
                  d="m39.637 40.831-5.771 15.871a1.99 1.99 0 0 1-3.732 0l-5.771-15.87a2.02 2.02 0 0 0-1.194-1.195L7.298 33.866a1.99 1.99 0 0 1 0-3.732l15.87-5.771a2.02 2.02 0 0 0 1.195-1.194l5.771-15.871a1.99 1.99 0 0 1 3.732 0l5.771 15.87a2.02 2.02 0 0 0 1.194 1.195l15.871 5.771a1.99 1.99 0 0 1 0 3.732l-15.87 5.771a2.02 2.02 0 0 0-1.195 1.194"
                />
              </Svg>
              &nbsp;&nbsp;
              Liste des Demandes
              </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '400', 
              marginBottom: 21 
            }}>

                Ici, vous trouverez la liste des nouvelles demandes d'accès à l'application. Vous avez le contrôle total pour décider qui peut rejoindre l'application en tant qu'administrateur et bénéficier des fonctionnalités offertes.
            
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
            }}>Visualisation des nouvelles demandes </Text>: Chaque demande est accompagnée de leurs informations de base, comme leur nom, leur address email et la date de la demande.
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
            }}> Accepter une demande </Text> :  En acceptant une demande, le client devient administrateur et obtient la capacité de : créer et gérer des fermes, lancer des prédictions basées sur les calculs et gérer son propre personnel.
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

          <Text style={styles.titleText}>Demandes Clients</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
            <Ionicons name="menu" size={24} color="#3E6715" />
          </TouchableOpacity>
        </View>
 
        
        
         {
            loading ? (
              <>
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </>
            ) : (
              AllUsers && (
                <>
                  {NumberOfDemands === 0 ? (
                    <View style={{ height: 577, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 15, color: "gray", textAlign: "center" }}>
                        Aucune donnée disponible.
                      </Text>
                    </View>
                  ) : (
                    AllUsers.slice().reverse().map((data, index) => {
                      return (
                        <>
                        {
                          (data.isEmailVerified === 0 && data.canAccess === 0 ) &&   
                          <CardAdmin key={data.id} index={data.id} item={data}  />
                        }
                        </>
                      );
                    })
                  )}
                </>
              )
            )
          }


      </ScrollView>
    

   
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




    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 23,
  },
  titleContainer: {    marginTop : 18,

    marginBottom : 23,
    alignItems: 'center',
    position : "relative"
  },
  menu: {
    position: "absolute",
    right: 23,
    zIndex: 10,
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
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#DEF3CB',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  BtnXXX: {
    height: 41,
    backgroundColor: "#DEF3CB",
    alignItems: "center",
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 10,
    justifyContent: "center",
  },
  BtnXXX11 : {
    height: 41,
    backgroundColor: "#DEF3CB",
    alignItems: "center",
      borderRadius: 10,
      width : "48.4%",
    justifyContent: "center",
  },
  BtnXXXText: {
    color: "#4F8618",
    fontWeight: "bold",
  },
  activeBtn: {
   backgroundColor : "#487C15", 
  },
  activeBtnText :{
    color : "white"
  },
  graphicContainerText: {
    color: "#487C15",
    fontSize: 14,
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
   
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft : 23, 
    marginRight : 23,
    marginBottom:  23
   },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth : 1, 
    borderColor : "#C8C8C8"
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth : 1, 
    borderColor : "#C8C8C8"
  },
  activated : {
    backgroundColor : "#487C15",
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth : 1, 
    borderColor : "#C8C8C8"
  },
  imageJOZNJORSFDOJFSWNVDO : {
    height : 23, width : 23
  },
  
  buttonTextWhite: {
    color: '#fff',
    fontSize: 16,
  },
  buttonTextBlack: {
    color: 'black',
    fontSize: 16,
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
});