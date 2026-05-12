<template>
  <div class="red-page" ref="pageRef">
    <div class="red-atmosphere">
      <div class="red-glow red-glow-1"></div>
      <div class="red-glow red-glow-2"></div>
      <div class="red-glow red-glow-3"></div>
      <div class="red-particles"></div>
    </div>

    <section class="hero">
      <div class="hero-bg">
        <img src="/images/red-bg.jpg" alt="红色文化" class="hero-image" loading="lazy" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-top" ref="heroEyebrow">
          <span class="hero-dynasty">川陕革命根据地</span>
          <span class="hero-sep">|</span>
          <span class="hero-area">达州</span>
        </div>
        <div class="hero-main">
          <div class="hero-text-block">
            <div class="hero-char" ref="line1">薪</div>
            <div class="hero-char" ref="line2">火</div>
          </div>
          <div class="hero-text-block">
            <div class="hero-char" ref="line3">相</div>
            <div class="hero-char" ref="line4">传</div>
          </div>
        </div>
        <div class="hero-bottom" ref="heroSub">
          <div class="hero-line"></div>
          <span class="hero-tagline">血脉赓续 · 精神永存</span>
          <div class="hero-line"></div>
        </div>
      </div>
      <div class="scroll-hint" ref="scrollHint">
        <div class="scroll-line"></div>
      </div>
    </section>

    <section class="era-section" ref="eraSection">
      <div class="era-content" ref="eraContent">
        <div class="era-left">
          <div class="era-mark">壹</div>
        </div>
        <div class="era-right">
          <h2 class="era-title">1933</h2>
          <div class="era-text">
            <p>当第一面红旗插上这片土地，沉默的山河开始苏醒。从万源到宣汉，从通川到达川，星火燎原。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="spirit-section" ref="spiritSection">
      <div class="spirit-center" ref="spiritCenter">
        <div class="spirit-icon">
          <svg viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="25" stroke="currentColor" stroke-width="0.8"/>
            <path d="M30 10 L30 50 M15 25 L45 25" stroke="currentColor" stroke-width="0.8"/>
            <circle cx="30" cy="30" r="5" fill="currentColor"/>
          </svg>
        </div>
        <blockquote class="spirit-quote">
          他们的热血浸润了这片土地<br/>
          我们的脚步丈量着同一个方向
        </blockquote>
      </div>
    </section>

    <section class="places-section" ref="placesSection">
      <div class="places-header">
        <span class="places-label">纪念地标</span>
        <h2 class="places-title">足迹</h2>
      </div>

      <div class="places-list">
        <div
          class="place-item"
          v-for="(spot, i) in spots"
          :key="i"
          :ref="el => placeRefs[i] = el"
          @click="$router.push(`/culture/red/place/${spot.id}`)"
        >
          <div class="place-image-col">
            <div class="place-image-wrap">
              <img :src="spot.image" :alt="spot.title" class="place-image" loading="lazy" />
              <div class="place-overlay"></div>
              <div class="place-num">{{ String(i + 1).padStart(2, '0') }}</div>
            </div>
          </div>
          <div class="place-info-col">
            <h3 class="place-name">{{ spot.title }}</h3>
            <p class="place-desc">{{ spot.description }}</p>
            <div class="place-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ spot.location }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="figures-section" ref="figuresSection">
      <div class="figures-header">
        <span class="figures-label">人物志</span>
        <h2 class="figures-title">传承</h2>
      </div>

      <div class="figures-grid">
        <div
          class="figure-card"
          v-for="(item, i) in timeline"
          :key="i"
          :ref="el => figureRefs[i] = el"
          @mouseenter="handleCardHover(i)"
          @mouseleave="handleCardLeave(i)"
        >
          <router-link :to="`/culture/red/figure/${item.id}`" class="figure-link">
            <div class="figure-3d">
              <div class="figure-card-front">
                <div class="figure-avatar">
                  <img :src="item.image || '/images/default-avatar.jpg'" :alt="item.title" class="figure-img" />
                  <div class="figure-glow"></div>
                </div>
                <div class="figure-info">
                  <span class="figure-year">{{ item.year }}</span>
                  <h4 class="figure-name">{{ item.title }}</h4>
                </div>
              </div>
              <div class="figure-card-edge"></div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section class="legacy-section" ref="legacySection">
      <div class="legacy-inner" ref="legacyInner">
        <div class="legacy-header">
          <span class="legacy-label">贰</span>
          <h2 class="legacy-title">传承</h2>
        </div>
        <div class="legacy-visual">
          <div class="legacy-year">
            <span class="year-num">1933</span>
            <span class="year-arrow">→</span>
            <span class="year-num">1949</span>
          </div>
        </div>
        <div class="legacy-markers">
          <div class="marker">
            <span class="marker-num">星火</span>
          </div>
          <div class="marker-line"></div>
          <div class="marker">
            <span class="marker-num">燎原</span>
          </div>
        </div>
      </div>
    </section>

    <section class="ending-section" ref="endingSection">
      <div class="ending-inner" ref="endingInner">
        <div class="ending-visual">
          <div class="ending-circle"></div>
          <div class="ending-ring ending-ring-1"></div>
          <div class="ending-ring ending-ring-2"></div>
          <div class="ending-ring ending-ring-3"></div>
        </div>
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
  name: 'RedCulturePage',
  setup() {
    const pageRef = ref(null)
    const heroEyebrow = ref(null)
    const line1 = ref(null)
    const line2 = ref(null)
    const heroSub = ref(null)
    const scrollHint = ref(null)
    const eraSection = ref(null)
    const eraContent = ref(null)
    const spiritSection = ref(null)
    const spiritCenter = ref(null)
    const placesSection = ref(null)
    const figuresSection = ref(null)
    const legacySection = ref(null)
    const legacyInner = ref(null)
    const endingSection = ref(null)
    const endingInner = ref(null)
    const placeRefs = ref([])
    const figureRefs = ref([])

    const spots = ref([])
    const timeline = ref([
      {
        id: 'wangweizhou',
        title: '王维舟',
        year: '1887-1970',
        brief: '川东游击军创建人',
        image: '/images/History/王维舟.jpeg'
      },
      {
        id: 'zhangaiping',
        title: '张爱萍',
        year: '1910-2003',
        brief: '开国上将 · 神剑将军',
        image: '/images/History/张爱萍.jpeg'
      },
      {
        id: 'xiangshouzhi',
        title: '向守志',
        year: '1915-2017',
        brief: '开国少将',
        image: '/images/History/向守志.jpeg'
      },
      {
        id: 'libaojun',
        title: '李家俊',
        year: '1902-1932',
        brief: '万源起义领导人',
        image: '/images/History/李家俊.jpeg'
      }
    ])

    let ctx

    const handleCardHover = (i) => {
      const card = figureRefs.value[i]
      if (!card) return
      gsap.to(card, {
        rotateY: 8,
        rotateX: -4,
        z: 30,
        duration: 0.5,
        ease: 'power2.out'
      })
    }

    const handleCardLeave = (i) => {
      const card = figureRefs.value[i]
      if (!card) return
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        z: 0,
        duration: 0.5,
        ease: 'power2.out'
      })
    }

    const fetchData = async () => {
      try {
        const data = await cultureAPI.getRedCulture()
        spots.value = data.items || data || []
      } catch (error) {
        console.error('Failed to fetch red culture data, using mock data:', error)
        spots.value = [
          {
            id: 1,
            title: '万源保卫战战地遗址',
            description: '1934年红军在此展开激烈战斗，保卫川陕革命根据地',
            image: '/images/red_wanyuan.jpg',
            location: '万源市'
          },
          {
            id: 2,
            title: '张爱萍故居',
            description: '开国上将张爱萍将军的出生地，现为爱国主义教育基地',
            image: '/images/zhang_aiping_home.jpg',
            location: '通川区'
          },
          {
            id: 3,
            title: '列宁街苏维埃旧址',
            description: '川陕革命根据地重要遗迹，见证红色历史',
            image: '/images/lenin_street.jpg',
            location: '达川区'
          }
        ]
      }
    }

    onMounted(async () => {
      await fetchData()
      await new Promise(resolve => setTimeout(resolve, 100))

      ctx = gsap.context(() => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        heroTl
          .from('.hero-image', {
            y: 100,
            scale: 1.15,
            duration: 2,
            ease: 'power2.out'
          }, 0)
          .from('.hero-overlay', {
            opacity: 0,
            duration: 1.2
          }, 0.3)
          .from(heroEyebrow.value, {
            y: 30,
            opacity: 0,
            duration: 1
          }, 0.5)
          .from('.hero-char', {
            y: 200,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out'
          }, 0.7)
          .from(heroSub.value, {
            y: 30,
            opacity: 0,
            duration: 1
          }, 1.5)
          .from(scrollHint.value, {
            opacity: 0,
            duration: 0.8
          }, 2)

        gsap.from('.era-mark', {
          y: 80,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: eraSection.value,
            start: 'top 75%'
          }
        })

        gsap.from('.era-right', {
          y: 80,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: eraSection.value,
            start: 'top 75%'
          }
        })

        gsap.from(spiritCenter.value, {
          y: 100,
          opacity: 0,
          duration: 1.5,
          scrollTrigger: {
            trigger: spiritSection.value,
            start: 'top 70%'
          }
        })

        placeRefs.value.forEach((el, i) => {
          if (!el) return
          gsap.from(el, {
            y: 80,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            }
          })
        })

        figureRefs.value.forEach((el, i) => {
          if (!el) return
          gsap.from(el, {
            y: 100,
            z: -100,
            opacity: 0,
            rotateY: -15,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            }
          })
        })

        gsap.from(legacyInner.value, {
          y: 100,
          opacity: 0,
          duration: 1.5,
          scrollTrigger: {
            trigger: legacySection.value,
            start: 'top 70%'
          }
        })

        gsap.from(endingInner.value, {
          z: -200,
          opacity: 0,
          duration: 2.5,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: endingSection.value,
            start: 'top 80%'
          }
        })

        gsap.from('.ending-ring', {
          x: (i) => (i % 2 === 0 ? -300 : 300),
          y: (i) => (i % 3 === 0 ? -200 : 200),
          z: -150,
          opacity: 0,
          duration: 1.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: endingSection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.ending-circle', {
          scale: 0,
          z: -100,
          opacity: 0,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: endingSection.value,
            start: 'top 65%'
          }
        })

        gsap.to('.ending-ring-1', {
          rotateY: 360,
          rotateX: 90,
          duration: 25,
          ease: 'none',
          repeat: -1
        })

        gsap.to('.ending-ring-2', {
          rotateX: 360,
          rotateZ: -360,
          duration: 20,
          ease: 'none',
          repeat: -1
        })

        gsap.to('.ending-ring-3', {
          rotateY: -360,
          duration: 30,
          ease: 'none',
          repeat: -1
        })

        gsap.to('.ending-circle', {
          scale: 1.2,
          opacity: 0.8,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        })

        gsap.to('.red-glow-1', {
          scale: 1.2,
          opacity: 0.6,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })

        gsap.to('.red-glow-2', {
          scale: 1.1,
          opacity: 0.4,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1
        })

        gsap.to('.red-glow-3', {
          scale: 1.3,
          opacity: 0.3,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2
        })
      }, pageRef.value)
    })

    onUnmounted(() => {
      ctx && ctx.revert()
    })

    return {
      pageRef,
      heroEyebrow,
      line1,
      line2,
      heroSub,
      scrollHint,
      eraSection,
      eraContent,
      spiritSection,
      spiritCenter,
      placesSection,
      figuresSection,
      legacySection,
      legacyInner,
      endingSection,
      endingInner,
      placeRefs,
      figureRefs,
      spots,
      timeline,
      handleCardHover,
      handleCardLeave
    }
  }
}
</script>

