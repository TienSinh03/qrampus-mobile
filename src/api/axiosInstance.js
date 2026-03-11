import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

export const instance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 seconds timeout
});

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let failedQueue = [];

// Xử lý queue các request bị fail
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

export const setAccessToken = (token) => {
  accessToken = token || null;
};
export const setRefreshToken = (token) => {
  refreshToken = token || null;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const clearRefreshToken = () => {
  refreshToken = null;
};

export const clearToken = () => {
  accessToken = null;
  refreshToken = null;
};

instance.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  const accessToken = await SecureStore.getItemAsync("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu không có response (network error)
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !(
        originalRequest.url.includes("/auth/refresh") ||
        originalRequest.url.includes("/auth/login")
      )
    ) {
      originalRequest._retry = true; // đánh dấu request này đã được thử lại
      // có thể gọi hàm refresh token ở đây và thử lại request
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      console.log('Refresh token: ', refreshToken);
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          if (response.status === 200) {
            const newAccessToken = response.data?.data?.accessToken;
            await SecureStore.setItemAsync("accessToken", newAccessToken);
            // Lazy require tránh circular dependency: axiosInstance ← authThunks ← authSlice
            const { store } = require('../store');
            store.dispatch({ type: 'auth/updateTokens', payload: { accessToken: newAccessToken } });
            // cập nhật access token cho các request tiếp theo
            instance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            // thử lại request ban đầu với access token mới
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

            // Gọi lại request ban đầu với access token mới
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Clear tất cả token khi refresh thất bại
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("userLogin");
          await SecureStore.deleteItemAsync("loginRole");
          clearToken();

          console.error("Error refreshing token:", refreshError);
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
