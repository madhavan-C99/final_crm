import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 👈 🎯 இந்த ஒரு வரி புதிதாகச் சேர்க்கப்பட்டுள்ளது (Bypasses Ngrok HTML Warning)
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error(
        "[axios] 401 on:",
        originalRequest?.url,
        "| response data:",
        error.response?.data,
      );

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          console.warn("[axios] No refresh token found in localStorage.");
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/adm/api/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );

        const newAccessToken =
          refreshResponse.data?.data?.access ||
          refreshResponse.data?.access ||
          refreshResponse.data?.token;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error(
          "[axios] refresh token failed:",
          refreshError?.response?.data || refreshError.message,
        );
        if (refreshError?.response?.status === 401) {
          localStorage.clear();
          window.location.replace("/telecalling/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
