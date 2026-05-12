<template>
  <div class="scenic-page" ref="pageRef">
    <section class="hero">
      <div class="hero-bg">
        <img src="/images/scenic-bg.jpg" alt="景色文化" class="hero-image" />
        <div class="hero-overlay"></div>
        <div class="hero-gradient-bottom"></div>
      </div>
      <div class="hero-content">
        <div class="hero-label" ref="heroLabel">02</div>
        <h1 class="title">
          <span class="line">景色</span>
          <span class="line">文化</span>
        </h1>
        <p class="subtitle">山水画卷 · 人文达州</p>
      </div>
      <div class="scroll-indicator">
        <span>SCROLL</span>
      </div>
    </section>

    <section class="intro-section" ref="introSection">
      <div class="intro-container">
        <div class="intro-label" ref="introLabel">
          <span class="label-number">01</span>
          <span class="label-text">风景览胜</span>
        </div>
        <div class="intro-content" ref="introContent">
          <h2 ref="introTitle">自然与人文的交融</h2>
          <p ref="introDesc">达州山川秀美，湖泊如镜，古镇静谧。从莲花湖的荷花飘香到凤凰山的俯瞰全城，每一处都是自然的馈赠。</p>
        </div>
      </div>
    </section>

    <section class="spots-showcase" ref="showcaseSection">
      <div class="showcase-header" ref="showcaseHeader">
        <span class="showcase-tag">景点图鉴</span>
        <h2 class="showcase-title">发现达州之美</h2>
      </div>

      <div class="spots-grid" ref="spotsGrid">
        <router-link
          v-for="(spot, i) in spots"
          :key="spot.id"
          :to="`/spot/${spot.id}`"
          class="spot-card"
          :ref="el => cardRefs[i] = el"
          :class="{ 'is-wide': i % 3 === 0 }"
        >
          <div class="card-image-wrapper">
            <img :src="spot.image" :alt="spot.title" class="card-image" loading="lazy" />
            <div class="card-shine"></div>
            <div class="card-number">{{ String(i + 1).padStart(2, '0') }}</div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ spot.title }}</h3>
            <p class="card-desc">{{ spot.description }}</p>
            <div class="card-footer">
              <span class="card-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ spot.location }}
              </span>
              <span class="explore-btn">
                <span>探索</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <section class="cta-section" ref="ctaSection">
      <div class="cta-content">
        <h2>准备好探索这些美景了吗？</h2>
        <p>开启您的达州之旅，发现更多精彩</p>
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
  name: 'ScenicCulturePage',
  setup() {
    const pageRef = ref(null)
    const heroLabel = ref(null)
    const introSection = ref(null)
    const introLabel = ref(null)
    const introContent = ref(null)
    const introTitle = ref(null)
    const introDesc = ref(null)
    const showcaseSection = ref(null)
    const showcaseHeader = ref(null)
    const spotsGrid = ref(null)
    const cardRefs = ref([])
    const ctaSection = ref(null)

    const spots = ref([])

    let ctx

    const fetchData = async () => {
      try {
        const data = await cultureAPI.getScenicCulture()
        spots.value = data.items || data || []
      } catch (error) {
        console.error('Failed to fetch scenic culture data, using mock data:', error)
        spots.value = [
          {
            id: 1,
            title: '莲花湖',
            description: '达州最大的城市湖泊，荷花飘香，是市民休闲的好去处',
            image: '/images/lianhua_lake.jpg',
            location: '通川区'
          },
          {
            id: 2,
            title: '凤凰山',
            description: '俯瞰全城美景，登高望远，感受达州的城市脉搏',
            image: '/images/fenghuang_mountain.jpg',
            location: '通川区'
          },
          {
            id: 3,
            title: '真佛山',
            description: '佛教圣地，古刹幽深，香火鼎盛',
            image: '/images/zhenfo_mountain.jpg',
            location: '达川区'
          },
          {
            id: 4,
            title: '石桥镇',
            description: '千年古镇，青石板路，古韵悠长',
            image: '/images/shiqiao_town.jpg',
            location: '达川区'
          }
        ]
      }
    }

    onMounted(async () => {
      await fetchData()

      await new Promise(resolve => setTimeout(resolve, 100))

      ctx = gsap.context(() => {
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } })

        heroTimeline
          .from('.hero-bg', {
            scale: 1.3,
            duration: 2.5,
            ease: 'expo.out'
          })
          .from('.hero-overlay', {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out'
          }, 0)
          .from('.hero-gradient-bottom', {
            height: 0,
            duration: 2,
            ease: 'expo.inOut'
          }, 0)
          .from(heroLabel.value, {
            x: -100,
            y: 50,
            opacity: 0,
            scale: 0.7,
            duration: 1.5,
            ease: 'back.out(1.7)'
          }, 0.4)
          .from('.line', {
            y: 200,
            opacity: 0,
            skewY: 10,
            duration: 1.8,
            stagger: 0.2,
            ease: 'power4.out'
          }, 0.7)
          .from('.subtitle', {
            y: 60,
            opacity: 0,
            filter: 'blur(20px)',
            duration: 1.4,
            ease: 'power3.out'
          }, 1.3)
          .from('.scroll-indicator', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power2.out'
          }, 1.8)

        const introTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: introSection.value,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        })

        introTimeline
          .from(introLabel.value, {
            x: -150,
            y: 80,
            opacity: 0,
            scale: 0.8,
            duration: 1.4,
            ease: 'back.out(1.4)'
          })
          .from(introTitle.value, {
            y: 80,
            opacity: 0,
            filter: 'blur(15px)',
            duration: 1.2,
            ease: 'power3.out'
          }, 0.2)
          .from(introDesc.value, {
            y: 50,
            opacity: 0,
            filter: 'blur(10px)',
            duration: 1,
            ease: 'power3.out'
          }, 0.4)

        gsap.from(showcaseHeader.value, {
          y: 100,
          opacity: 0,
          scale: 0.9,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: showcaseSection.value,
            start: 'top 75%'
          }
        })

        cardRefs.value.forEach((card, i) => {
          if (!card) return

          const row = Math.floor(i / 2)
          const col = i % 2
          const direction = col === 0 ? -1 : 1
          const baseDelay = row * 0.15
          const cardEl = (card.$el instanceof HTMLElement) ? card.$el : card

          if (!(cardEl instanceof HTMLElement)) return

          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: cardEl,
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          })

          cardTl
            .from(cardEl, {
              opacity: 0,
              duration: 1.4,
              ease: 'power4.out'
            }, baseDelay)
            .from(cardEl.querySelector('.card-image-wrapper'), {
              scale: 1.8,
              filter: 'blur(20px)',
              duration: 1.6,
              ease: 'power3.out'
            }, baseDelay + 0.1)
            .from(cardEl.querySelector('.card-content'), {
              y: 40,
              opacity: 0,
              filter: 'blur(10px)',
              duration: 1,
              ease: 'power3.out'
            }, baseDelay + 0.3)
            .from(cardEl.querySelector('.card-title'), {
              x: direction * 30,
              opacity: 0,
              duration: 0.8,
              ease: 'back.out(1.7)'
            }, baseDelay + 0.5)
            .from(cardEl.querySelector('.card-number'), {
              scale: 3,
              opacity: 0,
              duration: 0.8,
              ease: 'back.out(2)'
            }, baseDelay + 0.2)
        })

        gsap.from('.cta-content h2', {
          y: 100,
          opacity: 0,
          scale: 0.8,
          filter: 'blur(20px)',
          duration: 1.6,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: ctaSection.value,
            start: 'top 80%'
          }
        })

        gsap.from('.cta-content p', {
          y: 60,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaSection.value,
            start: 'top 70%'
          }
        })
      }, pageRef.value)
    })

    onUnmounted(() => {
      ctx && ctx.revert()
    })

    return {
      pageRef,
      heroLabel,
      introSection,
      introLabel,
      introContent,
      introTitle,
      introDesc,
      showcaseSection,
      showcaseHeader,
      spotsGrid,
      cardRefs,
      ctaSection,
      spots
    }
  }
}
</script>

