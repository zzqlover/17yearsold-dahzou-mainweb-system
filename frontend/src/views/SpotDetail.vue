<template>
  <div class="spot-detail" ref="pageRef" v-if="spot">
    <div class="detail-hero">
      <div class="hero-bg">
        <img :src="spot.image" :alt="spot.title" class="hero-image" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <router-link to="/culture/scenic" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </router-link>
        <h1 class="spot-title">{{ spot.title }}</h1>
        <div class="spot-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ spot.location }}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <div class="content-main">
        <section class="info-section">
          <div class="section-header-row">
            <h2 class="section-title">
              <span class="title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </span>
              景点介绍
            </h2>
            <button class="audio-btn" @click="toggleAudio" :class="{ playing: isPlaying }">
              <img :src="isPlaying ? '/images/暂停.svg' : '/images/播放.svg'" :alt="isPlaying ? '暂停' : '播放'" />
              <span>{{ isPlaying ? '暂停朗读' : '播放朗读' }}</span>
            </button>
          </div>
          <p class="description-text">{{ spot.description }}</p>
          <audio ref="audioPlayer" :src="audioSrc" preload="auto" playsinline @ended="onAudioEnded"></audio>
        </section>

        <section class="info-section">
          <h2 class="section-title">
            <span class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            最佳游览时间
          </h2>
          <div class="time-grid">
            <div class="time-card">
              <span class="time-season">春季</span>
              <span class="time-desc">3月-5月</span>
              <span class="time-highlight">油菜花、桃花盛开</span>
            </div>
            <div class="time-card">
              <span class="time-season">夏季</span>
              <span class="time-desc">6月-8月</span>
              <span class="time-highlight">避暑胜地、荷花满塘</span>
            </div>
            <div class="time-card">
              <span class="time-season">秋季</span>
              <span class="time-desc">9月-11月</span>
              <span class="time-highlight">红叶漫山、层林尽染</span>
            </div>
            <div class="time-card">
              <span class="time-season">冬季</span>
              <span class="time-desc">12月-2月</span>
              <span class="time-highlight">雪景雾凇、静谧祥和</span>
            </div>
          </div>
        </section>
      </div>

      <div class="content-sidebar">
        <div class="info-card">
          <h3 class="card-title">游览信息</h3>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">景点位置</span>
              <span class="info-value">{{ spot.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">建议时长</span>
              <span class="info-value">3-5小时</span>
            </div>
            <div class="info-row">
              <span class="info-label">适宜季节</span>
              <span class="info-value">全年适宜</span>
            </div>
          </div>
        </div>

        <div class="map-card">
          <h3 class="card-title">景区地图</h3>
          <div class="map-placeholder">
            <div class="map-gradient"></div>
            <div class="map-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>查看完整地图</span>
            </div>
          </div>
          <button class="map-btn" @click="openInMap">在地图中查看</button>
        </div>
      </div>
    </div>
  </div>

  <div class="loading" v-else>
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SpotDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const pageRef = ref(null)
    const spot = ref(null)
    const audioPlayer = ref(null)
    const isPlaying = ref(false)

    const audioSrc = computed(() => {
      if (!spot.value) return ''
      const titleMap = {
        '莲花湖湿地公园': '/Audio/spots/莲花湖.MP3',
        '八台山风景区': '/Audio/spots/八台山.MP3',
        '巴山大峡谷': '/Audio/spots/巴山大峡谷.MP3',
        '真佛山风景区': '/Audio/spots/真佛山.MP3',
        '梦里巴国·三里古街': '/Audio/spots/三里古街.MP3'
      }
      return titleMap[spot.value.title] || ''
    })

    const fetchSpot = async () => {
      try {
        const id = route.params.id
        const res = await fetch('/api/v1/culture/scenic')
        const data = await res.json()
        const items = data.items || []
        spot.value = items.find(item => item.id === parseInt(id)) || items[0]
      } catch (error) {
        console.error('Failed to fetch spot:', error)
      }
    }

    const toggleAudio = () => {
      if (!audioPlayer.value || !audioSrc.value) return
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

    const openInMap = () => {
      if (!spot.value) return
      router.push({
        path: '/yanjing',
        query: { spot: encodeURIComponent(spot.value.title) }
      })
    }

    const onAudioEnded = () => {
      isPlaying.value = false
    }

    onMounted(async () => {
      await fetchSpot()
    })

    onUnmounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
      }
    })

    return {
      pageRef,
      spot,
      audioPlayer,
      isPlaying,
      audioSrc,
      toggleAudio,
      onAudioEnded,
      openInMap
    }
  }
}
</script>