<style scoped>
.red-page {
  min-height: 100vh;
  background: #0c0b09;
  color: #fff;
  position: relative;
  overflow-x: hidden;
}

.red-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.red-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.red-glow-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(180, 40, 20, 0.25) 0%, transparent 70%);
  top: -200px;
  right: -100px;
}

.red-glow-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(150, 30, 15, 0.2) 0%, transparent 70%);
  bottom: 20%;
  left: -150px;
}

.red-glow-3 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(120, 25, 10, 0.15) 0%, transparent 70%);
  top: 50%;
  right: -200px;
}

.red-particles {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(180, 40, 20, 0.1) 0%, transparent 1%),
    radial-gradient(circle at 80% 20%, rgba(180, 40, 20, 0.08) 0%, transparent 1%),
    radial-gradient(circle at 40% 70%, rgba(180, 40, 20, 0.06) 0%, transparent 1%),
    radial-gradient(circle at 90% 80%, rgba(180, 40, 20, 0.1) 0%, transparent 1%);
  background-size: 100% 100%;
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
  filter: brightness(0.65) saturate(1.3) contrast(1.05);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(40, 15, 8, 0.25) 0%, rgba(12, 11, 9, 0.6) 100%),
    linear-gradient(to bottom, rgba(12, 11, 9, 0.2) 0%, rgba(12, 11, 9, 0.4) 50%, rgba(12, 11, 9, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.65rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  font-weight: 300;
}

.hero-dynasty {
  color: rgba(200, 160, 100, 0.4);
}

.hero-sep {
  color: rgba(200, 160, 100, 0.2);
}

.hero-area {
  color: rgba(200, 160, 100, 0.3);
}

.hero-main {
  display: flex;
  gap: 60px;
  align-items: center;
}

.hero-text-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-char {
  font-size: clamp(5rem, 14vw, 10rem);
  font-weight: 100;
  line-height: 0.9;
  color: rgba(200, 160, 100, 0.5);
  letter-spacing: 0.05em;
}

.hero-char:nth-child(2) {
  color: rgba(200, 160, 100, 0.35);
  padding-left: 2em;
}

.hero-bottom {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-top: 1rem;
}

.hero-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 160, 100, 0.3), transparent);
}

