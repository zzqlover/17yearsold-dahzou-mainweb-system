<template>
  <div class="parallax-section" ref="sectionRef">
    <div
      class="parallax-element"
      :class="{ visible: isVisible }"
      :style="{ transitionDelay: delay + 'ms' }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ParallaxSection',
  props: {
    delay: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const sectionRef = ref(null)
    const isVisible = ref(false)
    let observer = null

    onMounted(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible.value = true
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      )

      if (sectionRef.value) {
        observer.observe(sectionRef.value)
      }
    })

    onUnmounted(() => {
      if (observer && sectionRef.value) {
        observer.unobserve(sectionRef.value)
      }
    })

    return {
      sectionRef,
      isVisible
    }
  }
}
</script>

<style scoped>
.parallax-section {
  width: 100%;
}

.parallax-element {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.parallax-element.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
