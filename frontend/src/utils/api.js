import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: data => api.put('/auth/profile', data),
  changePassword: data => api.put('/auth/password', data),
}

// Trades
export const tradeAPI = {
  getAll: params => api.get('/trades', { params }),
  getOne: id => api.get(`/trades/${id}`),
  create: data => api.post('/trades', data),
  update: (id, data) => api.put(`/trades/${id}`, data),
  delete: id => api.delete(`/trades/${id}`),
  getStats: params => api.get('/trades/stats', { params }),
}

// Analysis
export const analysisAPI = {
  getWeekly: params => api.get('/analysis/weekly', { params }),
  flagTrades: data => api.post('/analysis/flag-trades', data),
  getQuickInsight: tradeId => api.get(`/analysis/insight/${tradeId}`),
}

export default api
