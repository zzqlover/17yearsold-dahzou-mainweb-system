<template>
  <div class="food-page" ref="pageRef">
    <section class="hero">
      <div class="hero-bg">
        <img src="/images/food-bg.jpg" alt="达州美食" class="hero-image" loading="lazy" />
        <div class="hero-overlay"></div>
        <div class="hero-particles">
          <div class="particle" v-for="n in 20" :key="n"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-label" ref="heroLabel">03</div>
        <h1 class="title">
          <span class="line">美食</span>
          <span class="line">文化</span>
        </h1>
        <p class="subtitle">舌尖上的达州 · 味蕾的盛宴</p>
        <div class="hero-decoration">
          <span class="deco-line"></span>
          <span class="deco-text">DAZHOU CUISINE</span>
          <span class="deco-line"></span>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>SCROLL</span>
      </div>
    </section>

    <section class="intro-section">
      <div class="section-line" ref="sectionLine1"></div>
      <div class="intro-container">
        <div class="intro-label" ref="blockLabel">
          <span class="label-number">01</span>
          <span class="label-text">川东风味</span>
        </div>
        <div class="intro-content" ref="introBlock">
          <h2 ref="introTitle">独特的地域滋味</h2>
          <p ref="introDesc">达州美食融合了川菜的麻辣精髓与本地特色，形成了独树一帜的"达州味道"。从灯影牛肉的薄脆到包面的鲜香，每一道菜都承载着这片土地的记忆。</p>
          <button class="audio-btn" @click="toggleAudio" :class="{ playing: isPlaying }">
            <img :src="isPlaying ? '/images/暂停.svg' : '/images/播放.svg'" :alt="isPlaying ? '暂停' : '播放'" />
            <span>{{ isPlaying ? '暂停朗读' : '播放朗读' }}</span>
          </button>
          <audio ref="audioPlayer" src="/Audio/Delicious/美食介绍.MP3" preload="auto" playsinline @ended="onAudioEnded"></audio>
          <div class="intro-stats">
            <div class="stat-item">
              <span class="stat-number">6+</span>
              <span class="stat-label">特色美食</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">非遗</span>
              <span class="stat-label">文化遗产</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">百年</span>
              <span class="stat-label">传承工艺</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="foods-showcase">
      <div class="showcase-header" ref="sectionLine2">
        <span class="showcase-tag">美食图鉴</span>
        <h2 class="showcase-title">品味达州</h2>
      </div>

      <div class="masonry-wrapper">
        <div class="masonry-grid">
          <div
            class="food-card"
            v-for="(food, i) in foods"
            :key="i"
            :ref="el => foodRefs[i] = el"
            :class="[`card-${(i % 3) + 1}`, { 'card-wide': i % 5 === 0 }]"
            @mouseenter="handleCardHover(i)"
            @mouseleave="handleCardLeave(i)"
          >
            <div class="card-image-wrapper">
              <img :src="food.image" :alt="food.title" class="card-image" loading="lazy" />
              <div class="card-overlay">
                <div class="card-number" :ref="el => foodIndexRefs[i] = el">0{{ i + 1 }}</div>
              </div>
              <div class="card-shine"></div>
            </div>
            <div class="card-content">
              <div class="card-tags" :ref="el => foodTagsRefs[i] = el">
                <span class="tag" v-for="(tag, idx) in getTags(food.tags)" :key="idx">{{ tag }}</span>
              </div>
              <h3 class="card-title" :ref="el => foodTitleRefs[i] = el">{{ food.title }}</h3>
              <p class="card-desc" :ref="el => foodDescRefs[i] = el">{{ food.description }}</p>
              <div class="card-footer">
                <span class="explore-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    
                  </svg>
                </span>
              </div>
            </div>
            <div class="card-border"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>准备好开启味蕾之旅了吗？</h2>
        <p>探索更多达州特色美食，体验地道的川东风情</p>
        <div class="cta-buttons">
          <button class="cta-btn primary">开始探索</button>
          <button class="cta-btn secondary">了解更多</button>
        </div>
      </div>
      <div class="cta-decoration">
        <div class="deco-circle circle-1"></div>
        <div class="deco-circle circle-2"></div>
        <div class="deco-circle circle-3"></div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cultureAPI } from '../api/index'

gsap.registerPlugin(ScrollTrigger)

