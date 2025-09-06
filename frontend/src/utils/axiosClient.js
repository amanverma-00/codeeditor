import axios from "axios"

const axiosClient =  axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || 'https://your-app-name.onrender.com'
        : 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;