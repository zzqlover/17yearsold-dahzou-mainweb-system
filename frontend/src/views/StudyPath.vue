<template>
  <div class="study-page" ref="pageRef">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-label">04</div>
        <h1 class="title">
          <span class="line">研学</span>
          <span class="line">路径</span>
        </h1>
        <p class="subtitle">行走的课堂 · 生长的足迹</p>
      </div>
      <div class="scroll-indicator">
        <span>SCROLL</span>
      </div>
    </section>

    <section class="content-section">
      <div class="section-line" ref="sectionLine1"></div>
      <div class="intro-block" ref="introBlock">
        <div class="block-label">实践育人</div>
        <div class="block-content">
          <h2>知行合一</h2>
          <p>读万卷书，行万里路。达州研学路径将课堂延伸至户外，让学生在实践中学习，在体验中成长。</p>
        </div>
      </div>
    </section>

    <section class="routes-section">
      <div class="section-line" ref="sectionLine2"></div>
      <div class="routes-timeline">
        <div
          class="route-item"
          v-for="(route, i) in routes"
          :key="i"
          :ref="el => routeRefs[i] = el"
        >
          <div class="route-marker">
            <div class="marker-dot"></div>
            <div class="marker-line"></div>
          </div>
          <div class="route-card">
            <div class="route-day">{{ route.day }}</div>
            <div class="route-body">
              <h3>{{ route.title }}</h3>
              <p>{{ route.description }}</p>
              <div class="route-stops">
                <span class="stop-tag" v-for="(stop, idx) in route.stops" :key="idx">
                  {{ stop }}
                </span>
              </div>
              <div class="route-meta">
                <span class="meta-item">
                  <span class="meta-icon">⏱</span>
                  {{ route.duration }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">👥</span>
                  {{ route.group }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-line" ref="sectionLine3"></div>
      <div class="features-grid" ref="featuresGrid">
        <div class="feature-item" v-for="(feature, i) in features" :key="i" :ref="el => featureRefs[i] = el">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h4>{{ feature.title }}</h4>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <section class="cta-section" ref="ctaSection">
      <div class="cta-content">
        <h2>开启你的研学之旅</h2>
        <p>报名咨询，开启一段难忘的学习旅程</p>
        <button class="cta-btn">立即报名</button>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  name: 'StudyPathPage',
  setup() {
    const pageRef = ref(null)
    const sectionLine1 = ref(null)
    const sectionLine2 = ref(null)
    const sectionLine3 = ref(null)
    const introBlock = ref(null)
    const routeRefs = ref([])
    const featureRefs = ref([])
    const featuresGrid = ref(null)
    const ctaSection = ref(null)

    let ctx

    const routes = [
      {
        day: 'DAY 1',
        title: '红色记忆研学之旅',
        description: '走进张爱萍故居，聆听革命故事，传承红色基因。从历史中汲取力量，让革命精神薪火相传。',
        stops: ['张爱萍故居', '红军纪念馆', '革命烈士陵园'],
        duration: '6小时',
        group: '中小学生'
      },
      {
        day: 'DAY 2',
        title: '历史文化探索之旅',
        description: '探访石桥古镇，了解巴人文化，感受历史变迁。穿越时空，与古人对话。',
        stops: ['石桥镇古镇', '巴人文化博物馆', '汉阙公园'],
        duration: '8小时',
        group: '亲子/成人'
      },
      {
        day: 'DAY 3',
        title: '自然生态研学之旅',
        description: '亲近自然，探索湿地生态，学习环保知识。在绿水青山间放飞梦想。',
        stops: ['莲花湖湿地', '自然教育中心', '生态保护区'],
        duration: '7小时',
        group: '亲子/自然爱好者'
      }
    ]

    const features = [
      { icon: '📚', title: '专业课程', desc: '资深教师团队设计的专业研学课程' },
      { icon: '🛡️', title: '安全保障', desc: '全程专业导游陪同，安全措施到位' },
      { icon: '🎓', title: '寓教于乐', desc: '在实践中学习，在体验中成长' },
      { icon: '📝', title: '证书认证', desc: '完成研学可获得官方认证证书' }
    ]

    onMounted(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.from('.hero-label', { opacity: 0, duration: 0.8, delay: 0.2 })
          .from('.line', { y: 100, opacity: 0, duration: 1.2, stagger: 0.15 }, '-=0.5')
          .from('.subtitle', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
          .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.3')

        gsap.from(sectionLine1.value, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionLine1.value, start: 'top 80%' }
        })

        gsap.from(introBlock.value, {
          x: -80, opacity: 0, duration: 1,
          scrollTrigger: { trigger: introBlock.value, start: 'top 80%' }
        })

        gsap.from(sectionLine2.value, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionLine2.value, start: 'top 80%' }
        })

        routeRefs.value.forEach((el, i) => {
          if (!el) return
          gsap.from(el, {
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.15,
            scrollTrigger: { trigger: el, start: 'top 85%' }
          })
        })

        gsap.from(sectionLine3.value, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionLine3.value, start: 'top 80%' }
        })

        featureRefs.value.forEach((el, i) => {
          if (!el) return
          gsap.from(el, {
            y: 50, opacity: 0, duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: { trigger: featuresGrid.value, start: 'top 80%' }
          })
        })

        gsap.from(ctaSection.value, {
          y: 60, opacity: 0, duration: 1,
          scrollTrigger: { trigger: ctaSection.value, start: 'top 85%' }
        })
      }, pageRef.value)
    })

    onUnmounted(() => {
      ctx && ctx.revert()
    })

    return {
      pageRef, sectionLine1, sectionLine2, sectionLine3,
      introBlock, routeRefs, featureRefs, featuresGrid, ctaSection,
      routes, features
    }
  }
}
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: #050510;
  color: #fff;
}

