import axios from 'axios';

export default async function getIpInfo() {
    try {
        const response = await axios.get('https://ipinfo.io/json?token=3ce720c5e5c236');
        const { ip, city, region, country, org } = response.data;
        return { ip, city, region, country, org };
    } catch (error) {
        console.error("Erreur lors de la récupération de l'IP :", error);
        return null;
    }
}
