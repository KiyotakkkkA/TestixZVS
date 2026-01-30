import axios from "axios";

import { AuthStorage } from "../services/authStorage";

let baseURL = "";
if (process.env.REACT_APP_ENV_TYPE === "prod") baseURL = "/api";
if (process.env.REACT_APP_ENV_TYPE === "dev")
    baseURL = "http://localhost:8000/api";

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

api.interceptors.request.use((config) => {
    const token = AuthStorage.getToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
