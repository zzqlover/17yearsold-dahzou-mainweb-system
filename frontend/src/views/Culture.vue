<template>
  <div class="culture-page">
    <section class="hero">
      <div class="hero-bg" ref="heroBg">
        <img src="/images/home.jpg" alt="达州夜景" class="hero-image" loading="lazy" />
        <div class="hero-overlay"></div>
        <div class="hero-gradient-bottom"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title" ref="heroTitle">
          <span class="word">达州</span>
          <span class="word">文化</span>
        </h1>
        <p class="hero-subtitle" ref="heroSubtitle">千年巴人故里 · 红色革命圣地</p>
        <div class="scroll-line" ref="scrollLine"></div>
      </div>
    </section>

    <section class="intro" ref="intro">
      <div class="intro-line"></div>
      <p ref="introText">这片土地承载着三千年的历史，从巴人文明到革命岁月，每一寸土地都诉说着动人的故事。</p>
    </section>

    <section class="categories">
      <div
        class="category-item"
        v-for="(cat, i) in categories"
        :key="i"
        :ref="el => categoryRefs[i] = el"
        @click="goToCategory(cat.path)"
      >
        <div class="category-image-wrap">
          <img :src="cat.bgImage" :alt="cat.title" class="category-image" loading="lazy" />
          <div class="category-image-overlay"></div>
        </div>
        <div class="category-content">
          <span class="category-index" :ref="el => indexRefs[i] = el">0{{ i + 1 }}</span>
          <h2 :ref="el => titleRefs[i] = el">{{ cat.title }}</h2>
          <p :ref="el => descRefs[i] = el">{{ cat.desc }}</p>
          <div class="category-arrow">
            <span>探索更多</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  name: 'CulturePage',
  setup() {
    const router = useRouter()
    const heroBg = ref(null)
    const heroTitle = ref(null)
    const heroSubtitle = ref(null)
    const scrollLine = ref(null)
    const intro = ref(null)
    const introText = ref(null)
    const categoryRefs = ref([])
    const indexRefs = ref([])
    const titleRefs = ref([])
    const descRefs = ref([])

    let ctx

    const categories = [
      { title: '红色文化', desc: '革命先烈的足迹，张爱萍故居，红军战斗遗址', path: '/culture/red', bgImage: '/images/red.jpg' },
      { title: '景色文化', desc: '莲花湖的静谧，石桥镇的古韵，真佛山的神秘', path: '/culture/scenic', bgImage: '/images/scenic.jpg' },
      { title: '美食文化', desc: '灯影牛肉的香脆，东柳鱼头的鲜美', path: '/culture/food', bgImage: '/images/food.jpg' },
      { title: '研景点', desc: '红军纪念馆，列宁街苏维埃旧址，开启研学之旅', path: '/yanjing', bgImage: '/images/home.jpg' }
    ]

    const goToCategory = (path) => {
      router.push(path)
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
        span.style.transform = 'translateY(10px)'
        element.appendChild(span)
        return span
      })
    }

    onMounted(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

        tl.from('.hero-image', {
          scale: 1.15,
          duration: 2.5,
          ease: 'power2.out'
        })
        .from('.hero-overlay', { opacity: 0, duration: 1 }, 0)
        .from('.hero-gradient-bottom', { height: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
        .from('.word', {
          y: 100,
          opacity: 0,
          duration: 1.2,
          stagger: 0.12
        }, 0.5)
        .from(heroSubtitle.value, {
          y: 30,
          opacity: 0,
          duration: 0.8
        }, 1.1)
        .from(scrollLine.value, {
          scaleY: 0,
          duration: 1
        }, 1.2)

        ScrollTrigger.create({
          trigger: intro.value,
          start: 'top 70%',
          onEnter: () => {
            gsap.from('.intro-line', {
              scaleX: 0,
              duration: 1.2,
              ease: 'power3.out'
            })

            const chars = splitText(introText.value)
            gsap.to(chars, {
              opacity: 1,
              y: 0,
              duration: 0.03,
              stagger: 0.015,
              ease: 'none'
            })
          }
        })

        categoryRefs.value.forEach((el, i) => {
          if (!el) return

          const direction = i % 2 === 0 ? -60 : 60
          const indexChar = splitText(indexRefs.value[i])
          const titleChar = splitText(titleRefs.value[i])
          const descChar = splitText(descRefs.value[i])

          gsap.from(el.querySelector('.category-image-wrap'), {
            x: direction,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            },
            duration: 1.2,
            ease: 'power3.out'
          })

          gsap.from(el.querySelector('.category-content'), {
            x: -direction,
            opacity: 0,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            },
            duration: 1,
            ease: 'power3.out'
          })

          gsap.to(indexChar, {
            opacity: 1,
            y: 0,
            duration: 0.025,
            stagger: 0.025,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 75%'
            }
          })

          gsap.to(titleChar, {
            opacity: 1,
            y: 0,
            duration: 0.03,
            stagger: 0.03,
            ease: 'none',
            delay: 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 75%'
            }
          })

          gsap.to(descChar, {
            opacity: 1,
            y: 0,
            duration: 0.025,
            stagger: 0.015,
            ease: 'none',
            delay: 0.15,
            scrollTrigger: {
              trigger: el,
              start: 'top 75%'
            }
          })
        })
      })
    })

    onUnmounted(() => {
      ctx && ctx.revert()
    })

    return {
      heroBg, heroTitle, heroSubtitle, scrollLine,
      intro, introText, categoryRefs, indexRefs, titleRefs, descRefs,
      categories,
      goToCategory
    }
  }
}
</script>

