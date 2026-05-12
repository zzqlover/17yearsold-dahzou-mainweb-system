<template>
  <div class="place-detail" ref="pageRef">
    <div class="detail-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles"></div>
    </div>

    <header class="detail-header">
      <router-link to="/culture/red" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回</span>
      </router-link>
    </header>

    <main class="detail-content">
      <section class="place-hero" ref="heroSection">
        <div class="hero-visual" ref="heroVisual">
          <div class="image-frame">
            <div class="image-inner">
              <img :src="place.image" :alt="place.title" class="place-img" />
            </div>
            <div class="image-glow"></div>
          </div>
        </div>

        <div class="hero-info" ref="heroInfo">
          <div class="place-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ place.location }}
          </div>
          <h1 class="place-name">{{ place.title }}</h1>
          <p class="place-intro">{{ place.introduction }}</p>
          <button v-if="audioSrc" class="audio-btn" @click="toggleAudio" :class="{ playing: isPlaying }">
            <img :src="isPlaying ? '/images/暂停.svg' : '/images/播放.svg'" :alt="isPlaying ? '暂停' : '播放'" />
            <span>{{ isPlaying ? '暂停朗读' : '播放朗读' }}</span>
          </button>
          <audio ref="audioPlayer" :src="audioSrc" preload="auto" playsinline @ended="onAudioEnded"></audio>
        </div>
      </section>

      <section class="section-history" ref="historySection">
        <div class="section-header">
          <span class="section-num">壹</span>
          <h2 class="section-title">历史背景</h2>
        </div>
        <div class="history-content">
          <div class="history-text" v-for="(item, i) in place.history" :key="i">
            <div class="history-year">{{ item.year }}</div>
            <div class="history-desc">{{ item.desc }}</div>
          </div>
        </div>
      </section>

      <section class="section-significance" ref="significanceSection">
        <div class="section-header">
          <span class="section-num">贰</span>
          <h2 class="section-title">历史意义</h2>
        </div>
        <div class="significance-content">
          <p>{{ place.significance }}</p>
        </div>
      </section>

      <section class="section-visit" ref="visitSection">
        <div class="section-header">
          <span class="section-num">叁</span>
          <h2 class="section-title">参观信息</h2>
        </div>
        <div class="visit-content">
          <div class="visit-info">
            <div class="info-item">
              <span class="info-label">地址</span>
              <span class="info-value">{{ place.location }}</span>
            </div>
            <div class="info-item" v-if="place.openingHours">
              <span class="info-label">开放时间</span>
              <span class="info-value">{{ place.openingHours }}</span>
            </div>
            <div class="info-item" v-if="place.ticket">
              <span class="info-label">门票</span>
              <span class="info-value">{{ place.ticket }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="detail-footer">
      <div class="footer-visual">
        <div class="footer-ring"></div>
        <div class="footer-ring footer-ring-2"></div>
      </div>
      <p>缅怀先烈 · 铭记历史</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  name: 'PlaceDetailPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const pageRef = ref(null)
    const heroSection = ref(null)
    const heroVisual = ref(null)
    const heroInfo = ref(null)
    const historySection = ref(null)
    const significanceSection = ref(null)
    const visitSection = ref(null)
    const audioPlayer = ref(null)
    const isPlaying = ref(false)

    const audioSrc = computed(() => {
      const id = parseInt(route.params.id)
      const audioMap = {
        1: '/Audio/history/张爱萍介绍1.MP3',
        2: '/Audio/history/红军纪念馆1.MP3',
        3: '/Audio/history/万源保卫战.MP3',
        4: '/Audio/history/列林1.MP3'
      }
      return audioMap[id] || ''
    })

    const placesData = {
      1: {
        id: 1,
        title: '张爱萍故居',
        location: '达州市通川区',
        image: '/images/History/张爱萍故居.jpeg',
        introduction: '中国导弹之父张爱萍将军故居，全面展示了这位伟大革命家波澜壮阔的一生。',
        history: [
          { year: '1910', desc: '张爱萍出生于四川省达县' },
          { year: '1928', desc: '加入中国共产党，开始革命生涯' },
          { year: '1933', desc: '参加红四方面军，在川陕根据地战斗' },
          { year: '1949', desc: '新中国成立后，受命组建华东海军' },
          { year: '1955', desc: '被授予上将军衔' },
          { year: '2003', desc: '张爱萍将军逝世，享年93岁' }
        ],
        significance: '张爱萍故居是川陕革命根据地重要纪念地，是传承红色基因、弘扬革命精神的重要场所。张爱萍将军从一名普通战士成长为共和国上将，他的一生见证了中国革命和国防现代化的伟大历程。',
        openingHours: '周二至周日 9:00-17:00',
        ticket: '免费'
      },
      2: {
        id: 2,
        title: '红军纪念馆',
        location: '达州市达川区',
        image: '/images/History/红军纪念馆.jpeg',
        introduction: '收藏了大量珍贵的革命文物，记录着红四方面军在达州的战斗历程。',
        history: [
          { year: '1933', desc: '红四方面军进入达州，建立川陕革命根据地' },
          { year: '1934', desc: '万源保卫战，红军与敌军展开殊死搏斗' },
          { year: '1935', desc: '红四方面军战略转移，离开达州' },
          { year: '1958', desc: '红军纪念馆建成开放' },
          { year: '2009', desc: '纪念馆进行扩建和展陈提升' }
        ],
        significance: '红军纪念馆是达州红色文化的标志性建筑，馆内收藏的珍贵文物生动再现了那段峥嵘岁月，是进行革命传统教育的重要基地。',
        openingHours: '周一至周日 8:30-17:30',
        ticket: '凭身份证免费参观'
      },
      3: {
        id: 3,
        title: '万源保卫战遗址',
        location: '达州市万源市',
        image: '/images/History/万源保卫战.jpeg',
        introduction: '1934年红军在此与敌军展开殊死搏斗，是川陕革命根据地最惨烈的战役之一。',
        history: [
          { year: '1933', desc: '红四方面军在万源建立根据地' },
          { year: '1934', desc: '国民党发动六路围攻，万源保卫战打响' },
          { year: '1934夏', desc: '红军在万源城郊与敌军展开激烈战斗' },
          { year: '1934秋', desc: '红军取得万源保卫战的重大胜利' },
          { year: '1982', desc: '万源保卫战遗址被列为省级文物保护单位' }
        ],
        significance: '万源保卫战是川陕革命根据地最惨烈的战役之一，红军战士用鲜血和生命捍卫了革命根据地。这场战役的胜利，为川陕革命根据地的巩固和发展作出了重大贡献。',
        openingHours: '全天开放',
        ticket: '免费'
      },
      4: {
        id: 4,
        title: '列宁主义街',
        location: '达州市达川区石桥镇',
        image: '/images/History/列宁街.jpeg',
        introduction: '被誉为"中国红色第一街"，保存着完好的红军石刻标语群。',
        history: [
          { year: '1933', desc: '红四方面军进入石桥镇，建立苏维埃政权' },
          { year: '1934', desc: '红军在街道两旁刻制革命标语' },
          { year: '1935', desc: '红军战略转移后，当地群众保护标语' },
          { year: '1961', desc: '列宁主义街石刻标语被列为省级文物保护单位' },
          { year: '2008', desc: '进行保护性修复，保留原有风貌' }
        ],
        significance: '列宁主义街保存着完好的红军石刻标语群，是研究川陕革命根据地政治宣传工作的重要实物资料，被誉为"中国红色第一街"。',
        openingHours: '全天开放',
        ticket: '免费'
      }
    }

    const place = ref(placesData[1])

    let ctx

    const loadPlace = () => {
      const id = parseInt(route.params.id)
      if (placesData[id]) {
        place.value = placesData[id]
      } else {
        router.push('/culture/red')
      }
    }

    onMounted(() => {
      loadPlace()

      ctx = gsap.context(() => {
        const tl = gsap.timeline()

        tl.from('.bg-gradient', {
          opacity: 0,
          duration: 1.5
        })
        .from(heroVisual.value, {
          z: -150,
          opacity: 0,
          rotateY: 15,
          duration: 1.5,
          ease: 'power4.out'
        }, 0.5)
        .from(heroInfo.value, {
          x: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out'
        }, 0.8)

        gsap.from('.section-header', {
          y: 60,
          opacity: 0,
          duration: 1,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.section-history',
            start: 'top 75%'
          }
        })

        gsap.from('.history-text', {
          x: -60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: historySection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.significance-content', {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: significanceSection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.visit-info', {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: visitSection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.detail-footer', {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.detail-footer',
            start: 'top 90%'
          }
        })

        gsap.to('.footer-ring', {
          rotateY: 360,
          duration: 30,
          ease: 'none',
          repeat: -1
        })

        gsap.to('.footer-ring-2', {
          rotateX: 360,
          duration: 25,
          ease: 'none',
          repeat: -1
        })
      }, pageRef.value)
    })

    onUnmounted(() => {
      ctx && ctx.revert()
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
      }
    })

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

    const onAudioEnded = () => {
      isPlaying.value = false
    }

    return {
      pageRef,
      heroSection,
      heroVisual,
      heroInfo,
      historySection,
      significanceSection,
      visitSection,
      audioPlayer,
      isPlaying,
      audioSrc,
      toggleAudio,
      onAudioEnded,
      place
    }
  }
}
</script>

