<template>
  <div class="home">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">四川·达州</h1>
        <p class="hero-subtitle">巴人故里 · 红色达州 · 中国气都</p>
        <div class="hero-buttons">
          <button class="btn-primary" @click="$router.push('/culture')">探索达州文化</button>
          <button class="btn-secondary" @click="$router.push('/study')">研学路径</button>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>向下滚动</span>
        <div class="mouse"></div>
      </div>
    </section>

    <section class="intro">
      <div class="container">
        <ParallaxSection>
          <div class="intro-content">
            <h2>走进达州</h2>
            <p>达州，位于四川省东部，是川渝鄂陕结合部的重要城市。这里历史悠久、文化底蕴深厚，是巴人文化的发祥地，也是革命老区。让我们一起探索这片神奇的土地。</p>
          </div>
        </ParallaxSection>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <ParallaxSection v-for="(feature, index) in features" :key="index" :delay="index * 100">
            <div class="feature-card" @click="$router.push(feature.path)">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>

    <section class="quick-access">
      <div class="container">
        <ParallaxSection>
          <div class="section-title">
            <h2>快速入口</h2>
          </div>
        </ParallaxSection>

        <div class="cards-grid">
          <ParallaxSection v-for="(card, index) in quickCards" :key="index" :delay="index * 100">
            <div class="quick-card" :style="{ backgroundImage: `url(${card.image})` }" @click="$router.push(card.path)">
              <div class="quick-card-overlay">
                <h3>{{ card.title }}</h3>
                <p>{{ card.desc }}</p>
              </div>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>

    <section class="ai-assistant">
      <div class="container">
        <ParallaxSection>
          <div class="assistant-box">
            <div class="assistant-icon">🤖</div>
            <h2>AI智能导游</h2>
            <p>有任何关于达州的问题吗？"小莲"随时为您解答</p>
            <button class="btn-primary" @click="$router.push('/chat')">
              咨询AI助手
            </button>
          </div>
        </ParallaxSection>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import ParallaxSection from '../components/ParallaxSection.vue'
import gsap from 'gsap'

export default {
  name: 'HomePage',
  components: { ParallaxSection },
  setup() {
    const features = ref([
      { icon: '🏛️', title: '红色文化', desc: '张爱萍故居，红军精神永流传', path: '/culture/red' },
      { icon: '🏞️', title: '景点文化', desc: '莲花湖、石桥镇，美景不胜收', path: '/culture/scenic' },
      { icon: '🍜', title: '美食文化', desc: '灯影牛肉、麻婆豆腐，舌尖美味', path: '/culture/food' },
      { icon: '📚', title: '研学路径', desc: '行走的课堂，知行合一', path: '/study' }
    ])

    const quickCards = ref([
      { title: '红色文化', desc: '缅怀革命先烈', path: '/culture/red', image: '/images/red_culture.jpg' },
      { title: '景点导览', desc: '发现达州之美', path: '/spots', image: '/images/scenic_spots.jpg' },
      { title: '研学旅行', desc: '寓教于乐', path: '/study', image: '/images/study_path.jpg' },
      { title: '美食推荐', desc: '品尝地道达州味', path: '/culture/food', image: '/images/food_culture.jpg' }
    ])

    onMounted(() => {
      gsap.from('.hero-title', { duration: 1.2, y: 50, opacity: 0, ease: 'power3.out' })
      gsap.from('.hero-subtitle', { duration: 1, y: 30, opacity: 0, delay: 0.3, ease: 'power3.out' })
      gsap.from('.hero-buttons', { duration: 0.8, y: 30, opacity: 0, delay: 0.6, ease: 'power3.out' })
      gsap.from('.scroll-indicator', { duration: 1, opacity: 0, delay: 1, ease: 'power3.out' })
      gsap.from('.feature-card', { duration: 0.8, y: 50, opacity: 0, stagger: 0.1, ease: 'power3.out' })
    })

    return { features, quickCards }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(22, 33, 62, 0.85) 100%);
  z-index: 1;
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/home.jpg') center/cover;
  opacity: 0.35;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.hero-title {
  font-size: 6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 30px rgba(0,0,0,0.5);
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.8rem;
  letter-spacing: 0.3em;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.hero-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 16px 40px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #c41e3a, #e85d04);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(196, 30, 58, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.5);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: #fff;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: rgba(255,255,255,0.7);
  text-align: center;
}

.mouse {
  width: 26px;
  height: 40px;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 13px;
  margin: 10px auto;
  position: relative;
}

.mouse::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 8px;
  background: #fff;
  border-radius: 2px;
  animation: scroll 1.5s infinite;
}

@keyframes scroll {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
}

.intro {
  padding: 100px 24px;
  background: #fff;
}

.intro-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.intro-content h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.intro-content p {
  font-size: 1.2rem;
  color: #666;
  line-height: 2;
}

.features {
  padding: 80px 24px;
  background: #f8f9fa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #fff;
  padding: 48px 32px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 12px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.quick-access {
  padding: 80px 24px;
  background: #fff;
}

.section-title {
  text-align: center;
  margin-bottom: 60px;
}

.section-title h2 {
  font-size: 2.5rem;
  color: #333;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.quick-card {
  height: 280px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background-size: cover;
  background-position: center;
}

.quick-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
  color: #fff;
  transition: all 0.4s ease;
}

.quick-card:hover .quick-card-overlay {
  background: linear-gradient(to top, rgba(196, 30, 58, 0.9), rgba(196, 30, 58, 0.3));
}

.quick-card h3 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.quick-card p {
  opacity: 0.8;
}

.ai-assistant {
  padding: 80px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.assistant-box {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background: rgba(255,255,255,0.05);
  padding: 60px 40px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
}

.assistant-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.assistant-box h2 {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 16px;
}

.assistant-box p {
  color: rgba(255,255,255,0.7);
  margin-bottom: 32px;
}

.assistant-box .btn-primary {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
}

.assistant-box .btn-primary:hover {
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
