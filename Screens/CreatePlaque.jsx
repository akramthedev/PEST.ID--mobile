import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Image ,ScrollView, TextInput,StyleSheet, TouchableOpacity, Text, View, PanResponder, Animated, Dimensions, Alert  } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
const { width: screenWidth } = Dimensions.get('window');
import { useAuth } from '../Helpers/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINT_API } from './endpoint';
import { AlertError, AlertSuccess } from "../Components/AlertMessage";
import LoaderSVG from '../images/Loader.gif'
import rateLimit from 'axios-rate-limit';
 


const formatDate = (dateString) => {
  const date = new Date(dateString);  
  const day = String(date.getDate()).padStart(2, '0');  
  const month = String(date.getMonth() + 1).padStart(2, '0');  
  const year = date.getFullYear();  
  return `${day}/${month}/${year}`; 
};



const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, // maximum number of requests
  perMilliseconds: 1000, // time window in milliseconds
});

const CreatePlaque = ({route}) => {
  const [IDCurrent, setIDCurrent] = useState(null);
  const { settriggerIt, triggerIt } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationCoords, setLocationCoords] = useState(null); 
  const [mapUrl, setMapUrl] = useState(''); 
  const [Mesure, setMesure] = useState('');
  const [role, setRole] = useState(null);
  const [loaderOfMap, setloaderOfMap] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageError, setmessageError] = useState("");
  const [messageSuccess, setmessageSuccess] = useState("");
  const [loading, setloading] = useState(false);
  const [farms, setFarms] = useState(null);
  const [serres, setSerres] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState(null);
  const [Appelation, setAppelation] = useState('');
  const navigation = useNavigation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [Fermes, setFermes] = useState([]);
  const [options, setoptions] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [LoadingCreatingNewPlaque, setLoadingCreatingNewPlaque] = useState(false);
  
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
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        setIDCurrent(userIdNum);
      }
      x(); 
  }, []));



  const handleFarmChange = (farmId) => {

    setSelectedGreenhouse(null);

    if(farmId.value !== null){
      setSelectedFarm(farmId);
      const selectedFarm = farms.find(farm => farm.id === farmId.value);

      if (selectedFarm) {
        const greenhouseOptions = selectedFarm.serres.map(serre => ({
          value: serre.id,
          label: serre.name
        }));
        setGreenhouses(greenhouseOptions);
      } else {
        setGreenhouses([]);
      }
    }
    else{
      setSelectedFarm([]);
      setGreenhouses([]);
    }
};







  const fetchFarmsAndSerres = async () => {
    try {
      setloading(true);
      const userId = await AsyncStorage.getItem('userId');
      const userIdNum = parseInt(userId);
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${ENDPOINT_API}getAllFarmsWithTheirSerres/${userIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        
        setFarms(response.data);
        
        const newOptions = response.data.map((farm) => ({
          value: farm.id,
          label: farm.name,
        }));
        
        setoptions(newOptions);

        let i = 0;
      
        // Transformation des données des fermes
        const transformedData = response.data.map((item) => {
          i++;
          let createdAt = formatDate(item.created_at);
          return {
            idInc: i,
            id: item.id,
            name: item.name ? item.name : "---",
            serres: item.serres,
            location: item.location ? item.location : "---",
            size: item.size ? item.size : "---",
            created_at: item.created_at ? createdAt : "---",
          };
        });


        setFermes(transformedData);


      } else {
        setFarms([]);
        Alert.alert("Une erreur est survenue lors de la récupération des fermes.");
        setShowError(true);
      }
    } catch (error) {
      setFarms([]);
      Alert.alert("Une erreur est survenue lors de la récupération des fermes.");
      setShowError(true);
      console.error('Erreur :', error.message);
    } finally {
      setloading(false);
    }
  };





  const handleCreatePlaque = async () => {
    if (!Appelation) {
      setmessageError("Le nom de la plaque ne peut pas être vide.");
      setShowError(true);
      return;
    }
    if( !selectedGreenhouse) {
      setmessageError("Veuillez sélectionner une serre.");
      setShowError(true);
      return;
    }

    if (!selectedFarm) {
      setmessageError("Veuillez sélectionner une ferme.");
      setShowError(true);
      return;
    }


    try {
      setloading(true);
      const token = await AsyncStorage.getItem('token');

      const data = {
        name : Appelation, 
        idSerre : selectedGreenhouse,
        idFarm : selectedFarm, 
      };

      const response = await axios.post(`${ENDPOINT_API}createPlaque`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSelectedFarm(null);
        setSelectedGreenhouse(null);
        setAppelation("");

        setmessageSuccess("Plaque créée avec succès !");
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000);
      } else {
        setmessageError("Une erreur est survenue lors de la création de la plaque.");
        setShowError(true);
      }
    } catch (error) {
      setmessageError("Une erreur est survenue lors de la création de la plaque.");
      setShowError(true);
      console.error('Erreur :', error.message);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchFarmsAndSerres();
  }, []);




  return (
    <>
    <View style={styles.container}>
 
    <AlertError message={messageError} visible={showError} />
    <AlertSuccess message={messageSuccess} visible={showSuccess} />
      
        <ScrollView>
          <View style={styles.titleContainer}>
          {
            loading && !farms && 
            <View style={{ position: "absolute", left :0 ,zIndex: 10,}} > 
              <Image
                source={LoaderSVG}  
                style={styles.imageJOZNJORSFDOJFSWNVDO} 
              />
            </View>
          }

            <Text style={styles.titleText}>Nouvelle Plaque</Text>
            <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
              <Ionicons name="menu" size={24} color="#3E6715" />
            </TouchableOpacity>
          </View>
       


          {
        farms && 
      
        <>
          <Text style={styles.label}>Appelation</Text>
          <TextInput
            style={styles.input}
            placeholder="Veuillez saisir le nom de la plaque..."
            value={Appelation}
            editable={farms.length > 0}
            onChangeText={setAppelation}
          />

        <Text style={styles.label}>Ferme</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            enabled={farms.length > 0}
            selectedValue={selectedFarm}
            style={styles.picker}
            onValueChange={(itemValue) => handleFarmChange(itemValue)}
          >
            <Picker.Item label="Veuillez sélectionner une ferme..." value="" />
            {farms.map((farm) => (
              <Picker.Item key={farm.id} label={farm.name} value={farm.id} />
            ))}
          </Picker>
        </View>


        <Text style={styles.label}>Serre</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedGreenhouse}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedGreenhouse(itemValue)}
            enabled={!!selectedFarm}
          >
            <Picker.Item label="Veuillez sélectionner une serre..." value="" />
            {selectedFarm && farms.find(f => f.id === selectedFarm)?.serres.map((serre) => (
              <Picker.Item key={serre.id} label={serre.name} value={serre.id} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerWrapper2}></View>
        {
          farms.length === 0 && 
          <Text style={styles.label2222}>Veuillez ajouter des fermes avant de créer des plaques.</Text>
        }


        </>

      }


      </ScrollView>


      {
        farms && 
      
        <>
        <View style={styles.buttonRow1}>
        <TouchableOpacity  disabled={loading || farms.length === 0}  style={[
            styles.cancelButton, 
            { opacity: loading ? 0.5 : 1 } 
          ]}    onPress={()=>{navigation.goBack()}}  >
          <Text style={styles.buttonTextB} >Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={loading || farms.length === 0}  style={[
            styles.saveButton, 
            { opacity: loading || farms.length === 0 ? 0.5 : 1 } 
          ]} onPress={handleCreatePlaque}  >
          <Text style={styles.buttonTextW}>{loading ? "Création de la plaque..." : "Enregistrer la plaque"}</Text>
        </TouchableOpacity>
        </View> 
        
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
    marginBottom : 23,
    alignItems: 'center',
    position : "relative",
    marginLeft : 23, 
    marginRight : 23,
    marginTop : 18,
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
  searchButton: {
    backgroundColor: '#f6f6f6',
    padding: 10,    marginLeft : 23, 
    marginRight : 23,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,    marginLeft : 23, 
    marginRight : 23,

  },
  label2222 : {
    fontSize: 16,
    color : "red",
    textAlign : "center",
    marginBottom: 8,    
    marginLeft : 50,
    marginRight : 50,
  },
  mapContainer: {
    marginTop: 16,
    height: 200,
    borderRadius: 10,
    marginBottom : 16,
    overflow: 'hidden',    marginLeft : 23, 
    marginRight : 23,

  },
  mapImage: {
    width: '100%',
    height: '100%',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    fontSize : 16,
    paddingLeft: 20,
    paddingRight: 20,    marginLeft : 23, 
    marginRight : 23,

    marginBottom: 16,
    height: 48,
    marginLeft : 23, 
    marginRight : 23,

  },
  pickerWrapper: {  
    borderWidth: 1,    marginLeft : 23, 
    marginRight : 23,

    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
    justifyContent : "center"
  },
  pickerWrapper2: {
    borderWidth: 1,    marginLeft : 23, 
    marginRight : 23,

    borderColor: 'white',
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
    fontSize : 16,    marginLeft : 23, 
    marginRight : 23,

  },



  serreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 8,
    position : "relative",    marginLeft : 23, 
    marginRight : 23,

  },
  serreIdContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  serreId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  serreName: {
    flex: 1,
    fontSize: 16,
  },
  iconContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    position : "absolute", 
    right : 0
  },
  addButton: {
    backgroundColor: 'white',
    height : 45,
    borderRadius: 8,
    marginTop: 16,
    justifyContent: 'center',
    backgroundColor : "#B1E77B", 
    alignItems : "center",    marginLeft : 23, 
    marginRight : 23,

  },
  addButtonText: {
    color: 'black',
    fontSize: 16,
  },

  buttonRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginLeft: 23,
    marginRight: 23,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 48,
    justifyContent :"center" ,
    paddingHorizontal: 16,
    width: '100%',    fontSize : 16,

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
  buttonTextW: {
    color: 'white',
    fontSize: 16,
  },
  buttonTextB: {
    color: 'black',
    fontSize: 16,
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
  imageJOZNJORSFDOJFSWNVDO : {
    height : 23, width : 23
  },

});
export default CreatePlaque;


