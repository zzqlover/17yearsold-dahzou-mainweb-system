<template>
  <div class="about">
    <div class="page-header">
      <div class="header-bg">
        <img src="/images/湖面.jpeg" alt="达州全景" />
        <div class="header-overlay"></div>
      </div>
      <div class="header-content">
        <h1>关于莲花湖</h1>
        <p>达州的城市绿肺，心灵的栖息地</p>
      </div>
    </div>

    <section class="intro">
      <div class="container">
        <ParallaxSection>
          <div class="intro-content">
            <h2>景区简介</h2>
            <p>
              莲花湖位于四川省达州市通川区，是一座集生态保护、旅游观光、休闲娱乐为一体的大型综合性公园。
              景区总面积约10平方公里，其中水面面积约3平方公里，因湖中莲花繁盛而得名。
            </p>
          </div>
        </ParallaxSection>

        <ParallaxSection :delay="100">
          <div class="intro-image">
            <img src="/images/莲花开.jpeg" alt="莲花湖全景" loading="lazy" />
          </div>
        </ParallaxSection>
      </div>
    </section>

    <section class="history">
      <div class="container">
        <ParallaxSection>
          <h2>历史沿革</h2>
        </ParallaxSection>

        <div class="timeline">
          <ParallaxSection v-for="(item, index) in history" :key="index" :delay="index * 100">
            <div class="timeline-item">
              <div class="timeline-year">{{ item.year }}</div>
              <div class="timeline-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <ParallaxSection>
          <h2>景区特色</h2>
        </ParallaxSection>

        <div class="features-grid">
          <ParallaxSection v-for="(feature, index) in features" :key="index" :delay="index * 100">
            <div class="feature-item">
              <div class="feature-image">
                <img :src="feature.image" :alt="feature.title" loading="lazy" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'About',
  components: { ParallaxSection },
  setup() {
    const history = [
      { year: '1980', title: '初步开发', desc: '开始规划和建设莲花湖公园' },
      { year: '2000', title: '景区扩建', desc: '完成一期工程建设，正式对外开放' },
      { year: '2010', title: 'AAAA级评定', desc: '成功创建国家AAAA级旅游景区' },
      { year: '2020', title: '智慧景区', desc: '上线智能导览系统，提升游客体验' }
    ]

    const features = [
      { image: '/images/lake_landscape_nature_1070743_2560x1080.jpg', title: '莲花景观', desc: '' },
      { image: '/images/凤凰楼.jpeg', title: '人文建筑', desc: '' },
      { image: '/images/湖边.jpeg', title: '水上活动', desc: '' },
      { image: '/images/湖面 (2).jpeg', title: '日出日落', desc: '' }
    ]

    return { history, features }
  }
}
</script>

<style scoped>
.about {
  padding-top: 72px;
}

.page-header {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
}

.header-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
  color: white;
}

.header-content h1 {
  font-size: 3rem;
  margin-bottom: 16px;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.header-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.intro {
  padding: 80px 0;
}

.intro-content {
  max-width: 800px;
  margin: 0 auto 40px;
}

.intro-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.intro-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.intro-image {
  border-radius: var(--radius-large);
  overflow: hidden;
  box-shadow: var(--shadow-medium);
}

.intro-image img {
  width: 100%;
  height: auto;
  display: block;
}

.history {
  padding: 80px 0;
  background: linear-gradient(135deg, var(--color-cream-white) 0%, #F8F6F3 100%);
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.history h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 60px;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.timeline-year {
  flex-shrink: 0;
  width: 80px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-accent-green);
}

.timeline-content {
  flex: 1;
  padding-left: 20px;
  border-left: 3px solid var(--color-accent-green);
}

.timeline-content h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.timeline-content p {
  color: var(--color-text-secondary);
}

.features-section {
  padding: 80px 0;
}

.features-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-item {
  text-align: center;
  padding: 40px 20px;
  background-color: var(--color-warm-white);
  border-radius: var(--radius-medium);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-image {
  width: 100%;
  height: 160px;
  border-radius: var(--radius-medium);
  overflow: hidden;
  margin-bottom: 20px;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.feature-item:hover .feature-image img {
  transform: scale(1.05);
}

.feature-item h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.feature-item p {
  color: var(--color-text-secondary);
}
</style>