.hero {
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10vw;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
}

.hero-bg::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  background: radial-gradient(ellipse at right center, rgba(60, 80, 180, 0.12) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-label {
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  color: rgba(255,255,255,0.3);
  margin-bottom: 3rem;
}

.title {
  font-size: clamp(5rem, 15vw, 14rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin: 0 0 2rem;
}

.line {
  display: block;
  background: linear-gradient(135deg, #4a90d9 0%, #6b5bff 50%, #9b59b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  letter-spacing: 0.35em;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
}

.scroll-indicator {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.2);
}

.content-section {
  padding: 0 10vw;
  position: relative;
}

.section-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(74,144,217,0.4), rgba(74,144,217,0.1));
  margin-bottom: 80px;
}

.intro-block {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 60px;
  padding: 100px 0;
  max-width: 1200px;
}

.block-label {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgba(74,144,217,0.6);
}

.block-content h2 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #fff;
}

.block-content p {
  font-size: 1.1rem;
  line-height: 2;
  color: rgba(255,255,255,0.5);
  max-width: 600px;
}

.routes-section {
  padding: 100px 10vw;
  position: relative;
}

.routes-timeline {
  max-width: 900px;
  margin: 0 auto;
}

.route-item {
  display: flex;
  gap: 40px;
  margin-bottom: 80px;
  position: relative;
}

.route-item:nth-child(even) {
  flex-direction: row-reverse;
}

.route-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 40px;
}

.marker-dot {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #4a90d9, #6b5bff);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(74,144,217,0.5);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, rgba(74,144,217,0.4), rgba(74,144,217,0.1));
  margin-top: 10px;
}

.route-card {
  flex: 1;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 40px;
  transition: all 0.4s ease;
}

.route-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(74,144,217,0.2);
  transform: translateY(-4px);
}

.route-day {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: rgba(74,144,217,0.6);
  margin-bottom: 1.5rem;
}

.route-body h3 {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff;
}

.route-body > p {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255,255,255,0.5);
  margin-bottom: 1.5rem;
}

.route-stops {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.stop-tag {
  font-size: 0.75rem;
  padding: 6px 14px;
  background: rgba(74,144,217,0.1);
  border: 1px solid rgba(74,144,217,0.2);
  border-radius: 20px;
  color: rgba(74,144,217,0.8);
}

.route-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}

.meta-icon {
  font-size: 1rem;
}

.features-section {
  padding: 100px 10vw;
  position: relative;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-item {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: all 0.4s ease;
}

.feature-item:hover {
  background: rgba(255,255,255,0.04);
  transform: translateY(-8px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #fff;
}

.feature-item p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.4);
}

.cta-section {
  padding: 150px 10vw;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4a90d9 0%, #6b5bff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-content p {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 2.5rem;
}

.cta-btn {
  padding: 16px 48px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #fff;
  background: linear-gradient(135deg, #4a90d9 0%, #6b5bff 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.4s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(74,144,217,0.4);
}

@media (max-width: 768px) {
  .intro-block {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .route-item,
  .route-item:nth-child(even) {
    flex-direction: column;
    gap: 20px;
  }

  .route-marker {
    flex-direction: row;
    width: auto;
  }

  .marker-line {
    flex: 1;
    height: 2px;
    width: auto;
    margin-top: 0;
    margin-left: 10px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
