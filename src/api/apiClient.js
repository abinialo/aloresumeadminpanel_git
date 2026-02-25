import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

console.log("ENV VALUE:", process.env.REACT_APP_API_BASE_URL);
console.log("API BASE URL USED:", apiBaseUrl);
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