.hero-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.5em;
  color: rgba(200, 160, 100, 0.4);
  font-weight: 300;
  text-transform: uppercase;
}

.scroll-hint {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.scroll-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, rgba(200, 160, 100, 0.5), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.7); }
  50% { opacity: 0.9; transform: scaleY(1); }
}

.era-section {
  padding: 140px 10vw;
  background: #0c0b09;
  position: relative;
  z-index: 1;
}

.era-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 80px;
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
}

.era-mark {
  font-size: 4rem;
  font-weight: 200;
  color: rgba(180, 50, 30, 0.3);
  font-family: serif;
  line-height: 1;
}

.era-title {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: rgba(200, 160, 100, 0.6);
  margin: 0 0 2rem;
  text-transform: uppercase;
}

.era-text p {
  font-size: 1.1rem;
  line-height: 2.3;
  color: rgba(200, 160, 100, 0.5);
  margin: 0;
  font-weight: 300;
}

.spirit-section {
  padding: 120px 10vw;
  background: #0c0b09;
  position: relative;
  z-index: 1;
}

.spirit-center {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.spirit-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 3rem;
  color: rgba(200, 160, 100, 0.3);
}

.spirit-quote {
  font-size: clamp(1.3rem, 2.5vw, 1.7rem);
  font-weight: 300;
  line-height: 2;
  color: rgba(200, 160, 100, 0.6);
  margin: 0;
  letter-spacing: 0.05em;
}

