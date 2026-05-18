import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080",
})

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId")

  if (userId) {
    config.headers["X-User-Id"] = userId
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userId")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default api