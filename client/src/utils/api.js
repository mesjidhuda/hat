import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
    const adminToken = localStorage.getItem("adminToken");
    const teacherToken = sessionStorage.getItem("teacherToken");
    if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (teacherToken) {
        config.headers.Authorization = `Bearer ${teacherToken}`;
    }
    return config;
});

export default api;
