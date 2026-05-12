<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>达州文化管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" :class="{ active: isActive('/admin/dashboard') }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>首页概览</span>
        </router-link>
        <router-link to="/admin/red" class="nav-item" :class="{ active: isActive('/admin/red') }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>红色文化</span>
        </router-link>
        <router-link to="/admin/scenic" class="nav-item" :class="{ active: isActive('/admin/scenic') }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
          <span>景色文化</span>
        </router-link>
        <router-link to="/admin/food" class="nav-item" :class="{ active: isActive('/admin/food') }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          <span>美食文化</span>
        </router-link>
        <router-link to="/admin/spots" class="nav-item" :class="{ active: isActive('/admin/spots') }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>景点管理</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const isActive = (path) => {
      return route.path === path
    }

    const handleLogout = () => {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      localStorage.removeItem('admin_password')
      sessionStorage.removeItem('security_verified')
      router.push('/admin/security')
    }

    return { handleLogout, isActive }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

body {
  background: #0a0a0f;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  height: 100%;
  background: #0a0a0f;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.02em;
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 14px;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.nav-item.active {
  background: #1890ff;
  color: #fff;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  color: rgba(255,255,255,0.65);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
}

.logout-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.main-content {
  flex: 1;
  margin-left: 240px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar-header h2,
  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 14px;
  }

  .main-content {
    margin-left: 60px;
  }
}
</style>