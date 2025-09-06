import axios from "axios"

const axiosClient =  axios.create({
    baseURL: import.meta.env.PROD 
        ? import.meta.env.VITE_API_URL || 'https://your-app-name.onrender.com'
        : 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;