<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-glass"></div>
      <div class="header-line"></div>

      <router-link to="/culture" class="header-logo">
        <span class="logo-text">达州</span>
        <span class="logo-sub">文化</span>
      </router-link>

      <nav class="header-nav">
        <div class="nav-dropdown">
          <span class="nav-item dropdown-toggle">
            <span class="nav-text">达州文化</span>
            <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
          <div class="dropdown-menu">
            <div class="dropdown-inner">
              <router-link to="/culture/red" class="dropdown-item">
                <span class="item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                </span>
                <span class="item-text">红色文化</span>
                <span class="item-arrow">→</span>
              </router-link>
              <router-link to="/culture/scenic" class="dropdown-item">
                <span class="item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span class="item-text">景点文化</span>
                <span class="item-arrow">→</span>
              </router-link>
              <router-link to="/culture/food" class="dropdown-item">
                <span class="item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                  </svg>
                </span>
                <span class="item-text">美食文化</span>
                <span class="item-arrow">→</span>
              </router-link>
            </div>
          </div>
        </div>

        <router-link to="/yanjing" class="nav-btn-cta">
          <span class="btn-border"></span>
          <span class="btn-content">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 17v4M8 21h8"/>
            </svg>
            <span class="btn-text">研景</span>
          </span>
          <span class="btn-glow"></span>
        </router-link>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="footer-line"></div>
      <div class="footer-content">
        <div class="footer-grid">
          <div class="footer-section">
            <h3 class="section-title">达州文化</h3>
            <p class="section-desc">探索达州三千年的历史底蕴，从巴人文明到红色革命，每一个故事都值得铭记。</p>
            <div class="section-links">
              <router-link to="/culture/red">红色文化 →</router-link>
              <router-link to="/culture/scenic">景点文化 →</router-link>
              <router-link to="/culture/food">美食文化 →</router-link>
            </div>
          </div>

          <div class="footer-section">
            <h3 class="section-title">研景体验</h3>
            <p class="section-desc">开启沉浸式研学之旅，通过智能地图规划专属路线，让每一次探索都充满意义。</p>
            <div class="section-links">
              <router-link to="/yanjing">研景地图 →</router-link>
            </div>
          </div>

          <div class="footer-section">
            <h3 class="section-title">关于达州</h3>
            <p class="section-desc">巴人故里，红色达州，中国气都。这里是川东明珠，历史与现代交相辉映。</p>
            <div class="section-links">
              <span>通川区莲花湖路1号</span>
              <router-link to="/admin/security" class="admin-link">后台管理入口</router-link>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-divider"></div>
          <div class="footer-brand">
            <span class="brand-text">巴人故里</span>
            <span class="brand-sep">·</span>
            <span class="brand-text">红色达州</span>
            <span class="brand-sep">·</span>
            <span class="brand-text">中国气都</span>
          </div>
          <p class="footer-copy">© 2024 达州文化 · 用心传承千年巴蜀文明</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --header-height: 72px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::-webkit-scrollbar {
  display: none;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: transparent;
  color: #ffffff;
  overflow-x: hidden;
  overflow-y: auto;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 60px;
  z-index: 1000;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(201, 169, 110, 0.03) 0%,
    transparent 50%,
    rgba(201, 169, 110, 0.02) 100%
  );
  pointer-events: none;
}

.header-line {
  display: none;
}

