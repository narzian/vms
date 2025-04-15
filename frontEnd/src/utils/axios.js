import axios from 'axios';

// Create axios instance with base configuration
const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Ensure URL starts with a slash
        if (config.url && !config.url.startsWith('/')) {
            config.url = '/' + config.url;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response Error:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Data:', error.response.data);
            console.error('Error Status:', error.response.status);
            console.error('Error Headers:', error.response.headers);
            
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default instance; 