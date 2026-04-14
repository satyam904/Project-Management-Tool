import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await client.post(`/api/v1/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.data.access)
        original.headers.Authorization = `Bearer ${data.data.access}`
        return client(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
