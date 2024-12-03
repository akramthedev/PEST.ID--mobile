import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Image ,ScrollView, TextInput,StyleSheet, TouchableOpacity, Text, View, PanResponder, Animated, Dimensions  } from 'react-native';
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
 
const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 5, // maximum number of requests
  perMilliseconds: 1000, // time window in milliseconds
});

const CreateFarm = ({route}) => {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageError,setmessageError] = useState("");
  const [messageSuccess,setmessageSuccess] = useState("");

  const [role, setRole] = useState(null);
  const [loaderOfMap, setloaderOfMap] = useState(false);

  
  useEffect(()=>{
    const x = async ()=>{
      const rolex = JSON.parse(await AsyncStorage.getItem('type'));
      setRole(rolex);
     }
    x();
  },[ ]);


  const { settriggerIt, triggerIt } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationCoords, setLocationCoords] = useState(null); 
  const [mapUrl, setMapUrl] = useState(''); 
  const navigation = useNavigation();
  const [Mesure, setMesure] = useState('');
  const [Appelation, setAppelation] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
 
  

  const fetchCoordinates = async () => {
    try {
      setloaderOfMap(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (data.length > 0) {
          const { lat, lon } = data[0];
          setLocationCoords({ lat, lon });
          setMapUrl(`https://maps.locationiq.com/v2/staticmap?key=pk.1705505b29c5df0924b07d671b88b7b9&center=${lat},${lon}&zoom=13&size=400x400&markers=icon:large-blue-cutout|${lat},${lon}`);
        } else {
          console.error('No results found.');
        }
      } else {
        console.error('Received non-JSON response');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    } finally {
      setloaderOfMap(false);
    }
  };

  
  


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




  const [loading, setloading] = useState(false);


  const createFarmFct= async () => {

    if(Appelation === "" ){
      setmessageError("Le nom de la ferme ne peut pas être vide.");
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          setTimeout(() => {
            setmessageError("");
          }, 4000);
    }
    else{
    try{
        setloading(true);
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);
        const token = await getToken(); 

        let dataX = {
          user_id : userIdNum, 
          name : Appelation, 
          location : searchQuery, 
          size : Mesure
        }
        const resp0 = await axiosInstance.post(`${ENDPOINT_API}farms`, dataX, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(resp0.status === 201){
          setAppelation('');
          setLocationCoords(null);
          setMesure('');
          setSearchQuery("");
          setMapUrl("");
          setmessageSuccess("Succès : votre ferme a été créée!");
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
            }, 2000);
            setTimeout(() => {
              setmessageSuccess("");
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
        setloading(false);
      }
      }
  }




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



  return (
    <>
    <View style={styles.container}>
 
    <AlertError message={messageError} visible={showError} />
    <AlertSuccess message={messageSuccess} visible={showSuccess} />
        <ScrollView>
          <View style={styles.titleContainer}>
          {
            loading && 
            <View style={{ position: "absolute", left :0 ,zIndex: 10,}} > 
              <Image
                source={LoaderSVG}  
                style={styles.imageJOZNJORSFDOJFSWNVDO} 
              />
            </View>
          }

            <Text style={styles.titleText}>Nouvelle Ferme</Text>
            <TouchableOpacity onPress={toggleMenu} style={styles.menu}>
              <Ionicons name="menu" size={24} color="#3E6715" />
            </TouchableOpacity>
          </View>
       
          <Text style={styles.label}>Appelation</Text>
          <TextInput
            style={styles.input}
            placeholder="Veuillez saisir le nom de la ferme..."
            value={Appelation}
            onChangeText={setAppelation}
          />

          <Text style={styles.label}>Superficie ( en hectare )</Text>
          <TextInput
            style={styles.input}
            placeholder="Veuillez saisir la mesure en hectare..."
            value={Mesure}
            onChangeText={setMesure}
          />
        

        <Text style={styles.label}>Localisation</Text>
        <TextInput
          style={styles.input}
          placeholder="Veuillez saisir la localisation..."
          value={searchQuery}
          onChangeText={setSearchQuery} 
        />
      
 
          


      </ScrollView>

      <View style={styles.buttonRow1}>
        <TouchableOpacity  disabled={loading}  style={[
            styles.cancelButton, 
            { opacity: loading ? 0.5 : 1 } 
          ]}    onPress={()=>{navigation.goBack()}}  >
          <Text style={styles.buttonTextB} >Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={loading}  style={[
            styles.saveButton, 
            { opacity: loading ? 0.5 : 1 } 
          ]} onPress={createFarmFct}  >
          <Text style={styles.buttonTextW}>{loading ? "Création de la ferme..." : "Enregistrer la ferme"}</Text>
        </TouchableOpacity>
      </View>


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
export default CreateFarm;


