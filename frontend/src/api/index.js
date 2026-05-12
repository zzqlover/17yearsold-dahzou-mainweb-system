import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

export const homeAPI = {
  getHomeData: async () => {
    const [slides, spots] = await Promise.all([
      api.get('/slides'),
      api.get('/spots')
    ])
    return {
      slides: slides.data || [],
      spots: spots.data || []
    }
  }
}

export const spotAPI = {
  getSpots: async () => {
    return await api.get('/spots')
  },
  getSpot: async (id) => {
    return await api.get(`/spots/${id}`)
  },
  getSpotCount: async () => {
    return await api.get('/spots/count')
  },
  getSpotStats: async () => {
    return await api.get('/spots/stats')
  },
  createSpot: async (data) => {
    return await api.post('/admin/spots', data)
  },
  updateSpot: async (id, data) => {
    return await api.put(`/admin/spots/${id}`, data)
  },
  deleteSpot: async (id) => {
    return await api.delete(`/admin/spots/${id}`)
  }
}

export const newsAPI = {
  getNews: async (params = {}) => {
    const page = params.page || 1
    const pageSize = params.page_size || 10
    const res = await api.get('/news', { params: { page, page_size: pageSize } })
    return {
      data: res.data || [],
      total: res.total || 0,
      page: res.page || 1
    }
  },
  getNewsDetail: async (id) => {
    return await api.get(`/news/${id}`)
  },
  createNews: async (data) => {
    return await api.post('/admin/news', data)
  },
  updateNews: async (id, data) => {
    return await api.put(`/admin/news/${id}`, data)
  },
  deleteNews: async (id) => {
    return await api.delete(`/admin/news/${id}`)
  }
}

export const slideAPI = {
  getSlides: async () => {
    return await api.get('/slides')
  },
  getAllSlides: async () => {
    return await api.get('/slides/all')
  },
  getSlideCount: async () => {
    return await api.get('/slides/count')
  },
  createSlide: async (data) => {
    return await api.post('/admin/slides', data)
  },
  updateSlide: async (id, data) => {
    return await api.put(`/admin/slides/${id}`, data)
  },
  deleteSlide: async (id) => {
    return await api.delete(`/admin/slides/${id}`)
  }
}

export const adminAPI = {
  login: async (username, password) => {
    const response = await api.post('/admin/login', { username, password })
    return response
  },
  logout: async () => {
    const response = await api.post('/admin/logout')
    return response
  },
  getAdminInfo: async () => {
    const response = await api.get('/admin/info')
    return response
  }
}

export const cultureAPI = {
  getRedCulture: async () => {
    return await api.get('/culture/red')
  },
  getScenicCulture: async () => {
    return await api.get('/culture/scenic')
  },
  getFoodCulture: async () => {
    return await api.get('/culture/food')
  }
}

export default api