<style scoped>
.scenic-page {
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
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(20, 30, 40, 0.7) 0%,
    rgba(30, 40, 50, 0.5) 50%,
    rgba(20, 30, 40, 0.7) 100%
  );
}

.hero-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, #0a0a0f 0%, rgba(10, 10, 15, 0.85) 50%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-label {
  font-size: 0.75rem;
  letter-spacing: 0.5em;
  color: rgba(255, 200, 150, 0.4);
  margin-bottom: 2rem;
}

.title {
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin: 0 0 2rem;
}

.line {
  display: block;
  background: linear-gradient(135deg, #4a9 0%, #6bb 50%, #8cd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  letter-spacing: 0.4em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.intro-section {
  padding: 100px 8vw;
  background: #0a0a0f;
}

.intro-container {
  display: flex;
  gap: 80px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

.intro-label {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-number {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #4a9, #6bb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.label-text {
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  color: rgba(255, 200, 150, 0.5);
  text-transform: uppercase;
}

.intro-content {
  flex: 1;
}

.intro-content h2 {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  line-height: 1.3;
}

.intro-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
}

.spots-showcase {
  padding: 60px 8vw 100px;
  background: #0a0a0f;
}

.showcase-header {
  text-align: center;
  margin-bottom: 60px;
}

.showcase-tag {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  color: #6bb;
  text-transform: uppercase;
  padding: 6px 16px;
  border: 1px solid rgba(100, 200, 180, 0.3);
  border-radius: 20px;
  margin-bottom: 16px;
}

.showcase-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.spot-card {
  display: block;
  background: linear-gradient(145deg, rgba(30, 35, 45, 0.9), rgba(20, 25, 35, 0.95));
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              border-color 0.4s ease;
  border: 1px solid rgba(100, 200, 180, 0.08);
  text-decoration: none;
  color: inherit;
  position: relative;
  transform-style: preserve-3d;
}

.spot-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(100, 200, 180, 0.3), transparent, rgba(100, 200, 180, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.spot-card:hover {
  transform: translateY(-16px) scale(1.03);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6),
              0 0 60px rgba(100, 200, 180, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(100, 200, 180, 0.3);
}

.spot-card:hover::before {
  opacity: 1;
}

.spot-card.is-wide {
  grid-column: span 2;
}

.card-image-wrapper {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1), filter 0.5s ease;
  filter: saturate(1.1);
}

.spot-card:hover .card-image {
  transform: scale(1.15);
  filter: saturate(1.3) brightness(1.05);
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transition: left 0.7s ease;
  pointer-events: none;
}

.spot-card:hover .card-shine {
  left: 150%;
}

.card-number {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 3rem;
  font-weight: 900;
  color: rgba(100, 200, 180, 0.12);
  line-height: 1;
  transition: color 0.3s ease, transform 0.3s ease;
}

.spot-card:hover .card-number {
  color: rgba(100, 200, 180, 0.25);
  transform: scale(1.1);
}

.card-content {
  padding: 28px;
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
  transition: color 0.3s ease;
}

.spot-card:hover .card-title {
  color: #6bb;
}

.card-desc {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.spot-card:hover .card-desc {
  color: rgba(255, 255, 255, 0.7);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 200, 150, 0.6);
  transition: color 0.3s ease;
}

.card-location svg {
  width: 14px;
  height: 14px;
  color: #6bb;
  transition: transform 0.3s ease;
}

.spot-card:hover .card-location {
  color: rgba(255, 200, 150, 0.9);
}

.spot-card:hover .card-location svg {
  transform: scale(1.2);
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: rgba(255, 200, 150, 0.6);
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.explore-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.6;
}

.spot-card:hover .explore-btn {
  color: #6bb;
}

.spot-card:hover .explore-btn svg {
  transform: translateX(6px);
  opacity: 1;
}

.cta-section {
  padding: 100px 8vw;
  text-align: center;
  background: linear-gradient(180deg, #0a0a0f 0%, #12111a 100%);
}

.cta-content h2 {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: #fff;
}

.cta-content p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 900px) {
  .intro-container {
    flex-direction: column;
    gap: 24px;
  }

  .spots-grid {
    grid-template-columns: 1fr;
  }

  .spot-card.is-wide {
    grid-column: span 1;
  }
}

@media (max-width: 600px) {
  .hero-label {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
  }

  .intro-section,
  .spots-showcase {
    padding: 60px 5vw 80px;
  }
}
</style>