<style scoped>
.spot-detail {
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
}

.detail-hero {
  height: 70vh;
  position: relative;
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
  animation: heroZoom 15s ease-in-out infinite alternate;
}

@keyframes heroZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    #0a0a0f 0%,
    rgba(10, 10, 15, 0.6) 40%,
    rgba(10, 10, 15, 0.3) 100%
  );
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px 8vw;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #6bb;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.spot-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.spot-meta {
  display: flex;
  gap: 24px;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.meta-item svg {
  width: 18px;
  height: 18px;
  color: #6bb;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 48px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 8vw;
}

.info-section {
  margin-bottom: 48px;
  animation: fadeIn 0.8s ease-out both;
}

.info-section:nth-child(1) { animation-delay: 0.2s; }
.info-section:nth-child(2) { animation-delay: 0.4s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(100, 200, 180, 0.2), rgba(100, 200, 180, 0.1));
  border-radius: 12px;
}

.title-icon svg {
  width: 20px;
  height: 20px;
  color: #6bb;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(100, 200, 180, 0.15), rgba(100, 200, 180, 0.08));
  border: 1px solid rgba(100, 200, 180, 0.25);
  border-radius: 30px;
  color: #6bb;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-btn:hover {
  background: linear-gradient(135deg, rgba(100, 200, 180, 0.25), rgba(100, 200, 180, 0.15));
  border-color: rgba(100, 200, 180, 0.4);
  transform: translateY(-2px);
}

.audio-btn.playing {
  background: linear-gradient(135deg, rgba(100, 200, 180, 0.3), rgba(100, 200, 180, 0.2));
  border-color: rgba(100, 200, 180, 0.5);
}

.audio-btn img {
  width: 20px;
  height: 20px;
}

.description-text {
  font-size: 1.1rem;
  line-height: 2;
  color: rgba(255, 255, 255, 0.7);
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.time-card {
  background: linear-gradient(145deg, rgba(30, 35, 45, 0.8), rgba(20, 25, 35, 0.9));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(100, 200, 180, 0.1);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.time-card:hover {
  transform: translateY(-4px);
  border-color: rgba(100, 200, 180, 0.3);
}

.time-season {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #6bb;
  margin-bottom: 4px;
}

.time-desc {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.time-highlight {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.content-sidebar {
  position: sticky;
  top: 40px;
  height: fit-content;
}

.info-card,
.map-card {
  background: linear-gradient(145deg, rgba(30, 35, 45, 0.9), rgba(20, 25, 35, 0.95));
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(100, 200, 180, 0.1);
  margin-bottom: 24px;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.info-value {
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
}

.map-card {
  animation-delay: 0.5s;
}

.map-placeholder {
  position: relative;
  height: 200px;
  background: rgba(20, 25, 35, 0.8);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.map-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 50%, #1a2a3a 100%);
  border-radius: 12px;
}

.map-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(100, 200, 180, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(100, 200, 180, 0.1) 0%, transparent 40%);
  border-radius: 12px;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.8);
  transition: background 0.3s ease;
}

.map-placeholder:hover .map-overlay {
  background: rgba(0, 0, 0, 0.3);
}

.map-overlay svg {
  width: 40px;
  height: 40px;
  color: #6bb;
}

.map-overlay span {
  font-size: 0.85rem;
}

.map-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #4a9, #6bb);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(100, 200, 180, 0.3);
}

.loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(100, 200, 180, 0.2);
  border-top-color: #6bb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }

  .content-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .map-card {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .detail-hero {
    height: 50vh;
  }

  .hero-content {
    padding: 40px 5vw;
  }

  .spot-title {
    font-size: 2rem;
  }

  .detail-content {
    padding: 40px 5vw;
  }

  .content-sidebar {
    grid-template-columns: 1fr;
  }

  .time-grid {
    grid-template-columns: 1fr;
  }
}
</style>
