import axios from "axios";
import keycloak from "./services/keycloak";

const backendHost = import.meta.env.VITE_BACKEND_HOST;
const backendPort = import.meta.env.VITE_BACKEND_PORT;

console.log(backendHost);
console.log(backendPort);

const api = axios.create({
  baseURL: `http://${backendHost}:${backendPort}`,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;