export default {
  name: 'FoodCulturePage',
  setup() {
    const pageRef = ref(null)
    const sectionLine1 = ref(null)
    const sectionLine2 = ref(null)
    const introBlock = ref(null)
    const blockLabel = ref(null)
    const introTitle = ref(null)
    const introDesc = ref(null)
    const heroLabel = ref(null)
    const foodRefs = ref([])
    const foodIndexRefs = ref([])
    const foodTitleRefs = ref([])
    const foodDescRefs = ref([])
    const foodTagsRefs = ref([])
    const audioPlayer = ref(null)
    const isPlaying = ref(false)

    const foods = ref([])
    const hoveredCard = ref(null)

    let ctx

    const toggleAudio = () => {
      if (!audioPlayer.value) return
      if (isPlaying.value) {
        audioPlayer.value.pause()
        audioPlayer.value.currentTime = 0
        isPlaying.value = false
      } else {
        audioPlayer.value.currentTime = 0
        const playPromise = audioPlayer.value.play()
        if (playPromise !== undefined) {
          playPromise.then(() => {
            isPlaying.value = true
          }).catch(e => {
            console.log('Audio play failed:', e)
          })
        }
      }
    }

    const onAudioEnded = () => {
      isPlaying.value = false
    }

    const getTags = (tags) => {
      if (!tags) return []
      if (Array.isArray(tags)) return tags
      if (typeof tags === 'string') return tags.split('·').map(t => t.trim())
      return []
    }

    const fetchData = async () => {
      try {
        const data = await cultureAPI.getFoodCulture()
        foods.value = data.items || data || []
      } catch (error) {
        console.error('Failed to fetch food culture data, using mock data:', error)
        foods.value = [
          { id: 1, title: '灯影牛肉', desc: '薄如蝉翼，香脆可口', image: '/images/dengying_beef.jpeg', tags: ['传统', '下酒'] },
          { id: 2, title: '东柳鱼头', desc: '鲜嫩多汁，回味无穷', image: '/images/fish_head.jpeg', tags: ['招牌', '必吃'] },
          { id: 3, title: '酸辣鸡', desc: '酸辣开胃，鸡肉嫩滑', image: '/images/suanla_chicken.jpeg', tags: ['特色', '下饭'] },
          { id: 4, title: '麻辣豆腐', desc: '麻辣鲜香，经济实惠', image: '/images/mapo_tofu.jpeg', tags: ['家常', '下饭'] },
          { id: 5, title: '香辣蟹', desc: '麻辣鲜香，蟹肉饱满', image: '/images/baofeng.jpeg', tags: ['时令', '特色'] },
          { id: 6, title: '泡椒牛蛙', desc: '泡椒味浓，牛蛙嫩滑', image: '/images/xuyazi.jpeg', tags: ['特色', '麻辣'] }
        ]
      }
    }

    const splitText = (element) => {
      if (!element) return []
      const text = element.textContent
      element.textContent = ''
      element.style.opacity = 1
      return text.split('').map(char => {
        const span = document.createElement('span')
        span.textContent = char === ' ' ? '\u00A0' : char
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        span.style.transform = 'translateY(20px)'
        element.appendChild(span)
        return span
      })
    }

    const simpleFadeIn = (element) => {
      if (!element) return
      gsap.from(element, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
    }

    const handleCardHover = (index) => {
      hoveredCard.value = index
      const card = foodRefs.value[index]
      if (card) {
        gsap.to(card.querySelector('.card-image'), {
          scale: 1.1,
          duration: 0.6,
          ease: 'power2.out'
        })
        gsap.to(card.querySelector('.card-overlay'), {
          opacity: 1,
          duration: 0.4
        })
      }
    }

    const handleCardLeave = (index) => {
      hoveredCard.value = null
      const card = foodRefs.value[index]
      if (card) {
        gsap.to(card.querySelector('.card-image'), {
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        })
        gsap.to(card.querySelector('.card-overlay'), {
          opacity: 0,
          duration: 0.4
        })
      }
    }

    onMounted(async () => {
      await fetchData()

      await new Promise(resolve => setTimeout(resolve, 200))

      gsap.from('.hero-image', {
        scale: 1.2,
        duration: 1.5,
        ease: 'power2.out'
      })

      gsap.from('.hero-overlay', {
        opacity: 0,
        duration: 1
      })

      gsap.from('.particle', {
        opacity: 0,
        scale: 0,
        duration: 0.8,
        stagger: 0.05
      })

      gsap.from(heroLabel.value, {
        x: -60,
        y: 40,
        opacity: 0,
        scale: 0.7,
        duration: 1.2,
        ease: 'back.out(1.7)'
      })

      gsap.from('.line', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power4.out'
      })

      gsap.from('.subtitle', {
        y: 40,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1,
        ease: 'power3.out'
      })

      gsap.from('.hero-decoration', {
        opacity: 0,
        scaleX: 0,
        duration: 0.6
      })

      gsap.from('.scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.6
      })

      gsap.from(sectionLine1.value, {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: sectionLine1.value, start: 'top 85%' }
      })

      gsap.from('.intro-label', {
        x: -80,
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.intro-container', start: 'top 75%' }
      })

      gsap.from('.stat-item', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.intro-stats', start: 'top 85%' }
      })

      gsap.from(introTitle.value, {
        y: 30,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: introBlock.value, start: 'top 70%' }
      })

      gsap.from(introDesc.value, {
        y: 20,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: introBlock.value, start: 'top 65%' }
      })

      gsap.from('.showcase-header', {
        y: 40,
        z: -100,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.showcase-header', start: 'top 80%' }
      })

      foodRefs.value.forEach((el, i) => {
        if (!el) return

        const col = i % 3
        const direction = col === 0 ? -1 : (col === 2 ? 1 : 0)
        const baseDelay = (i % 3) * 0.1
        const cardEl = el.$el || el

        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardEl,
            start: 'top 90%'
          }
        })

        cardTl
          .from(cardEl, {
            y: 80,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
          }, baseDelay)
          .from(cardEl.querySelector('.card-tags'), {
            x: -20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          }, baseDelay + 0.2)
          .from(cardEl.querySelector('.card-title'), {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)'
          }, baseDelay + 0.3)
          .from(cardEl.querySelector('.card-desc'), {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          }, baseDelay + 0.4)
      })

      gsap.from('.cta-content h2', {
        y: 40,
        opacity: 0,
        scale: 0.8,
        filter: 'blur(15px)',
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 80%' }
      })

      gsap.from('.cta-btn', {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.cta-buttons', start: 'top 85%' }
      })
    })

    onUnmounted(() => {
      ctx && ctx.revert()
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
      }
    })

    return {
      pageRef, sectionLine1, sectionLine2, introBlock,
      blockLabel, introTitle, introDesc, heroLabel, foodRefs,
      foodIndexRefs, foodTitleRefs, foodDescRefs, foodTagsRefs,
      audioPlayer, isPlaying, toggleAudio, onAudioEnded, getTags,
      foods, handleCardHover, handleCardLeave
    }
  }
}
</script>

