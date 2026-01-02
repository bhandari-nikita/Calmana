// calmana-frontend/lib/api.js
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const api = axios.create({
  baseURL,
  withCredentials: true, // send cookie
});

api.interceptors.response.use(
  r => r,
  e => {
    if (e?.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(e);
  }
);

export default api;