<style scoped>
.culture-page {
  min-height: 100vh;
  background: #0a0a0a;
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
  overflow: hidden;
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
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.5) 0%,
    rgba(30, 15, 15, 0.3) 50%,
    rgba(10, 10, 10, 0.5) 100%
  );
}

.hero-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, #0a0a0a 0%, rgba(10, 10, 10, 0.8) 50%, transparent 100%);
  pointer-events: none;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 30%, rgba(180, 60, 60, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-title {
  font-size: clamp(5rem, 18vw, 14rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 0.9;
  margin: 0;
}

.word {
  display: inline-block;
  color: #fff;
  mix-blend-mode: difference;
}

.hero-subtitle {
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  letter-spacing: 0.4em;
  color: rgba(255,255,255,0.5);
  margin-top: 3rem;
  text-transform: uppercase;
}

.scroll-line {
  width: 1px;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
  margin: 4rem auto 0;
  transform-origin: top;
}

.intro {
  padding: 15vh 24px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.intro-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, #ff6b35, #c41e3a);
  margin: 0 auto 3rem;
  transform-origin: center;
}

.intro p {
  font-size: clamp(1.3rem, 2.5vw, 1.8rem);
  line-height: 1.9;
  color: rgba(255,255,255,0.7);
  font-weight: 300;
}

.categories {
  padding: 10vh 0;
}

.category-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 70vh;
  min-height: 500px;
  cursor: pointer;
  overflow: hidden;
}

.category-item:nth-child(even) {
  direction: rtl;
}

.category-item:nth-child(even) > * {
  direction: ltr;
}

.category-image-wrap {
  position: relative;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.category-item:hover .category-image {
  transform: scale(1.05);
}

.category-image-overlay {
  position: absolute;
  inset: 0;
  transition: opacity 0.5s ease;
}

.category-item:nth-child(1) .category-image-overlay {
  background: linear-gradient(135deg, rgba(26, 8, 8, 0.3), rgba(26, 8, 8, 0.1));
}

.category-item:nth-child(2) .category-image-overlay {
  background: linear-gradient(135deg, rgba(10, 26, 16, 0.3), rgba(10, 26, 16, 0.1));
}

.category-item:nth-child(3) .category-image-overlay {
  background: linear-gradient(135deg, rgba(26, 21, 8, 0.3), rgba(26, 21, 8, 0.1));
}

.category-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px;
  background: #0f0f0f;
  position: relative;
  overflow: hidden;
}

.category-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b35, #c41e3a);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.category-item:hover .category-content::before {
  transform: scaleX(1);
}

.category-index {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.3);
  margin-bottom: 2rem;
}

.category-content h2 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 1.5rem;
  color: #fff;
  line-height: 1.1;
}

.category-content p {
  font-size: clamp(1rem, 1.2vw, 1.1rem);
  color: rgba(255,255,255,0.5);
  max-width: 400px;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.category-arrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  transition: all 0.4s ease;
}

.category-arrow svg {
  transition: transform 0.4s ease;
}

.category-item:hover .category-arrow {
  color: #fff;
}

.category-item:hover .category-arrow svg {
  transform: translateX(8px);
}

@media (max-width: 1024px) {
  .category-item {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
  }

  .category-item:nth-child(even) {
    direction: ltr;
  }

  .category-image-wrap {
    height: 50vh;
  }

  .category-content {
    padding: 60px 40px;
  }

  .category-content p {
    max-width: 100%;
  }
}
</style>
