import axios from "axios";

/*
|--------------------------------------------------------------------------
| Laravel API Base URL
|--------------------------------------------------------------------------
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
    if (typeof window !== "undefined") {
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

/*
|--------------------------------------------------------------------------
| Response Interceptor for Silent Token Refresh
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/login") &&
            !originalRequest.url?.includes("/refresh-token") &&
            !originalRequest.url?.includes("/forgot-password") &&
            !originalRequest.url?.includes("/reset-password")
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return API(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshRes = await API.post("/refresh-token");
                const newToken = refreshRes.data.token;

                if (localStorage.getItem("token")) {
                    localStorage.setItem("token", newToken);
                } else {
                    sessionStorage.setItem("token", newToken);
                }

                processQueue(null, newToken);
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return API(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    window.location.href = "/login";
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Authentication APIs
|--------------------------------------------------------------------------
*/

export const register = (data) => API.post("/register", data);

export const login = (data) => API.post("/login", data);

export const logout = () => API.post("/logout");

export const forgotPassword = (data) => API.post("/forgot-password", data);

export const resetPassword = (data) => API.post("/reset-password", data);

export const refreshToken = () => API.post("/refresh-token");

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
| Active Sessions & Remote Logout
|--------------------------------------------------------------------------
*/

export const getActiveSessions = () => API.get("/active-sessions");

export const revokeSession = (id) => API.post(`/revoke-session/${id}`);

export const revokeAllOtherSessions = () =>
    API.post("/revoke-all-other-sessions");

/*
|--------------------------------------------------------------------------
| Dashboard & Analytics APIs
|--------------------------------------------------------------------------
*/

export const getDashboard = () =>
    API.get("/dashboard");

export const getSecurityDashboard = () =>
    API.get("/security-dashboard");

export const getAnalytics = () =>
    API.get("/analytics");

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