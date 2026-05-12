<template>
  <div class="news">
    <div class="page-header">
      <h1>新闻动态</h1>
      <p>了解莲花湖的最新资讯</p>
    </div>

    <section class="news-list">
      <div class="container">
        <div class="news-grid">
          <ParallaxSection
            v-for="(item, index) in news"
            :key="item.id"
            :delay="index * 100"
          >
            <div class="news-card card" @click="goToDetail(item.id)">
              <div class="news-image">
                <img :src="item.cover_image" :alt="item.title" loading="lazy" />
              </div>
              <div class="news-content">
                <div class="news-meta">
                  <span class="author">{{ item.author }}</span>
                  <span class="date">{{ formatDate(item.created_at) }}</span>
                </div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
                <div class="news-footer">
                  <span class="views">👁️ {{ item.view_count }} 阅读</span>
                </div>
              </div>
            </div>
          </ParallaxSection>
        </div>

        <ParallaxSection>
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </ParallaxSection>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { newsAPI } from '../api'
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'News',
  components: { ParallaxSection },
  setup() {
    const router = useRouter()
    const news = ref([])
    const currentPage = ref(1)
    const pageSize = ref(9)
    const total = ref(0)

    const loadNews = async () => {
      try {
        const res = await newsAPI.getNews({
          page: currentPage.value,
          page_size: pageSize.value
        })
        news.value = res.data || []
        total.value = res.total || 0
      } catch (error) {
        console.error('加载新闻列表失败:', error)
      }
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      loadNews()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const goToDetail = (id) => {
      router.push(`/news/${id}`)
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
      currentPage,
      pageSize,
      total,
      handlePageChange,
      goToDetail,
      formatDate
    }
  }
}
</script>

<style scoped>
.news {
  min-height: 100vh;
}

.news-list {
  padding: 60px 0;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.news-card {
  cursor: pointer;
  overflow: hidden;
}

.news-image {
  height: 220px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.1);
}

.news-content {
  padding: 25px;
}

.news-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.news-content h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-content p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
</style>
