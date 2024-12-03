import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Image ,ScrollView, TextInput,Alert,StyleSheet,FlatList, TouchableOpacity, Text, View, PanResponder, Animated, Dimensions  } from 'react-native';
import CustomDatePicker from "../Components/CustomDatePicker";
import { Picker } from '@react-native-picker/picker'; 
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { useRoute } from '@react-navigation/native';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
const { width: screenWidth } = Dimensions.get('window');
import LoaderSVG from '../images/Loader.gif'
import rateLimit from 'axios-rate-limit';
import { FontAwesome5 } from '@expo/vector-icons'; // 
const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, 
  perMilliseconds: 1000, 
});


import { useAuth } from '../Helpers/AuthContext';

const Calculation = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [loaderMM, setloaderMM] = useState(false);
  const [showError, setShowError] = useState(false);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState('');
  const [loadingX, setLoadingX] = useState(true);
  const [role, setRole] = useState(null);
  const [selectedFarmObj, setSelectedFarmObj] = useState(null);  
  const [selectedGreenhouseObj, setSelectedGreenhouseObj] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [IDCurrent, setIDCurrent] = useState(null);
  const [imageData, setimageData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { id, isToModify } = route.params;
  const [predictionData,setpredictionData] = useState(null);
  const [predictionDataModifying,setpredictionDataModifying] = useState(null);
  const [dataImages, setDataImages] = useState(null);
  const [isModifyClicked, setisModifiedClicked] = useState(false)
  const navigation = useNavigation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const { settriggerIt, triggerIt } = useAuth();
  const [triggerTheFucker, settriggerTheFucker] = useState(false);
  const [ImageToSee,setImageToSee] = useState(null);
  const [nombreMineuses , setnombreMineuses ] = useState(null);
  const [nombreMouches , setnombreMouches ] = useState(null);
  
  const togglePopup = () => {
    if (showPopup) {

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,  
        useNativeDriver: true,
      }).start(() => setShowPopup(false));  
    } else {
      setShowPopup(true);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };


  useFocusEffect(
    useCallback(() => {
      const x = async ()=>{
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        setIDCurrent(userIdNum);

        if(isToModify){
          if(isToModify === true){
            setisModifiedClicked(true);
          }
          else{
            setisModifiedClicked(false);
          }
        }

      }
      x(); 
  }, []));

  
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




  useEffect(()=>{
    const x = async()=>{
      try{
        setLoadingX(true);
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        
        const token = await getToken();   
        const response = await axiosInstance.get(`${ENDPOINT_API}getFarmsWithGreenhouses/${userIdNum}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if(response.status  === 200){
          setFarms(response.data);
        }
        else{
          setFarms([]);
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
        setLoadingX(false);

      }
    }
    x();
  }, []);



  const [NameFarmX, setNameFarmX] = useState(null);
  const [NameSerreX, setNameSerreX] = useState(null);
  const [NamePlaqueX, setNamePlaqueX] = useState(null);

  const fetchData = async () => {
    if (id) {
      try {
        setLoading(true);
        const token = await getToken();         
        const response = await axiosInstance.get(`${ENDPOINT_API}singlePrediction/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          const prediction = response.data;
          setpredictionData(prediction);


          if(prediction.farm_id !== null && prediction.farm_id !== ""){
            if(prediction.serre_id !== null && prediction.serre_id !== ""){
              if(prediction.plaque_id !== null && prediction.plaque_id !== ""){
                const resp = await axios.get(`${ENDPOINT_API}getNamesOfIds/${prediction.farm_id}/${prediction.serre_id}/${prediction.plaque_id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if(resp.status === 200){
                  setNameFarmX(resp.data.nameFarmX);
                  setNameSerreX(resp.data.nameSerreX);
                  setNamePlaqueX(resp.data.namePlaqueX);
                }
                else{
                  setNameFarmX("---");
                  setNameSerreX("---");
                  setNamePlaqueX("---");
                }
              }
              else{
                const resp = await axios.get(`${ENDPOINT_API}getNamesOfIds/${prediction.farm_id}/${prediction.serre_id}/akram`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if(resp.status === 200){
                  setNameFarmX(resp.data.nameFarmX);
                  setNameSerreX(resp.data.nameSerreX);
                }
                else{
                  setNameFarmX("---");
                  setNameSerreX("---");
                }
                setNamePlaqueX("---");
              }
            }
            else{
              const resp = await axios.get(`${ENDPOINT_API}getNamesOfIds/${prediction.farm_id}/akram/akram`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if(resp.status === 200){
                setNameFarmX(resp.data.nameFarmX);
              }
              else{
                setNameFarmX("---");
              }
              setNameSerreX('---');
              setNamePlaqueX("---");
            }
          }
          else{
            setNameFarmX('---');
            setNameSerreX('---');
            setNamePlaqueX("---");
          }





          let i = 0;

          let sumMouches = 0;
          let sumMineuses = 0;

          if(prediction.images.length !== 0){
            for(i=0;i<prediction.images.length;i++){
              sumMineuses = sumMineuses + prediction.images[i].class_B;
              sumMouches = sumMouches + prediction.images[i].class_A;
            }

            setnombreMineuses(sumMineuses);
            setnombreMouches(sumMouches);
            
          }
          else{
            setnombreMineuses(0);
            setnombreMouches(0);
          }

          setpredictionDataModifying(prediction);

 
        
 
      
          
          const response2 = await axiosInstance.get(`${ENDPOINT_API}predictions/${id}/images`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response2.status === 200) {
            setimageData(response2.data[0]);
            setImageToSee(`http://10.0.2.2:8000/storage/`+response2.data[0].name);
           }
           else{
            setimageData(null)
           }
        } else {
          setmessageError("Erreur 682: un problème lors de la récupération des données.");
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          setTimeout(() => {
            setmessageError("");
          }, 4000);
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
    }
  };
  

 





  useEffect(()=>{
    fetchData();
  },[id, triggerTheFucker]);


  


  const formatDate = (dateString) => {
    const date = new Date(dateString);  
    const day = String(date.getDate()).padStart(2, '0');  
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const year = date.getFullYear();  
    return `${day}/${month}/${year}`; 
  };




  const formatDateForCreatedAt = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};




  const handleSaveData = async (id)=>{

    setloaderMM(true);

    let dataJOJO = {
      ...predictionDataModifying,
      farm_id : selectedFarm, 
      serre_id : selectedGreenhouse, 
      created_at : formatDateForCreatedAt(selectedDate)
    }


   try{
      const token = await getToken();         
      const response = await axiosInstance.patch(`${ENDPOINT_API}predictions/${id}`, dataJOJO , {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(response.status === 200){
        settriggerTheFucker(!triggerTheFucker);
        setmessageSuccess("Succès : Vos informations ont été mis à jour.");
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
      setisModifiedClicked(false);
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
      setisModifiedClicked(false);
   } finally{
    setloaderMM(false);
   }

  }
  




  const handleFarmChange = (farmId) => {
    setSelectedFarm(farmId);
    setSelectedGreenhouse(null);
    setSelectedGreenhouseObj(null);
    const selectedFarm = farms.find(farm => farm.id === farmId);
    setSelectedFarmObj(selectedFarm); // Set selected farm object

    if (selectedFarm && selectedFarm.serres && Array.isArray(selectedFarm.serres)) {
      setGreenhouses(selectedFarm.serres);
      setSelectedGreenhouse(''); // Reset greenhouse when changing farm
    } else {
      setGreenhouses([]);
    }
  };



  
  const handleGreenhouseChange = (serreId) => {
    setSelectedGreenhouse(serreId);
    
    const selectedSerre = greenhouses.find(serre => serre.id === serreId);
    setSelectedGreenhouseObj(selectedSerre); // Set selected greenhouse object
  };


  const [loaderD, setLoaderD] = useState(false);
  const [isSupprimerClicked, setIsSupprimerClicked] = useState(false);
  
  const handleLickDelete = async()=>{
    try{
      if(predictionData){
        setLoaderD(true);
        const token = await getToken();

        const response = await axios.delete(`${ENDPOINT_API}predictions/${predictionData.id}`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if(response.status === 200){
          setIsSupprimerClicked(false);
          navigation.goBack();
         }
        else{
          setIsSupprimerClicked(false);
          setmessageError("Oups, un incident est survenu lors de la suppression.");
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          setTimeout(() => {
            setmessageError("");
          }, 4000);
        }

      
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
      }, 4000);    } finally{
      setLoaderD(false);
    }
  }




  return (
    <>

    <AlertError message={messageError} visible={showError} />
    <AlertSuccess message={messageSuccess} visible={showSuccess} />

      {showPopup && (
        <Animated.View style={[showPopup ? styles.popupContainer : styles.popupContainerNot, { opacity: fadeAnim }]}>
          <TouchableOpacity activeOpacity={1} style={styles.popupTouchable} onPress={togglePopup}>
            <Image
              style={styles.popupBackground}
              source={{ uri: ImageToSee && ImageToSee }}  
            />
            <Text style={styles.popupText}>Cliquez n'importe où pour fermer</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {
        isSupprimerClicked && 
        <View style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex : 999999999,
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
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 5 
            }}>

              Confirmer la suppression
            
            </Text>
            <Text style={{ 
              fontSize: 17, 
              fontWeight: '400', 
              marginBottom: 25 
            }}>

              Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.

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
                onPress={()=>{setIsSupprimerClicked(false)}}
                disabled={loaderD}
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
                disabled={loaderD}
                onPress={()=>{
                  handleLickDelete();
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {
                  loaderD ? 
                  "Suppression en cours..."
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
    !loading && predictionData && predictionDataModifying  ?   

    <View style={styles.container}>

    <ScrollView>
        <View style={styles.titleContainer}>

          {
            loading && 
            <View style={{ position: "absolute", left :0 ,zIndex: 10,}} > 
              <Image
                source={LoaderSVG}  
                style={styles.imageJOZNJORSFDOJFSWNVDO} 
              />
              <Text>
                &nbsp;&nbsp;Chargement...
              </Text>
            </View>
          }


          <Text style={styles.titleText}>{isModifyClicked ? "Modifier le Calcul" : "Détails du Calcul"}</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
            <Ionicons name="menu" size={24} color="#3E6715" />
          </TouchableOpacity>
        </View>

        {isModifyClicked  ? 
          <> 
          {
            predictionDataModifying && 
            <>
              <Text style={styles.label}>Plaque</Text>
              <TextInput
                style={styles.input}
                placeholder="Veuillez saisir l’ID de la plaque..."
                value={predictionDataModifying.plaque_id}
                onChangeText={(text) =>
                  setpredictionDataModifying((prevData) => ({
                    ...prevData,
                    plaque_id: text,  
                  }))
                }
              />
 


              <Text style={styles.label}>Ferme</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedFarm}
                  style={styles.picker}
                  onValueChange={handleFarmChange}
                  enabled={!loadingX}
                >
                  {/* Render the default option only if there's no selected farm */}
                  {!selectedFarm && (
                    <Picker.Item label="Sélectionnez une ferme" value="" />
                  )}
                  {farms && farms.map(farm => (
                    <Picker.Item key={farm.id} label={farm.name} value={farm.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Serre</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedGreenhouse}
                  style={styles.picker}
                  onValueChange={handleGreenhouseChange}
                  enabled={!!selectedFarm}
                >
                  {/* Render the default option only if there's no selected greenhouse */}
                  {!selectedGreenhouse && (
                    <Picker.Item label="Sélectionnez une serre" value="" />
                  )}
                  {greenhouses && greenhouses.map(serre => (
                    <Picker.Item key={serre.id} label={serre.name} value={serre.id} />
                  ))}
                </Picker>
              </View>



                    
              <Text style={styles.label}>Date de création</Text>
              <CustomDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
               
            </>
          }
          </>
         : (
          <>

            <View style={styles.cardKLKLKL}>
              <View style={styles.cardHeaderKLKLKL}>
                 <Text style={styles.cardTitleKLKLKL}>Informations du Calcul</Text>
              </View>
              <View style={styles.cardContentKLKLKL}>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Nom de ferme: </Text>
                  {loading ? "--" : NameFarmX ? NameFarmX : "---"}
                </Text>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Nom de serre: </Text>
                  {loading ? "--" : NameSerreX && NameSerreX  }
                </Text>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Nom de plaque: </Text>
                  {loading ? "--" : NamePlaqueX && NamePlaqueX}
                </Text>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Date de création: </Text>
                  {loading ? "--" : formatDate(predictionData.created_at)}
                </Text>
                 
              </View>
            </View>

            <View style={styles.hr} />


            <View style={styles.cardKLKLKL}>
              <View style={styles.cardHeaderKLKLKL}>
                 <Text style={styles.cardTitleKLKLKL}>Résultats du Calcul</Text>
              </View>
              <View style={styles.cardContentKLKLKL}>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Pourcentage: </Text>
                  {loading ? "--" : `${predictionData.result}%`}
                </Text>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Nombre de Mouches: </Text>
                  {loading ? "--" : nombreMouches && nombreMouches}
                </Text>
                <Text style={styles.infoKLKLKL}>
                  <Text style={styles.label}>Nombre de Tuta: </Text>
                  {loading ? "--" : nombreMineuses && nombreMineuses }
                </Text>
               </View>
 
            </View>
 


            <View style={styles.cardKLKLKL2}>
              <TouchableOpacity onPress={togglePopup} style={styles.saveButton2}>
                <Text style={styles.buttonTextBB} >
                  Voir l'image
                </Text>
              </TouchableOpacity>
            </View>


          </>
        )}

      </ScrollView>


      {/* {
        isModifyClicked ? 
        <View style={styles.buttonRow1} >
          <TouchableOpacity disabled={loaderMM} onPress={()=>{ setisModifiedClicked(!isModifyClicked);setpredictionDataModifying(predictionData); }} style={styles.cancelButton}>
            <Text style={styles.buttonTextB}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity  disabled={loaderMM} style={styles.saveButton} onPress={()=>{ handleSaveData(predictionData.id); }} >
            <Text style={styles.buttonTextW}>{loaderMM ? "Modification en cours..." : "Sauvegarder"}</Text>
          </TouchableOpacity>
        </View>
        :
        <View style={styles.buttonRow1} >
       
          <TouchableOpacity disabled={loaderD} onPress={()=>{setIsSupprimerClicked(true); }} style={styles.saveButton11}>
            <Text style={styles.buttonTextW}>Supprimer</Text>
          </TouchableOpacity>

          <TouchableOpacity  disabled={loaderD}  onPress={()=>{ setisModifiedClicked(!isModifyClicked) }} style={styles.saveButton1}>
            <Text style={styles.buttonTextW}>Modifier le Calcul</Text>
          </TouchableOpacity>
       
        </View>
      } */}

      
    </View>
    :
      <View style={{ height : "100%" , width : "100%", backgroundColor  :"white", alignItems : "center", justifyContent : "center", flexDirection : "row" }} > 
        <Image
          source={LoaderSVG}  
          style={styles.imageJOZNJORSFDOJFSWNVDO2} 
        />
        <Text
          style={{ color : "gray" }}
        >
          &nbsp;&nbsp;Chargement...
        </Text>
      </View>

  }
   
   
      
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


      
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 23,
  },
  titleContainer: {
    marginTop : 18,
    marginBottom : 23,
    alignItems: 'center',
    position : "relative"
  },
  menu :{
    position : "absolute",
    right : 0,
    zIndex: 10, 
  }, 
  titleText: {
    color: 'black',
    fontSize: 19,
    fontWeight: 'bold',
  },
   
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    fontSize : 16,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 16,
    height: 48
  },
  pickerWrapper: {  
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
    justifyContent : "center"
  },
  picker: {
    borderWidth: 1,
     borderRadius: 10,
    fontSize : 16,
     height: 48, 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    fontSize : 16,
  },
  buttonRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '48%',    fontSize : 16,

    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '32%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#487C15',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '64%',
    alignItems: 'center',
  },
  saveButton2: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth : 1,
    borderColor : "#ddd",
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '100%',
    marginTop : 20,
    alignItems: 'center',
  },
  saveButton1 : {
    backgroundColor: '#487C15',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '64%',
    alignItems: 'center',
  },
  saveButton11 : {
    backgroundColor: '#AF0000',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '32%',
    alignItems: 'center',
  },
  buttonTextW: {
    color: 'white',
    fontSize: 16,
  },
  buttonTextB: {
    color: 'black',
    fontSize: 16,
  },
  buttonTextBB: {
    color: 'black',
    fontSize: 16,
    fontWeight : "500"
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
  imageJOZNJORSFDOJFSWNVDO : {
    height : 23, width : 23
  },
  imageJOZNJORSFDOJFSWNVDO2 : {
    height : 23, width : 23

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
    alignItems : "center"
  },

  carouselImage: {
    width: screenWidth * 0.3,   
    height: 170,  
    marginHorizontal: 10,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  leftButton: {
    position: 'absolute',
    top: '40%',
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 50,
  },
  rightButton: {
    position: 'absolute',
    top: '40%',
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 50,
  },
  carouselButton: {
    backgroundColor: '#8DC94B',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 500,
    marginLeft : 7,
    marginRight : 7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dot: {
    height: 8.5,
    width: 8.5,
    borderRadius: 5,
    marginTop : 10,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#8DC94B',
  },
  inactiveDot: {
    backgroundColor: '#D5D5D5',
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height : '100%',
    width : "100%",
    zIndex: 99999999999,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  popupContainerNot : {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height : '0%',
    width : "0%",
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  popupBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  popupText: {
    color: '#fff',
    fontSize: 24,
    height : 33,
    backgroundColor : "black",
    textAlign: 'center',
    position : "absolute", 
    width : "100%",
    justifyContent : "flex-start",
    bottom : 0
  },
  PopUpTitii : {
    backgroundColor : "black", 
    width : "100%"
  },
  popupTouchable: {
    width: '100%',
    height: '100%',
  },
  popupBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },


  containerKLKLKL: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  cardKLKLKL: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingBottom : 0,
    paddingTop : 20,
    //shadowColor: '#000',
    //shadowOpacity: 0.1,
    //shadowRadius: 5,
    //elevation: 3,
    width : "100%",
    margin : "auto", 
    //borderWidth : 1, 
    //borderColor : "#eee"
  },
  cardKLKLKL2: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop : 20,
    paddingBottom : 0,
     //shadowColor: '#000',
    //shadowOpacity: 0.1,
    //shadowRadius: 5,
    //elevation: 3,
    width : "98.1%",
    paddingTop : 0,
    margin : "auto", 
    //borderWidth : 1, 
    //borderColor : "#eee"
  },
  cardHeaderKLKLKL: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleKLKLKL: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContentKLKLKL: {
    paddingLeft: 10,
    marginLeft : 10
  },
  infoKLKLKL: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  labelKLKLKL: {
    fontWeight: 'bold',
    color: '#333',
  },

  hr: {
    borderBottomColor: '#EFEFEF', 
    borderBottomWidth: 1,         
    marginRight : 23, 
    marginLeft : 23, 
    marginBottom : 10, 
    marginTop : 20
  },
 

});
export default Calculation;


