<template>
  <div class="spots">
    <div class="page-header">
      <h1>景点一览</h1>
      <p>发现莲花湖的每一处美景</p>
    </div>

    <section class="spots-list">
      <div class="container">
        <div class="spots-filter">
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.value"
              :class="['filter-tab', { active: activeFilter === tab.value }]"
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="spots-grid">
          <ParallaxSection
            v-for="(spot, index) in filteredSpots"
            :key="spot.id"
            :delay="index * 100"
          >
            <div class="spot-card" @click="goToDetail(spot.id)">
              <div class="spot-image">
                <img :src="spot.image" :alt="spot.title" loading="lazy" />
                <div class="spot-rating" v-if="spot.rating">
                  <svg class="rating-star" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{{ spot.rating }}</span>
                </div>
                <div class="spot-overlay">
                  <span class="explore-btn">
                    <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
              <div class="spot-info">
                <h3>{{ spot.title }}</h3>
                <p class="spot-desc">{{ spot.description }}</p>
                <div class="spot-meta">
                  <div class="meta-item">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{{ spot.location }}</span>
                  </div>
                  <div class="meta-item" v-if="spot.ticket_info">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{{ spot.ticket_info }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { spotAPI } from '../api'
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'Spots',
  components: { ParallaxSection },
  setup() {
    const router = useRouter()
    const spots = ref([])
    const activeFilter = ref('all')

    const filterTabs = [
      { label: '全部景点', value: 'all' },
      { label: '自然风光', value: 'nature' },
      { label: '人文景观', value: 'culture' },
      { label: '休闲娱乐', value: 'entertainment' }
    ]

    const filteredSpots = computed(() => {
      if (activeFilter.value === 'all') return spots.value
      return spots.value
    })

    const loadSpots = async () => {
      try {
        const res = await spotAPI.getSpots()
        spots.value = res.data || []
      } catch (error) {
        console.error('加载景点列表失败:', error)
      }
    }

    const goToDetail = (id) => {
      router.push(`/spots/${id}`)
    }

    onMounted(() => {
      loadSpots()
    })

    return {
      spots,
      activeFilter,
      filterTabs,
      filteredSpots,
      goToDetail
    }
  }
}
</script>

<style scoped>
.spots {
  min-height: 100vh;
}

.spots-list {
  padding: 60px 0 100px;
}

.spots-filter {
  margin-bottom: 50px;
}

.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 12px 28px;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.filter-tab:hover {
  border-color: var(--color-accent-green);
  color: var(--color-accent-green);
}

.filter-tab.active {
  background: var(--color-accent-green);
  border-color: var(--color-accent-green);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(123, 160, 91, 0.3);
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 35px;
}

.spot-card {
  background: var(--color-warm-white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: var(--shadow-light);
}

.spot-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-heavy);
}

.spot-image {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.spot-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.spot-card:hover .spot-image img {
  transform: scale(1.15);
}

.spot-rating {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--shadow-medium);
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
}

.rating-star {
  width: 16px;
  height: 16px;
  color: #f59e0b;
}

.spot-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.7));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 30px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.spot-card:hover .spot-overlay {
  opacity: 1;
}

.explore-btn {
  background: white;
  color: var(--color-accent-green);
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.arrow-icon {
  width: 18px;
  height: 18px;
}

.spot-card:hover .explore-btn {
  transform: translateY(0);
}

.spot-info {
  padding: 28px;
}

.spot-info h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.spot-desc {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spot-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent-green);
  flex-shrink: 0;
}
</style>
