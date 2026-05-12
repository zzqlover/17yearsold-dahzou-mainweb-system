<template>
  <div class="gallery">
    <div class="page-header">
      <h1>图集</h1>
      <p>用镜头记录莲花湖的美好瞬间</p>
    </div>

    <section class="gallery-content">
      <div class="container">
        <div class="gallery-grid">
          <ParallaxSection
            v-for="(image, index) in images"
            :key="index"
            :delay="index * 50"
          >
            <div class="gallery-item" @click="openLightbox(index)">
              <img :src="image.url" :alt="image.title" loading="lazy" />
              <div class="gallery-overlay">
                <h3>{{ image.title }}</h3>
              </div>
            </div>
          </ParallaxSection>
        </div>
      </div>
    </section>

    <el-dialog v-model="lightboxVisible" width="80%">
      <div class="lightbox-content">
        <img :src="images[currentIndex]?.url" :alt="images[currentIndex]?.title" />
        <p class="lightbox-title">{{ images[currentIndex]?.title }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'Gallery',
  components: { ParallaxSection },
  setup() {
    const lightboxVisible = ref(false)
    const currentIndex = ref(0)

    const images = ref([
      { url: '/images/江湖正面.jpeg', title: '莲花湖全景' },
      { url: '/images/水面.jpeg', title: '晨曦中的湖面' },
      { url: '/images/莲花开.jpeg', title: '荷花盛开' },
      { url: '/images/湖边.jpeg', title: '水上乐园' },
      { url: '/images/湖面.jpeg', title: '环湖自行车道' },
      { url: '/images/凤凰楼.jpeg', title: '莲花古刹' },
      { url: '/images/大众望山.jpeg', title: '湖光山色' },
      { url: '/images/江湖正面.jpeg', title: '龙舟赛' },
      { url: '/images/莲花湖桥.jpeg', title: '智能导览' }
    ])

    const openLightbox = (index) => {
      currentIndex.value = index
      lightboxVisible.value = true
    }

    return {
      images,
      lightboxVisible,
      currentIndex,
      openLightbox
    }
  }
}
</script>

<style scoped>
.gallery {
  min-height: 100vh;
}

.gallery-content {
  padding: 60px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.gallery-item {
  position: relative;
  height: 250px;
  border-radius: var(--radius-medium);
  overflow: hidden;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-overlay h3 {
  color: white;
  font-size: 1.1rem;
  margin: 0;
}

.lightbox-content {
  text-align: center;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-medium);
}

.lightbox-title {
  margin-top: 20px;
  font-size: 1.2rem;
  color: var(--color-text-primary);
}
</style>
