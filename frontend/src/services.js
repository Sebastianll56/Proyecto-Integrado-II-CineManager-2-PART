
import axios from 'axios';

// Configuración central de conexión con el Backend
const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
