import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Make sure this matches your backend URL
  timeout: 30000, // Increased timeout for file uploads
});

// Add request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    console.log(`${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', error.response.headers);
    }
    return Promise.reject(error);
  }
);

export default instance;