<style scoped>
.place-detail {
  min-height: 100vh;
  background: #0a0808;
  color: #fff;
  position: relative;
}

.detail-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(180, 50, 30, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(150, 40, 20, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #0a0808 0%, #0f0a0a 50%, #0a0808 100%);
}

.bg-particles {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 15% 25%, rgba(180, 50, 30, 0.08) 0%, transparent 0.5%),
    radial-gradient(circle at 85% 35%, rgba(180, 50, 30, 0.06) 0%, transparent 0.5%),
    radial-gradient(circle at 50% 65%, rgba(180, 50, 30, 0.04) 0%, transparent 0.5%);
}

.detail-header {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  z-index: 1001;
  padding: 20px 50px;
  background: linear-gradient(180deg, rgba(10, 8, 8, 0.98) 0%, rgba(10, 8, 8, 0.6) 50%, transparent 100%);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: rgba(200, 160, 100, 0.35);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  border: none;
  background: transparent;
  transition: all 0.35s ease;
}

.back-btn:hover {
  color: rgba(220, 180, 120, 1);
  transform: scale(1.02);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.detail-content {
  position: relative;
  z-index: 1;
  padding-top: 160px;
}

.place-hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  align-items: center;
  padding: 60px 10vw 100px;
  min-height: 70vh;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.image-frame {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 400px;
  transform-style: preserve-3d;
  transform: rotateY(-8deg) rotateX(5deg);
}

.image-inner {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(200, 160, 100, 0.08);
}

.place-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.15) saturate(1.1);
}

