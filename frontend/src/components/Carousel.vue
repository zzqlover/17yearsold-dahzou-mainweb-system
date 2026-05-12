<template>
  <div class="carousel-container">
    <el-carousel :interval="5000" height="500px" indicator-position="outside">
      <el-carousel-item v-for="slide in slides" :key="slide.id">
        <div class="slide-content" @click="handleClick(slide)">
          <img :src="slide.image_url" :alt="slide.title" />
          <div class="slide-overlay">
            <h3>{{ slide.title }}</h3>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { slideAPI } from '../api'
import { useRouter } from 'vue-router'

export default {
  name: 'Carousel',
  setup() {
    const slides = ref([])
    const router = useRouter()

    const loadSlides = async () => {
      try {
        const res = await slideAPI.getSlides()
        if (res.data) {
          slides.value = res.data
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
      }
    }

    const handleClick = (slide) => {
      if (slide.link_url) {
        router.push(slide.link_url)
      }
    }

    onMounted(() => {
      loadSlides()
    })

    return {
      slides,
      handleClick
    }
  }
}
</script>

<style scoped>
.carousel-container {
  width: 100%;
}

.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.slide-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: white;
}

.slide-overlay h3 {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}
</style>