.places-section {
  padding: 100px 10vw 140px;
  background: linear-gradient(180deg, #0c0b09 0%, #100d0a 100%);
  position: relative;
  z-index: 1;
}

.places-header {
  text-align: center;
  margin-bottom: 80px;
}

.places-label {
  font-size: 0.6rem;
  letter-spacing: 0.5em;
  color: rgba(200, 160, 100, 0.35);
  text-transform: uppercase;
  display: block;
  margin-bottom: 1rem;
}

.places-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 300;
  color: rgba(200, 160, 100, 0.8);
  letter-spacing: 0.15em;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 60px;
  max-width: 1000px;
  margin: 0 auto;
}

.place-item {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: center;
}

.place-item:nth-child(even) {
  direction: rtl;
}

.place-item:nth-child(even) > * {
  direction: ltr;
}

.place-image-wrap {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85) saturate(1.2);
  transition: all 0.8s ease;
}

.place-item:hover .place-image {
  filter: brightness(0.95) saturate(1.3);
  transform: scale(1.05);
}

.place-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 15, 10, 0.4) 0%, transparent 60%);
}

.place-num {
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 4rem;
  font-weight: 100;
  color: rgba(200, 160, 100, 0.2);
  line-height: 1;
  letter-spacing: 0.1em;
}

.place-index {
  font-size: 0.55rem;
  letter-spacing: 0.4em;
  color: rgba(200, 160, 100, 0.25);
  margin-bottom: 0.8rem;
}

.place-name {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 300;
  color: rgba(200, 160, 100, 0.95);
  margin: 0 0 1.2rem;
  letter-spacing: 0.1em;
}

.place-desc {
  font-size: 0.9rem;
  line-height: 2;
  color: rgba(200, 160, 100, 0.5);
  margin: 0 0 1.5rem;
  font-weight: 300;
}

.place-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: rgba(200, 160, 100, 0.45);
  text-transform: uppercase;
}

.place-location svg {
  width: 13px;
  height: 13px;
}

.figures-section {
  padding: 100px 12vw;
  background: linear-gradient(180deg, #100d0a 0%, #0c0b09 100%);
  position: relative;
  z-index: 1;
}

.figures-header {
  text-align: center;
  margin-bottom: 70px;
}

.figures-label {
  font-size: 0.6rem;
  letter-spacing: 0.5em;
  color: rgba(200, 160, 100, 0.35);
  text-transform: uppercase;
  display: block;
  margin-bottom: 1rem;
}

.figures-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 300;
  color: rgba(200, 160, 100, 0.8);
  letter-spacing: 0.15em;
}