<style scoped>
.food-page {
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  position: relative;
  overflow-x: hidden;
}

.hero {
  height: calc(100vh - var(--header-height));
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(196, 30, 58, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10, 10, 15, 0.3) 0%, rgba(10, 10, 15, 0.9) 100%);
}

.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 200, 150, 0.3);
  border-radius: 50%;
  animation: float 15s infinite ease-in-out;
}

.particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; }
.particle:nth-child(2) { left: 20%; top: 60%; animation-delay: 1s; }
.particle:nth-child(3) { left: 30%; top: 30%; animation-delay: 2s; }
.particle:nth-child(4) { left: 40%; top: 70%; animation-delay: 3s; }
.particle:nth-child(5) { left: 50%; top: 40%; animation-delay: 4s; }
.particle:nth-child(6) { left: 60%; top: 80%; animation-delay: 5s; }
.particle:nth-child(7) { left: 70%; top: 25%; animation-delay: 6s; }
.particle:nth-child(8) { left: 80%; top: 55%; animation-delay: 7s; }
.particle:nth-child(9) { left: 15%; top: 85%; animation-delay: 8s; }
.particle:nth-child(10) { left: 25%; top: 15%; animation-delay: 9s; }
.particle:nth-child(11) { left: 35%; top: 45%; animation-delay: 10s; }
.particle:nth-child(12) { left: 45%; top: 75%; animation-delay: 11s; }
.particle:nth-child(13) { left: 55%; top: 35%; animation-delay: 12s; }
.particle:nth-child(14) { left: 65%; top: 65%; animation-delay: 13s; }
.particle:nth-child(15) { left: 75%; top: 45%; animation-delay: 14s; }
.particle:nth-child(16) { left: 85%; top: 15%; animation-delay: 0.5s; }
.particle:nth-child(17) { left: 90%; top: 75%; animation-delay: 1.5s; }
.particle:nth-child(18) { left: 5%; top: 50%; animation-delay: 2.5s; }
.particle:nth-child(19) { left: 95%; top: 35%; animation-delay: 3.5s; }
.particle:nth-child(20) { left: 50%; top: 10%; animation-delay: 4.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-100px) rotate(180deg); opacity: 0.6; }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-label {
  font-size: 0.85rem;
  letter-spacing: 0.5em;
  color: rgba(255, 200, 150, 0.5);
  margin-bottom: 2rem;
  font-weight: 300;
}

.title {
  font-size: clamp(5rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.03em;
  margin: 0 0 2rem;
}

.line {
  display: block;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 30%, #ffc107 60%, #ff6b35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 80px rgba(255, 107, 53, 0.5);
}

.subtitle {
  font-size: clamp(1rem, 2vw, 1.3rem);
  letter-spacing: 0.4em;
  color: rgba(255, 200, 150, 0.6);
  text-transform: uppercase;
  margin-bottom: 3rem;
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.deco-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.5), transparent);
}

