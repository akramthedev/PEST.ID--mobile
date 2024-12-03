import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import Login from './Screens/Login';
import Register from './Screens/Register';
import ForgotPassword from "./Screens/ForgotPassword";
import Dashboard from './Screens/DashBoard';
import Profile from './Screens/Profile';
import SplashScreen from './Screens/SplashScreen';
import MesClients from './Screens/MesClients';
import Historique from './Screens/History';
import NewPassword from './Screens/NewPassword';
import Broadcast from './Screens/Broadcast';
import NouvelleDemande from './Screens/NouvelleDemande';
import MesPersonels from './Screens/AllStaffs';
import MesFermes from './Screens/AllFarms';
import AjouterUnCalcul from './Screens/CreateCalculation';
import AjouterUneFerme from './Screens/CreateFarm';
import AjouterUneSerre from './Screens/CreateSerre';
import AjouterUnPersonel from './Screens/CreateStaff';
import ModifierSerre from './Screens/ModifierSerre';
import SingleFarmPage from './Screens/SingleFarmPage';
import Calculation from './Screens/Calculation';
import SuperAdminDemande from './Screens/SuperAdminDemande';
import { getToken } from './Helpers/tokenStorage';
import { AuthProvider, useAuth } from './Helpers/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINT_API } from './Screens/endpoint';
import axios from 'axios';
import CreatePlaque from './Screens/CreatePlaque';


const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);


  // Better Comment 
  // * Better Comment 
  // ! Better Comment 
  // ? Better Comment 
  // TODO: Better Comment
  


  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content" // or "light-content" depending on your design
      />
      <AuthProvider>
        <MainNavigator 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
        />
      </AuthProvider>
    </>
  );
}

const MainNavigator = ({ isAuthenticated, setIsAuthenticated }) => {
  const { triggerIt } = useAuth();
  const [isLoading, setIsLoading] = useState(true);  
 



  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);

      
      
      setTimeout(()=>{
        setIsLoading(false);
      },5000);
      
    };
    checkAuthentication();
  }, [triggerIt]);



    

 

  // Show the splash screen while loading
  if (isLoading) {
    return <SplashScreen />; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>     
        {isAuthenticated ? (
          // Authenticated Routes
          <>
            <Stack.Screen name="Historique" component={Historique} options={{ headerShown: false }} />
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="MesClients" component={MesClients} />
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="NouvelleDemande" component={NouvelleDemande} />
              <Stack.Screen name="MesPersonels" component={MesPersonels} />
              <Stack.Screen name="MesFermes" component={MesFermes} />
              <Stack.Screen name="AjouterUnCalcul" component={AjouterUnCalcul} />
              <Stack.Screen name="AjouterUnePlaque" component={CreatePlaque} />
              <Stack.Screen name="AjouterUneFerme" component={AjouterUneFerme} />
              <Stack.Screen name="AjouterUnPersonel" component={AjouterUnPersonel} />
              <Stack.Screen name="AjouterUneSerre" component={AjouterUneSerre} />
              <Stack.Screen name="ModifierSerre" component={ModifierSerre} />
              <Stack.Screen name="Calculation" component={Calculation} />
              <Stack.Screen name="SingleFarmPage" component={SingleFarmPage} />
              <Stack.Screen name="SuperAdminDemande" component={SuperAdminDemande} />
              <Stack.Screen name="Broadcast" component={Broadcast} />
             </Stack.Group>
          </>
        ) : (
          // Unauthenticated Routes
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="NewPassword" component={NewPassword} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
