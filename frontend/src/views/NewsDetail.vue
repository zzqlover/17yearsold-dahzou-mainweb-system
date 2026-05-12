<template>
  <div class="news-detail" v-if="news">
    <div class="news-hero" :style="{ backgroundImage: `url(${news.cover_image})` }">
      <div class="hero-overlay">
        <h1>{{ news.title }}</h1>
        <div class="news-meta">
          <span>👤 {{ news.author }}</span>
          <span>📅 {{ formatDate(news.created_at) }}</span>
          <span>👁️ {{ news.view_count }} 阅读</span>
        </div>
      </div>
    </div>

    <section class="news-content">
      <div class="container">
        <div class="content-wrapper">
          <ParallaxSection>
            <div class="news-body">
              <p class="summary">{{ news.summary }}</p>
              <div class="content-text" v-html="formattedContent"></div>
            </div>
          </ParallaxSection>

          <ParallaxSection :delay="100">
            <div class="back-link">
              <button class="btn-secondary" @click="$router.back()">
                ← 返回新闻列表
              </button>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { newsAPI } from '../api'
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'NewsDetail',
  components: { ParallaxSection },
  setup() {
    const route = useRoute()
    const news = ref(null)

    const formattedContent = computed(() => {
      if (!news.value?.content) return ''
      return news.value.content.split('\n').map(p => `<p>${p}</p>`).join('')
    })

    const loadNews = async () => {
      try {
        const id = route.params.id
        news.value = await newsAPI.getNewsDetail(id)
      } catch (error) {
        console.error('加载新闻详情失败:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      loadNews()
    })

    return {
      news,
      formattedContent,
      formatDate
    }
  }
}
</script>

<style scoped>
.news-hero {
  height: 450px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
}

.hero-overlay h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.news-meta {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  opacity: 0.9;
}

.news-content {
  padding: 60px 0;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.news-body {
  background-color: var(--color-warm-white);
  padding: 40px;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
}

.summary {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-soft-gray);
}

.content-text {
  line-height: 1.8;
  color: var(--color-text-primary);
}

.content-text :deep(p) {
  margin-bottom: 15px;
}

.back-link {
  margin-top: 40px;
  text-align: center;
}

@media (max-width: 768px) {
  .hero-overlay {
    padding: 30px;
  }

  .hero-overlay h1 {
    font-size: 1.8rem;
  }

  .news-body {
    padding: 25px;
  }
}
</style>
