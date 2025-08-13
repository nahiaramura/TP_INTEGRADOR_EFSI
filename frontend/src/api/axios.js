import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN ENVIADO:", token); // 👈 DEBUG
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;