.image-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse at center, rgba(180, 50, 30, 0.25) 0%, transparent 70%);
  filter: blur(40px);
  z-index: -1;
}

.hero-info {
  padding: 40px 0;
}

.place-location {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: rgba(200, 160, 100, 0.45);
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.place-location svg {
  width: 14px;
  height: 14px;
}

.place-name {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 200;
  color: rgba(200, 160, 100, 0.95);
  letter-spacing: 0.15em;
  margin: 0 0 1.5rem;
}

.place-intro {
  font-size: 1.1rem;
  line-height: 2;
  color: rgba(200, 160, 100, 0.6);
  font-weight: 300;
  margin: 0 0 1.5rem;
}

.audio-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(180, 50, 30, 0.2), rgba(180, 50, 30, 0.1));
  border: 1px solid rgba(180, 50, 30, 0.3);
  border-radius: 30px;
  color: rgba(200, 160, 100, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.audio-btn:hover {
  background: linear-gradient(135deg, rgba(180, 50, 30, 0.3), rgba(180, 50, 30, 0.2));
  border-color: rgba(180, 50, 30, 0.5);
  transform: translateY(-2px);
}

.audio-btn.playing {
  background: linear-gradient(135deg, rgba(180, 50, 30, 0.4), rgba(180, 50, 30, 0.25));
  border-color: rgba(180, 50, 30, 0.6);
}

.audio-btn img {
  width: 22px;
  height: 22px;
}

.section-history,
.section-significance,
.section-visit {
  padding: 100px 12vw;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 60px;
}

.section-num {
  font-size: 2.5rem;
  font-weight: 100;
  color: rgba(180, 50, 30, 0.35);
  font-family: serif;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 200;
  color: rgba(200, 160, 100, 0.9);
  letter-spacing: 0.2em;
  margin: 0;
}

.history-content {
  max-width: 850px;
  margin: 0 auto;
  padding-left: 30px;
  border-left: 1px solid rgba(200, 160, 100, 0.08);
}

.history-text {
  position: relative;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 25px;
  padding: 25px 0;
  align-items: start;
}

.history-year {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgba(180, 50, 30, 0.65);
  padding-top: 5px;
}

.history-desc {
  font-size: 0.95rem;
  line-height: 1.9;
  color: rgba(200, 160, 100, 0.6);
}

.significance-content {
  max-width: 850px;
  margin: 0 auto;
}

.significance-content p {
  font-size: 1.1rem;
  line-height: 2.3;
  color: rgba(200, 160, 100, 0.65);
  font-weight: 300;
}

.visit-content {
  max-width: 850px;
  margin: 0 auto;
}

.visit-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 25px;
  background: rgba(200, 160, 100, 0.03);
  border: 1px solid rgba(200, 160, 100, 0.06);
  border-radius: 12px;
}

.info-label {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: rgba(200, 160, 100, 0.35);
  text-transform: uppercase;
}

.info-value {
  font-size: 0.95rem;
  color: rgba(200, 160, 100, 0.8);
}

.detail-footer {
  padding: 100px 10vw 80px;
  text-align: center;
  position: relative;
}

.footer-visual {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
  perspective: 800px;
}

.footer-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(200, 160, 100, 0.1);
  border-radius: 50%;
  transform-style: preserve-3d;
}

.footer-ring-2 {
  inset: 20px;
  border-color: rgba(180, 50, 30, 0.15);
}

.detail-footer p {
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  color: rgba(200, 160, 100, 0.25);
  margin: 0;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .place-hero {
    grid-template-columns: 1fr;
    gap: 50px;
    text-align: center;
  }

  .image-frame {
    max-width: 350px;
    height: 280px;
    margin: 0 auto;
  }

  .place-location {
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .history-text {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
