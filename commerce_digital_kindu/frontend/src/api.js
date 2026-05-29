import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("kuhuza_access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// simple retry logic for network errors / timeouts
const MAX_RETRIES = 2;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;

    // retry only when there is no response (network error / CORS / timeout)
    if (!error.response && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = 300 * config.__retryCount;
      await new Promise((res) => setTimeout(res, delay));
      return api(config);
    }

    // Try to refresh access token on 401 responses
    const status = error.response ? error.response.status : null;
    if (status === 401 && !config.__isRetryRequest) {
      const refreshToken = localStorage.getItem("kuhuza_refresh");
      if (refreshToken) {
        // attempt refresh against several common endpoints
        const refreshEndpoints = [
          "/auth/refresh/",
          "/auth/token/refresh/",
          "/token/refresh/",
          "/auth/jwt/refresh/",
        ];

        let newAccess = null;
        let newRefresh = null;

        for (const ep of refreshEndpoints) {
          try {
            // use plain axios to avoid interceptor recursion
            const resp = await axios.post(
              api.defaults.baseURL + ep,
              { refresh: refreshToken },
              { timeout: 5000 },
            );
            const data = resp.data || {};
            newAccess = data.access || data.token || data.access_token || null;
            newRefresh = data.refresh || data.refresh_token || null;
            if (!newAccess && data.token && typeof data.token === "string") {
              newAccess = data.token;
            }
            if (newAccess) break;
          } catch (err) {
            // try next endpoint
          }
        }

        if (newAccess) {
          try {
            localStorage.setItem("kuhuza_access", newAccess);
            if (newRefresh) localStorage.setItem("kuhuza_refresh", newRefresh);
            // mark request as retry to avoid loops
            config.__isRetryRequest = true;
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newAccess}`;
            return api(config);
          } catch (err) {
            // fall through to reject below
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
