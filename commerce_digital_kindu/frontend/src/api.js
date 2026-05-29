import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kindu_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// simple retry logic for network errors / timeouts
const MAX_RETRIES = 2
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config) return Promise.reject(error)
    config.__retryCount = config.__retryCount || 0

    // retry only when there is no response (network error / CORS / timeout)
    if (!error.response && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1
      const delay = 300 * config.__retryCount
      await new Promise((res) => setTimeout(res, delay))
      return api(config)
    }
    return Promise.reject(error)
  }
)

export default api
