import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, deleteToken } from '../Helpers/tokenStorage';
import { ENDPOINT_API } from '../Screens/endpoint';



const logUserAction2 = async (action, isDanger, email) => {
    try {

        let data = {
            action : action, 
            isDanger : isDanger,
            email : email
        }

        const resp = await axios.post(`${ENDPOINT_API}createActivityByEmail`, data );

        if(resp){
            console.log(resp.status);
            console.log(resp.data);
        }


    } catch (error) {
        console.error('Error logging action:', error);
        console.log(error.response);
    }
};

export default logUserAction2;
