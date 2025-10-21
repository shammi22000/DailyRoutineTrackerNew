import axios from 'axios';

// set your server URL or LAN IP (Device must reach your Mac)
// Example: http://192.168.1.20:3000
export const API_BASE_URL = 'http://192.168.23.78:3000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export default client;