.figures-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  perspective: 1200px;
}

.figure-card {
  transform-style: preserve-3d;
  cursor: pointer;
}

.figure-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.figure-3d {
  position: relative;
  transform-style: preserve-3d;
}

.figure-card-front {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 20, 18, 0.85), rgba(15, 10, 10, 0.9));
  border: 1px solid rgba(200, 160, 100, 0.06);
  border-radius: 20px;
  overflow: hidden;
  padding: 35px 25px;
  transition: all 0.5s ease;
  text-align: center;
}

.figure-card:hover .figure-card-front {
  border-color: rgba(200, 160, 100, 0.15);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(180, 50, 30, 0.15);
}

.figure-card-edge {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(180, 50, 30, 0.15), transparent);
  border-radius: 20px;
  transform: translateZ(-40px);
  filter: blur(25px);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.figure-card:hover .figure-card-edge {
  opacity: 1;
}

.figure-avatar {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(200, 160, 100, 0.12);
}

.figure-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  filter: sepia(0.15) saturate(1.05);
  transition: all 0.5s ease;
}

.figure-card:hover .figure-img {
  filter: sepia(0.05) saturate(1.1);
  transform: scale(1.05);
}

.figure-glow {
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(180, 50, 30, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.figure-card:hover .figure-glow {
  opacity: 1;
}

.figure-info {
  text-align: center;
}

.figure-year {
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  color: rgba(200, 160, 100, 0.35);
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 200;
}

.figure-name {
  font-size: 1.3rem;
  font-weight: 300;
  color: rgba(200, 160, 100, 0.95);
  margin: 0;
  letter-spacing: 0.1em;
}

.legacy-section {
  padding: 120px 12vw;
  background: linear-gradient(180deg, #0c0b09 0%, #13110d 50%, #0c0b09 100%);
  position: relative;
  z-index: 1;
}

.legacy-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.legacy-header {
  margin-bottom: 4rem;
}

.legacy-label {
  font-size: 2.5rem;
  font-weight: 100;
  color: rgba(180, 50, 30, 0.2);
  font-family: serif;
  display: block;
  margin-bottom: 1rem;
}

.legacy-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 200;
  color: rgba(200, 160, 100, 0.8);
  letter-spacing: 0.3em;
  margin: 0;
}

.legacy-visual {
  margin-bottom: 4rem;
}

.legacy-year {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.year-num {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 100;
  color: rgba(200, 160, 100, 0.6);
  letter-spacing: 0.1em;
}

.year-arrow {
  font-size: 2rem;
  color: rgba(180, 50, 30, 0.4);
}

.legacy-markers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
}

.marker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.marker-num {
  font-size: 1rem;
  font-weight: 300;
  color: rgba(200, 160, 100, 0.5);
  letter-spacing: 0.2em;
}

.marker-label {
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  color: rgba(200, 160, 100, 0.25);
  text-transform: uppercase;
}

.marker-line {
  width: 100px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 160, 100, 0.2), transparent);
}

.ending-section {
  padding: 200px 10vw;
  background: #0c0b09;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.ending-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  perspective: 1500px;
  perspective-origin: center center;
}

.ending-visual {
  position: relative;
  width: 500px;
  height: 500px;
  transform-style: preserve-3d;
  transform: rotateX(15deg) rotateY(-10deg);
}

.ending-circle {
  position: absolute;
  inset: 60px;
  background: radial-gradient(circle, rgba(180, 50, 30, 0.5) 0%, rgba(150, 40, 20, 0.3) 50%, transparent 70%);
  border-radius: 50%;
  filter: blur(30px);
  transform-style: preserve-3d;
  transform: translateZ(50px);
}

.ending-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(200, 160, 100, 0.2);
  border-radius: 50%;
  transform-style: preserve-3d;
}

.ending-ring-1 {
  transform: translateZ(0px);
}

.ending-ring-2 {
  inset: 50px;
  transform: translateZ(30px);
}

.ending-ring-3 {
  inset: 100px;
  border-color: rgba(180, 50, 30, 0.25);
  transform: translateZ(60px);
}

@media (max-width: 900px) {
  .era-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .place-item,
  .place-item:nth-child(even) {
    grid-template-columns: 1fr;
    direction: ltr;
  }

  .place-image-wrap {
    height: 250px;
  }

  .figures-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .figure-avatar {
    width: 100px;
    height: 100px;
  }

  .legacy-markers {
    flex-direction: column;
    gap: 30px;
  }

  .marker-line {
    width: 40px;
    height: 1px;
  }

  .legacy-year {
    gap: 20px;
  }
}
</style>
