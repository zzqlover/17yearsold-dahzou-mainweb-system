import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/culture'
  },
  {
    path: '/culture',
    name: 'Culture',
    component: () => import('../views/Culture.vue')
  },
  {
    path: '/yanjing',
    name: 'YanJing',
    component: () => import('../components/YanJingPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/yanjing/dashboard',
    name: 'YanJingDashboard',
    component: () => import('../components/yanjing/YanJingDashboard.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/culture/red',
    name: 'RedCulture',
    component: () => import('../views/CultureRed.vue')
  },
  {
    path: '/culture/red/figure/:id',
    name: 'FigureDetail',
    component: () => import('../views/FigureDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/culture/red/place/:id',
    name: 'PlaceDetail',
    component: () => import('../views/PlaceDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/culture/scenic',
    name: 'ScenicCulture',
    component: () => import('../views/CultureScenic.vue')
  },
  {
    path: '/spot/:id',
    name: 'SpotDetail',
    component: () => import('../views/SpotDetail.vue')
  },
  {
    path: '/culture/food',
    name: 'FoodCulture',
    component: () => import('../views/CultureFood.vue')
  },
  {
    path: '/admin/security',
    name: 'SecurityKey',
    component: () => import('../views/admin/SecurityKey.vue')
  },
  {
    path: '/admin/login',
    name: 'Login',
    component: () => import('../views/admin/Login.vue'),
    meta: { requiresSecurityKey: true }
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'slides',
        name: 'SlidesManage',
        component: () => import('../views/admin/SlideMgr.vue')
      },
      {
        path: 'spots',
        name: 'SpotsManage',
        component: () => import('../views/admin/SpotMgr.vue')
      },
      {
        path: 'news',
        name: 'NewsManage',
        component: () => import('../views/admin/NewsMgr.vue')
      },
      {
        path: 'red',
        name: 'RedCultureManage',
        component: () => import('../views/admin/RedCultureMgr.vue')
      },
      {
        path: 'scenic',
        name: 'ScenicCultureManage',
        component: () => import('../views/admin/ScenicCultureMgr.vue')
      },
      {
        path: 'food',
        name: 'FoodCultureManage',
        component: () => import('../views/admin/FoodCultureMgr.vue')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'instant' }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  const securityVerified = sessionStorage.getItem('security_verified') === 'true'

  if (to.path === '/admin/security') {
    next()
    return
  }

  if (to.path === '/admin/login') {
    if (!securityVerified) {
      next('/admin/security')
    } else {
      next()
    }
    return
  }

  if (to.path === '/admin/dashboard') {
    if (!token || !securityVerified) {
      next('/admin/security')
    } else {
      next()
    }
    return
  }

  if (to.path.startsWith('/admin')) {
    if (!securityVerified) {
      next('/admin/security')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
