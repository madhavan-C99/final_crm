import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // 🔍 DEBUG LOG - remove this once the redirect issue is fixed
      console.error(
        "[axios] 401 on:",
        originalRequest?.url,
        "| response data:",
        error.response?.data
      );

      originalRequest._retry = true;

      try {

        const refreshToken =
          localStorage.getItem(
            "refresh_token"
          );

        const refreshResponse =
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/telecalling/api/token/refresh/`,
            {
              refresh:
                refreshToken,
            }
          );

        const newAccessToken =
          refreshResponse.data.data.access;

        localStorage.setItem(
          "token",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {

        // 🔍 DEBUG LOG - remove this once the redirect issue is fixed
        console.error(
          "[axios] refresh token failed, logging out:",
          refreshError?.response?.data || refreshError.message
        );

        localStorage.clear();

        window.location.replace("/telecalling/login");

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;