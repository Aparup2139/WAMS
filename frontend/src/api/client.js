import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wams_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let pendingQueue = []

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Attempt a silent token refresh on the first 401, unless:
    //   - the failing request was itself the refresh call (avoid loops)
    //   - we already retried this request
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('wams_refresh_token')

      if (!refreshToken) {
        _forceLogout()
        return Promise.reject(err)
      }

      if (isRefreshing) {
        // Queue concurrent requests until the refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post('/api/auth/refresh', null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        const newToken = data.access_token
        localStorage.setItem('wams_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        _forceLogout()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

function _forceLogout() {
  localStorage.removeItem('wams_token')
  localStorage.removeItem('wams_refresh_token')
  localStorage.removeItem('wams_user')
  window.location.href = '/login'
}

export default api
