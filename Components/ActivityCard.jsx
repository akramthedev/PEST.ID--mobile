 import React, {useState, useEffect} from 'react';
import { Image, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';


 


export  const ActivityCard = ({act, setISClicked, isClicked,setBRAND,setDEVICETYPE,setMODEL, setOS,setIP,setPROVIDER}) => {
 
   
  const formatDate = (dateString) => {
    const date = new Date(dateString);  
    const day = String(date.getDate()).padStart(2, '0');  
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const year = date.getFullYear();  
    const hours = String(date.getHours()).padStart(2, '0'); // Récupérer les heures
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Récupérer les minutes

    return `${hours}:${minutes} • ${day}/${month}/${year}`; // Inclure l'heure et les minutes
};



  return (
    <>
    {
      act && 
      <>
      <View key={act.id} style={styles.card}>
        <View
          style={styles.row}
        >
          <View style={{flexDirection : "row", justifyContent : "left", width : "100%" ,  alignItems : "center"}} >
            <Text
              style={{
                marginRight : 10
              }}
            >
            {
              act.isDanger === 0 ? 
              <Ionicons name="checkmark-circle-outline" size={20} color="#0d871a" />
              :
              <Ionicons name="close-circle-outline" size={20} color="#d40000" /> 
            }
            </Text>
            <Text 
              style={[styles.nameX, { color : act.isDanger === 1 ? "#151515" : "#151515", fontWeight : act.isDanger === 1 ? "500" : "500"  }]}
            >
            {
              act.action
            }
            </Text>
          </View>
          <Text style={styles.nameX2}>
          {
            formatDate(act.created_at)
          }
          </Text>
        </View>
        
        {
          act.action === "Une tentative de connexion à votre compte a échoué. Pour plus d’informations, cliquez sur le bouton ci-dessous." &&
          <View
            style={styles.row}
          >
            <TouchableOpacity
              style={{
                width : "100%",
                alignItems : "center", 
                justifyContent : "center",
                borderRadius : 8, 
                marginTop: 10,
                backgroundColor : "#fff5f5", 
                borderColor : "#ffe4e4", 
                borderWidth : 1, 
                height : 40
              }}
              onPress={()=>{
                setBRAND(act.brand);
                setDEVICETYPE(act.device_type);
                setMODEL(act.model);
                setOS(act.os);
                setIP(act.ip_address);
                setPROVIDER(act.provider);
                setISClicked(true);
              }}
            >
              <Text
                style={{
                  fontWeight : "500", 
                  color : "#AF0000"
                }}
              >
                Obtenir plus d'informations
              </Text>
            </TouchableOpacity>
          </View>
        }
      </View>
      <View style={styles.hr} />

      </>
    } 
    </>
  );
}  

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginLeft : 23,
    marginRight : 23,
  },
  row: {
    flexDirection: "column",
    justifyContent: 'space-between',
    alignItems: "center",
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 200,
    marginRight: 16,
  },
  rowHHHH : {
    flexDirection: "column",
    minHeight : 29,
    alignItems : "center",
    zIndex : 10
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
  },
  nameX : {
    fontWeight: '400',  
    fontSize: 15,
    width : "88%",
    color : "#151515",
  } ,
  nameX2 : {
    fontWeight: '400',
    fontSize: 13,
    color : "gray",
    width : "100%",
    marginTop : 4,
    textAlign : "left",
    marginRight: 0
  } ,
  details: {
    color: 'gray',
    marginBottom: 2,
  },
  detailsKKKK1 : {
    borderRadius : 50, 
    padding : 2.2, 
    paddingLeft : 8, 
    paddingRight : 8,
    backgroundColor : "#9001C2",
    marginRight : 6,
    color : "white"
  },
  detailsKKKKSP : {
    borderRadius : 50, 
    padding : 2.2, 
    paddingLeft : 8, 
    paddingRight : 8,
    backgroundColor : "black",
    marginRight : 6,
    color : "white"
  },
  detailsKKKKStaff : {
    borderRadius : 50, 
    padding : 2.2, 
    paddingLeft : 8, 
    paddingRight : 8,
    backgroundColor : "#1E971E",
    marginRight : 6,
    color : "white"
  },
  detailsKKKK2 : {
    borderRadius : 50, 
    padding : 2.2, 
    paddingLeft : 8, 
    paddingRight : 8,
    backgroundColor : "#A30202",
    color : "white"

  },
  detailsKKKNew : {
    borderRadius : 50, 
    padding :1, 
    paddingLeft : 8, 
    paddingRight : 8,
    backgroundColor : "#E9830F",
    marginRight : 6,
    color : "black",
    fontSize : 14,
    borderRadius : 20,
    borderWidth : 1, 
    borderColor : "#E1E1E1"
  },
  iconContainer: {},
  hr: {
    borderBottomColor: '#EFEFEF', 
    borderBottomWidth: 1,         
    marginTop :12,
    marginBottom : 12,
    marginRight : 23, 
    marginLeft : 23
  },
});

export default ActivityCard;
