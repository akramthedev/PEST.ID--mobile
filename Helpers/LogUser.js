import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import { ENDPOINT_API } from '../Screens/endpoint';



const logUserAction = async (action, isDanger) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        const userIdNum = parseInt(userId);    
        const token = await getToken();
    
        if (!token || !userIdNum) {
            return;
        }

        let data = {
            action : action, 
            isDanger : isDanger
        }

        const response = await axios.post(`${ENDPOINT_API}createActivity/${userIdNum}`, data , {
            headers: {
              'Authorization': `Bearer ${token}`      
            }
        });



    } catch (error) {
        console.error('Error logging action:', error);
        console.log(error.response);
    }
};

export default logUserAction;
