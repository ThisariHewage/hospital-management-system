import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true, // Send HTTP-only cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            // Optional auto-redirect on session expiration
        }
        return Promise.reject(error);
    }
);

export default api;
