import axios from 'axios';

const apiClient = axios.create({
    // baseURL: 'http://localhost:3000/',
    baseURL: 'https://my-json-server.typicode.com/raellen/vue-booking', 
    headers: { 'Content-Type': 'application/json' }
});

export default apiClient;