.header-logo {
  text-decoration: none;
  display: flex;
  align-items: baseline;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.logo-text {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #d4af7a;
  text-shadow: 0 2px 12px rgba(212, 175, 122, 0.3);
}

.logo-sub {
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: rgba(212, 175, 122, 0.5);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 1;
}

.nav-dropdown {
  position: relative;
  padding: 12px 16px;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.nav-item {
  font-size: 0.92rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #d4af7a;
}

.nav-text {
  position: relative;
}

.nav-text::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: #d4af7a;
  transition: width 0.3s ease;
}

.nav-item:hover .nav-text::after {
  width: 100%;
}

.dropdown-arrow {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  transform-origin: center;
}

.nav-dropdown:hover .dropdown-arrow {
  color: #d4af7a;
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  padding-top: 6px;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-inner {
  position: relative;
  background: rgba(18, 18, 26, 0.98);
  border: 1px solid rgba(201, 169, 110, 0.12);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(201, 169, 110, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-width: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
  transition: all 0.25s ease;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(201, 169, 110, 0.08) 0%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.25s ease;
}

.dropdown-item:hover::before {
  opacity: 1;
}

.dropdown-item:hover {
  color: #ffffff;
  padding-left: 20px;
  transform: translateX(2px);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(201, 169, 110, 0.06);
  color: rgba(201, 169, 110, 0.5);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.dropdown-item:hover .item-icon {
  background: rgba(201, 169, 110, 0.15);
  color: #d4af7a;
}

.item-text {
  flex: 1;
  font-weight: 500;
}

.item-arrow {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.25s ease;
  opacity: 0;
  transform: translateX(-8px);
}

.dropdown-item:hover .item-arrow {
  opacity: 1;
  color: #d4af7a;
  transform: translateX(0);
}

.nav-btn-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  text-decoration: none;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  background: transparent;
  border: 1px solid transparent;
}

.btn-border {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(135deg,
    rgba(201, 169, 110, 0) 0%,
    rgba(201, 169, 110, 0.05) 50%,
    rgba(201, 169, 110, 0) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.btn-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.35s ease;
}

.btn-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.35s ease;
}

.btn-glow {
  position: absolute;
  inset: -2px;
  border-radius: 10px;
  background: linear-gradient(135deg,
    rgba(201, 169, 110, 0.2),
    rgba(212, 175, 122, 0.15),
    rgba(184, 148, 90, 0.18)
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 0;
  filter: blur(10px);
}

.nav-btn-cta:hover {
  transform: translateY(-2px);
  border-color: rgba(201, 169, 110, 0.6);
  background: rgba(201, 169, 110, 0.08);
  box-shadow:
    0 6px 24px rgba(201, 169, 110, 0.2),
    0 0 0 1px rgba(201, 169, 110, 0.15),
    0 0 40px rgba(201, 169, 110, 0.1);
}

.nav-btn-cta:hover .btn-border {
  opacity: 1;
}

.nav-btn-cta:hover .btn-glow {
  opacity: 1;
}

.nav-btn-cta:hover .btn-icon {
  color: #d4af7a;
  transform: translateX(2px) scale(1.05);
}

.nav-btn-cta:hover .btn-text {
  color: #ffffff;
  letter-spacing: 0.22em;
  font-weight: 600;
}

.nav-btn-cta:active {
  transform: translateY(0) scale(0.98);
  background: rgba(201, 169, 110, 0.12);
  box-shadow:
    0 3px 12px rgba(201, 169, 110, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.app-main {
  flex: 1;
  margin-top: var(--header-height);
}

.app-footer {
  position: relative;
  background: #08080c;
  padding: 80px 80px 40px;
}

.footer-line {
  position: absolute;
  top: 0;
  left: 80px;
  right: 80px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(201, 169, 110, 0.4) 30%,
    rgba(201, 169, 110, 0.4) 70%,
    transparent 100%
  );
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  margin-bottom: 60px;
}

.footer-section {
  position: relative;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #c9a96e;
  margin-bottom: 20px;
}

.section-desc {
  font-size: 0.85rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 20px;
}

.section-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-links a {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.section-links a:hover {
  color: #c9a96e;
  padding-left: 8px;
}

.section-links span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}

.section-links .admin-link {
  font-size: 0.8rem;
  color: rgba(255, 100, 100, 0.3);
  text-decoration: none;
  transition: all 0.3s ease;
}

.section-links .admin-link:hover {
  color: rgba(255, 100, 100, 0.7);
  padding-left: 8px;
}

.footer-bottom {
  text-align: center;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(201, 169, 110, 0.25) 30%,
    rgba(201, 169, 110, 0.25) 70%,
    transparent 100%
  );
  margin-bottom: 28px;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.brand-text {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.65);
}

.brand-sep {
  color: rgba(201, 169, 110, 0.4);
}

.admin-link {
  font-size: 0.8rem;
  color: rgba(201, 169, 110, 0.5);
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  padding: 2px 6px;
  border-radius: 4px;
}

.admin-link:hover {
  color: #c9a96e;
  background: rgba(201, 169, 110, 0.1);
}

.footer-copy {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.08em;
}

@media (max-width: 1200px) {
  .app-header {
    padding: 0 40px;
  }

  .header-line {
    left: 40px;
    right: 40px;
  }
}

@media (max-width: 900px) {
  :root {
    --header-height: 64px;
  }

  .app-header {
    padding: 0 24px;
  }

  .header-line {
    left: 24px;
    right: 24px;
  }

  .logo-text {
    font-size: 1.4rem;
  }

  .logo-sub {
    font-size: 0.8rem;
  }

  .header-nav {
    gap: 24px;
  }

  .nav-btn-cta {
    padding: 10px 20px;
  }

  .btn-text {
    font-size: 0.88rem;
  }

  .dropdown-inner {
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  :root {
    --header-height: 64px;
  }

  .app-footer {
    padding: 60px 32px 32px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-line {
    left: 32px;
    right: 32px;
  }
}
</style>