.deco-text {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: rgba(255, 200, 150, 0.4);
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.scroll-mouse {
  width: 24px;
  height: 40px;
  border: 2px solid rgba(255, 200, 150, 0.3);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.scroll-wheel {
  width: 4px;
  height: 8px;
  background: rgba(255, 200, 150, 0.5);
  border-radius: 2px;
  animation: scroll-anim 2s infinite;
}

@keyframes scroll-anim {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

.scroll-indicator span {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: rgba(255, 200, 150, 0.3);
}

.intro-section {
  padding: 120px 8vw;
  position: relative;
  background: linear-gradient(180deg, #0a0a0f 0%, #12111a 100%);
}

.section-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.6), rgba(196, 30, 58, 0.3), transparent);
  margin-bottom: 80px;
}

.intro-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.intro-label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label-number {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35, #ffc107);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.label-text {
  font-size: 0.9rem;
  letter-spacing: 0.3em;
  color: rgba(255, 200, 150, 0.5);
  text-transform: uppercase;
}

.intro-content h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #fff;
  line-height: 1.2;
}

.intro-content p {
  font-size: 1.15rem;
  line-height: 2;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin-bottom: 2rem;
}

.audio-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 107, 53, 0.1));
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 30px;
  color: rgba(255, 200, 150, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.audio-btn:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 107, 53, 0.2));
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-2px);
}

.audio-btn.playing {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.4), rgba(255, 107, 53, 0.25));
  border-color: rgba(255, 107, 53, 0.6);
}

.audio-btn img {
  width: 22px;
  height: 22px;
}

.intro-stats {
  display: flex;
  gap: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b35, #ffc107);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: rgba(255, 200, 150, 0.4);
  text-transform: uppercase;
}

.foods-showcase {
  padding: 80px 5vw 120px;
  position: relative;
}

.showcase-header {
  text-align: center;
  margin-bottom: 80px;
}

.showcase-tag {
  display: inline-block;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: #ff6b35;
  text-transform: uppercase;
  padding: 8px 20px;
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 20px;
  margin-bottom: 20px;
}

.showcase-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.masonry-wrapper {
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.food-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 25, 35, 0.9), rgba(20, 18, 28, 0.95));
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease;
  transform-style: preserve-3d;
  will-change: transform;
}

.food-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(255, 107, 53, 0.1);
}

.card-image {
  will-change: transform;
  transform: translateZ(0);
}

.food-card.card-wide {
  grid-column: span 2;
}

.food-card.card-2 {
  transition-delay: 0.1s;
}

.food-card.card-3 {
  transition-delay: 0.2s;
}

.card-image-wrapper {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.card-wide .card-image-wrapper {
  height: 350px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(10, 10, 15, 0.9) 100%);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card-number {
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255, 107, 53, 0.15);
  line-height: 1;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.8s ease;
}

.food-card:hover .card-shine {
  left: 150%;
}

.card-content {
  padding: 25px 30px 30px;
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: #ff6b35;
  text-transform: uppercase;
  padding: 4px 10px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
  line-height: 1.3;
}

.card-desc {
  font-size: 0.9rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
  display: -webkit-box;
  --webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: rgba(255, 200, 150, 0.6);
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.explore-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.food-card:hover .explore-btn {
  color: #ff6b35;
}

.food-card:hover .explore-btn svg {
  transform: translateX(5px);
}

.card-border {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), transparent, rgba(196, 30, 58, 0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.food-card:hover .card-border {
  opacity: 1;
}

.cta-section {
  padding: 150px 8vw;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #12111a 0%, #0a0a0f 100%);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 200, 150, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 3rem;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.cta-btn {
  padding: 16px 40px;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s ease;
  font-weight: 600;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  border: none;
  box-shadow: 0 10px 40px rgba(255, 107, 53, 0.3);
}

.cta-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 50px rgba(255, 107, 53, 0.4);
}

.cta-btn.secondary {
  background: transparent;
  color: rgba(255, 200, 150, 0.8);
  border: 1px solid rgba(255, 200, 150, 0.3);
}

.cta-btn.secondary:hover {
  background: rgba(255, 200, 150, 0.1);
  border-color: rgba(255, 200, 150, 0.5);
}

.cta-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ff6b35, transparent);
  top: -100px;
  left: -100px;
  animation: pulse 8s infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #ffc107, transparent);
  bottom: -50px;
  right: -50px;
  animation: pulse 10s infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #c41e3a, transparent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 6s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.2); opacity: 0.15; }
}

@media (max-width: 1200px) {
  .masonry-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .food-card.card-wide {
    grid-column: span 1;
  }
}

@media (max-width: 900px) {
  .intro-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .intro-stats {
    flex-wrap: wrap;
    gap: 30px;
  }

  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .hero-label {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
  }

  .intro-section {
    padding: 80px 6vw;
  }

  .foods-showcase {
    padding: 60px 5vw 80px;
  }
}
</style>
