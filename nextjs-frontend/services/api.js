import axios from "axios";

/*
|--------------------------------------------------------------------------
| Laravel API Base URL
|--------------------------------------------------------------------------
|
| Change this URL if your Laravel backend is running on another host/port.
|
*/

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Automatically Attach JWT Token
|--------------------------------------------------------------------------
*/

API.interceptors.request.use((config) => {

    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/*
|--------------------------------------------------------------------------
| Authentication APIs
|--------------------------------------------------------------------------
*/

export const register = (data) => API.post("/register", data);

export const login = (data) => API.post("/login", data);

export const logout = () => API.post("/logout");

/*
|--------------------------------------------------------------------------
| Profile APIs
|--------------------------------------------------------------------------
*/

export const getProfile = () => API.get("/profile");

export const updateProfile = (data) =>
    API.put("/profile/update", data);

export const changePassword = (data) =>
    API.post("/change-password", data);

/*
|--------------------------------------------------------------------------
| Dashboard APIs
|--------------------------------------------------------------------------
*/

export const getDashboard = () =>
    API.get("/dashboard");

export const getSecurityDashboard = () =>
    API.get("/security-dashboard");

/*
|--------------------------------------------------------------------------
| Login History
|--------------------------------------------------------------------------
*/

export const getLoginHistory = (
    search = "",
    fromDate = "",
    toDate = "",
    page = 1
) => {

    return API.get("/login-history", {
        params: {
            search,
            from_date: fromDate,
            to_date: toDate,
            page,
        },
    });

};

export default API;