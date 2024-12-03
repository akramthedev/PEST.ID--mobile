import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef } from 'react';
import { Image,TextInput, ScrollView, StyleSheet, TouchableOpacity,RefreshControl, Text, View, PanResponder, Animated, Dimensions, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import CardFarm from '../Components/CardFarm';
import { useAuth } from '../Helpers/AuthContext';
const { width: screenWidth } = Dimensions.get('window');
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../Components/fct';
import { formatLocation } from '../Helpers/locationTransf';
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
import LoaderSVG from '../images/Loader.gif'
import ProfileSkeleton from '../Components/ProfileSkeleton';
import rateLimit from 'axios-rate-limit';
import SingleFarmSkeleton from '../Components/SingleFarmSkeleton';



const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, // maximum number of requests
  perMilliseconds: 1000, // time window in milliseconds
});

const SingleFarmPage = () => {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");
  const [appela,setAppela] = useState(null);
  const [mesureX ,setMesX] = useState(null);
  const [location ,setlocation] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingModification, setloadingModification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const navigation = useNavigation();
  const { settriggerIt, triggerIt } = useAuth();
  const [dataFarm,setdataFarm] = useState(null);
  const [dataSerre,setdataSerre] = useState(null);
  const route = useRoute();
  const { id } = route.params;
  const [isModifyClicked, setIsModifyClick] = useState(false)
  const [isSupprimerClicked, setisSupprimerClicked] = useState(false)
  const [IDCurrent, setIDCurrent] = useState(null);
  const [loaderDelete, setloaderDelete] = useState(false);


  useEffect(()=>{
    const x = async ()=>{
      const rolex = JSON.parse(await AsyncStorage.getItem('type'));
      setRole(rolex);
     }
    x();
  },[ ]);



  useFocusEffect(
    useCallback(() => {
      const x = async ()=>{
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        setIDCurrent(userIdNum);
      }
      x(); 
  }, []));
    


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

  

  

      const fetchData = async () => {
        if(id !== null && id !== undefined){
          try {
            setLoading(true);  
            const token = await getToken(); 
            const response = await axiosInstance.get(`${ENDPOINT_API}farms/getSingleFarm/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.status === 200) {
              setdataFarm(response.data[0]);
              setAppela(response.data[0].name);
              if(response.data[0].size !== null && response.data[0].size!== ""){
                setMesX(response.data[0].size.toString());
              }
              else{
                setMesX(null)
              }
              setlocation(response.data[0].location);
              const response2 = await axiosInstance.get(`${ENDPOINT_API}serres-per-farm/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (response2.status === 200) {
                setdataSerre(response2.data);
                console.log(response2.data);
              }
              else{
                setdataSerre([]);
              }
            } else {
              setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
              setShowError(true);
              setTimeout(() => {
                setShowError(false);
              }, 3000);
              setTimeout(() => {
                setmessageError("");
              }, 4000);
            }
          } catch (error) {
            setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
            setShowError(true);
            setTimeout(() => {
              setShowError(false);
            }, 3000);
            setTimeout(() => {
              setmessageError("");
            }, 4000);
            console.error('Erreur :', error.message);
          } finally {
            setLoading(false);
          }
        }    
      };
    
      
      useFocusEffect(
        useCallback(() => {

          fetchData();

        }, [navigation, id])
      );



  const handleSaveData = async()=>{
    if(dataFarm !== null){
      if(appela.length <= 2){
        setmessageError("Le champ `nom de ferme` est invalide ou ne peut pas etre vide!");
              setShowError(true);
              setTimeout(() => {
                setShowError(false);
              }, 3000);
              setTimeout(() => {
                setmessageError("");
              }, 4000);
      }
      else{
            setloadingModification(true);
            const token = await getToken(); 
              
        try{
          let data = {
            name : appela, 
            size : parseInt(mesureX) , 
            location: location 
          }
          
          const resp = await axiosInstance.patch(`${ENDPOINT_API}farms/${dataFarm.id}`, data, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if(resp.status === 200){
            setdataFarm({ ...dataFarm, name: data.name, location : data.location, size: data.size })
            setIsModifyClick(false);

            setmessageSuccess("Succès : Votre ferme a bien été modifiée!");
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
          console.log(e.message);
 
          setmessageError("Une erreur est survenue. Veuillez nous contacter à 'contact@pcs-agri.com' si le problème persiste.");
          setShowError(true);
                setTimeout(() => {
                  setShowError(false);
                }, 3000);
                setTimeout(() => {
                  setmessageError("");
                }, 4000);
        } finally{
          setloadingModification(false);
        }
      }
    }
   }

  


   
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  



  const handleLickDelete = async ()=>{
    if(id !== null && id !== undefined){
      try{
        setloaderDelete(true);
        const token = await getToken();
        const resp = await axiosInstance.delete(`${ENDPOINT_API}farms/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(resp.status === 200){
          setisSupprimerClicked(false);
          setmessageSuccess("Succès : la ferme a bien été supprimée.");
           
          setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
            }, 2000);
            setTimeout(() => {
              setmessageSuccess("");
            }, 3000);
            setTimeout(()=>{
              navigation.navigate('MesFermes');
            }, 3000);


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
        setloaderDelete(false);
      }
    }
  }


  return (
    <>
      <View style={styles.container}>



      <AlertError message={messageError} visible={showError} />
      <AlertSuccess message={messageSuccess} visible={showSuccess} />

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >

                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>Ma Ferme</Text>
                  <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
                    <Ionicons name="menu" size={24} color="#3E6715" />
                  </TouchableOpacity>
                </View>
                
              {
                loading?
                <SingleFarmSkeleton /> 
                :
                <>
                  {
                      
                      dataFarm && 
                      <>
                        <View style={styles.profileContainer}>
                          <Image
                            style={styles.profileImage}
                            source={{ uri: 'https://github.com/akramthedev/PFE_APP/blob/main/Design%20sans%20titre%20(3).png?raw=true' }}  
                          />
                        </View>


                        <Text style={{marginLeft: 23, marginBottom : 20, fontSize : 17, fontWeight : "800"}}>Informations</Text>


                        <View style={styles.rowXXX}>
                          <Text style={styles.label}>Appellation :</Text>
                          {
                            !isModifyClicked ? 
                            <Text style={styles.value}>{dataFarm.name}</Text>
                            :
                            <TextInput
                              value={appela}
                              onChangeText={(text) => setAppela(text)}
                              style={styles.inputPP}
                              placeholder="Nom de la ferme..."
                            />
                          }
                        </View>

                        <View style={styles.rowXXX}>
                          <Text style={styles.label}>Localisation :</Text>
                          {
                            !isModifyClicked ? 
                            <Text style={styles.value}>{dataFarm.location === null || dataFarm.location === "" ? "---" : dataFarm.location}</Text>
                            :
                            <TextInput
                              value={location}
                              onChangeText={(text) => setlocation(text)}
                              style={styles.inputPP}
                              placeholder="Emplacement de la ferme..."
                            />
                          }
                        </View>

                        <View style={styles.rowXXX}>
                          <Text style={styles.label}>Superficie :</Text>
                          {
                            !isModifyClicked ? 
                            <Text style={styles.value}>{dataFarm.size === null || dataFarm.size === "" ? "---" : <>{dataFarm.size} hectare</>}</Text>
                            :
                            <TextInput
                              value={mesureX}
                              onChangeText={(text) => {
                                const numericValue = text.replace(/[^0-9]/g, ''); 
                                setMesX(numericValue); 
                              }}
                              style={styles.inputPP}
                              placeholder="Mesure de la ferme..."
                              keyboardType="numeric" 
                            />
                          }
                        </View>

                        <View style={styles.rowXXX}>
                          <Text style={styles.label}>Date de création :</Text>
                          <Text style={styles.value}>{formatDate(dataFarm.created_at)}</Text>
                        </View>

                        <View style={styles.hr} />

                        <View
                          style={{
                            flexDirection : "row", 
                            justifyContent : "space-between",
                            alignItems : "center",
                            marginBottom : 20
                          }}
                        >
                            <Text style={{marginLeft: 23,  fontSize : 17, fontWeight : "800"}}>Serres associées {dataSerre && ": "+dataSerre.length} </Text>
                            <TouchableOpacity onPress={()=>{ navigation.navigate('AjouterUneSerre', { id: id });}}  style={styles.saveButtonUZUQSOEFD}>
                              <Text style={styles.text487C15}>+ Ajouter une Serre</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ height : 222 }} >
                        {
                          dataSerre && 
                          <>
                          {
                            dataSerre.length === 0 ? 
                            <View style={{ height : 80, alignItems : "center", justifyContent : "center" }} >           
                              <Text style={{ color : "gray",fontSize : 15, textAlign : "center" }}>Aucune donnée</Text>
                            </View>
                            :
                            dataSerre.map((serre, index)=>{
                              return(
                                <TouchableOpacity
                                    key={serre.id}
                                    style={{
                                      height: 50,
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      paddingHorizontal: 10,
                                      backgroundColor: '#f9f9f9', 
                                      marginBottom: 10,
                                      borderRadius: 10,
                                      marginRight : 23, 
                                      marginLeft : 23
                                    }}
                                    onPress={
                                      ()=>{
                                        navigation.navigate('ModifierSerre', { serreId: serre.id,type: serre.type, farmId : serre.farm_id, size: serre.size, name : serre.name});
                                      }
                                    }
                                  >
                                    <Text>{serre.name}</Text>   
                                    
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="settings-outline" style={styles.icon} size={24} color="#5B5B5B" />
                                    </TouchableOpacity>
                                  </TouchableOpacity>
                              )
                            })
                          }
                          </>
                        }
                        </ScrollView>

                      </>
                    }
                </>
              }
          </ScrollView>



          {
            isSupprimerClicked && 
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
                width: '80%', 
                shadowColor: '#000', 
                shadowOpacity: 0.2, 
                shadowRadius: 10,
                elevation: 5 // Ombre pour Android
              }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  marginBottom: 20 
                }}>
                  Si vous supprimez cette ferme, toutes les prédictions et serres associées seront également supprimées.
                </Text>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between' 
                }}>

                  <TouchableOpacity style={{
                    backgroundColor: '#eee', 
                    paddingVertical: 13,
                    width : "30%",
                    borderRadius: 5,
                    alignItems : "center", 
                    justifyContent : "center"
                    }}
                    onPress={()=>{setisSupprimerClicked(false)}}
                    disabled={loaderDelete}
                    >
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>
                    Annuler
                    </Text>
                  </TouchableOpacity>


                  <TouchableOpacity style={{
                    backgroundColor: '#AF0000', 
                    paddingVertical: 13,
                    width : "67%",
                    borderRadius: 5,
                    alignItems : "center", 
                    justifyContent : "center",                
                    borderRadius: 5
                  }}
                    disabled={loaderDelete}
                    onPress={()=>{
                      handleLickDelete();
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {
                      loaderDelete ? 
                      "suppression en cours..."
                      :
                      "Supprimer définitivement"
                    }
                    </Text>
                  </TouchableOpacity>
                  
                </View>
              </View>
            </View>
          }


          {
            loading === false && 
            <>
            {
              !isModifyClicked ? 
              <View style={styles.buttonContainer}>
                <TouchableOpacity  disabled={loaderDelete} onPress={()=>{setisSupprimerClicked(true)}}  style={styles.saveButton22}>
                  <Text style={styles.buttonTextWhite}>Supprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={loaderDelete}  onPress={()=>{setIsModifyClick(!isModifyClicked)}}  style={styles.saveButton}>
                  <Text style={styles.buttonTextWhite}>Modifier la ferme</Text>
                </TouchableOpacity>
              </View>
              :
              <View style={styles.buttonContainer}>
                <TouchableOpacity   
                  disabled={loaderDelete}
                style={[
                  styles.cancelButton, 
                  { opacity: loadingModification ? 0.5 : 1 } 
                ]}  onPress={()=>{setIsModifyClick(!isModifyClicked);  if(dataFarm.size !== null && dataFarm.size !== ""){setMesX(dataFarm.size.toString())}else{setMesX(null)}  ;setAppela(dataFarm.name);setlocation(dataFarm.location)}} >
                  <Text style={styles.buttonTextBlack}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity   
                  disabled={loaderDelete}
                style={[
                  styles.saveButton, 
                  { opacity: loadingModification ? 0.5 : 1 } 
                ]}   onPress={()=>{handleSaveData()}} >
                  <Text style={styles.buttonTextWhite}>
                    {
                      loadingModification ? 
                      "Modification..."
                      :
                      "Sauvegarder"
                    }
                  </Text>
                </TouchableOpacity>
              </View> 
            }
            </>
          }


      </View>


      
      
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
                  </TouchableOpacity><TouchableOpacity onPress={() => { navigation.navigate('AjouterUnePlaque'); toggleMenu(); }} style={styles.menuItem}>
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


    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 23,
  },
  titleContainer: {
    marginBottom : 23,    marginTop : 18,

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
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  containerXKPZRSF: {
    justifyContent: 'center',  
    alignItems: 'center',      
    backgroundColor: '#fff', 
    height : 444,  
    width : "100%",
  },

  imageJOZNJORSFD: { 
    width: 30,
    height: 30,  
  },
  buttonTextBlack: {
    color: 'black',
    fontSize: 16,
  },
  
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 15,
  },

  rowXXX: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems : "center",
    height : 42,
    marginLeft : 23,
    marginRight : 23 
  },
  hr: {
    borderBottomColor: '#dcdcdc', 
    borderBottomWidth: 1,         
    marginTop : 20,
    marginBottom : 20,
    marginRight : 23, 
    marginLeft : 23
  },
  label: {
    fontWeight: '500',
    fontSize : 16
  },
  value: {
    textAlign: 'right',
    fontSize : 16
  },

  roleText: {
    marginTop: 1,
    fontSize: 14,
    color : "#B8B8B8",
    fontWeight: '500',
  },
  input: {
    height: 40,
    paddingRight: 22,
    marginLeft : 23, 
    marginRight : 23,
    fontSize : 17
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 23, 
    position: 'absolute',  
    bottom: 20,           
    left: 0,
    right: 0,
    marginRight: 23,
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
    width : "68%",
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: '#487C15',
    alignItems: 'center',
    borderRadius: 8,
  },

  saveButton22: {
    width : "30%",
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: '#AF0000',
    alignItems: 'center',
    borderRadius: 8,
  },

  saveButtonUZUQSOEFD : {
    width : 180,
    height : 40,
    alignItems : "center",
    justifyContent : "center",
    marginRight : 23, 
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth : 1, 
    borderColor : 'white'
  },
  text487C15 : {
    color : "black",
    fontSize : 16,
    fontWeight : "500"
  },
  buttonTextWhite: {
    color: '#fff',
    fontSize: 16,
  },
  buttonTextBlack: {
    color: 'black',
    fontSize: 16,
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
    bottom: 53,
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
  modifierVotreX : {
    height: 21,
    marginTop : 6 ,
    width : "auto",
    justifyContent : "space-between",
    marginBottom: 16,
    flexDirection: 'row',      
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginLeft : 50, 
    marginRight : 50
  },
  modifierVotreXText : {
    color: "#6D6D6D",
    fontSize : 16
  },
  inputPP: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 3,
    width : "50%",
    paddingLeft : 10,
    paddingRight : 6,
    borderRadius: 8,
    fontSize : 15,
    backgroundColor: '#fff',
  },
});

export default SingleFarmPage;
