import axios from 'axios';

// Create an axios client for the recruitment frontend.
// Base URL must come from import.meta.env.VITE_API_BASE_URL.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add request interceptor to attach JWT token from localStorage if available (key: token).
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 by removing token and redirecting to /login (optional).
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Redirect to login (optional - can be handled in context)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the axios instance.
export default client;
