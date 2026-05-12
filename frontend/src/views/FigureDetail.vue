<template>
  <div class="figure-detail" ref="pageRef">
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
      <section class="figure-hero" ref="heroSection">
        <div class="hero-3d" ref="hero3D">
          <div class="avatar-frame">
            <div class="avatar-inner">
              <img :src="figure.image" :alt="figure.title" class="avatar-img" />
            </div>
            <div class="avatar-glow"></div>
          </div>
        </div>

        <div class="hero-info" ref="heroInfo">
          <div class="figure-era">{{ figure.year }}</div>
          <h1 class="figure-name">{{ figure.title }}</h1>
          <p class="figure-subtitle">{{ figure.subtitle }}</p>
          <button v-if="audioSrc" class="audio-btn" @click="toggleAudio" :class="{ playing: isPlaying }">
            <img :src="isPlaying ? '/images/暂停.svg' : '/images/播放.svg'" :alt="isPlaying ? '暂停' : '播放'" />
            <span>{{ isPlaying ? '暂停朗读' : '播放朗读' }}</span>
          </button>
          <audio ref="audioPlayer" :src="audioSrc" preload="auto" playsinline @ended="onAudioEnded"></audio>
        </div>
      </section>

      <section class="section-timeline" ref="timelineSection">
        <div class="section-header">
          <span class="section-num">壹</span>
          <h2 class="section-title">生平事迹</h2>
        </div>
        <div class="timeline-content">
          <div class="timeline-item" v-for="(event, i) in figure.events" :key="i">
            <div class="timeline-marker"></div>
            <div class="timeline-year">{{ event.year }}</div>
            <div class="timeline-text">{{ event.desc }}</div>
          </div>
        </div>
      </section>

      <section class="section-intro" ref="introSection">
        <div class="section-header">
          <span class="section-num">贰</span>
          <h2 class="section-title">人物介绍</h2>
        </div>
        <div class="intro-content">
          <p>{{ figure.introduction }}</p>
        </div>
      </section>

      <section class="section-legacy" ref="legacySection">
        <div class="section-header">
          <span class="section-num">叁</span>
          <h2 class="section-title">精神传承</h2>
        </div>
        <div class="legacy-content">
          <div class="legacy-quote">
            <blockquote>"{{ figure.legacy }}"</blockquote>
          </div>
          <div class="legacy-desc">
            <p>{{ figure.legacyDesc }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="detail-footer">
      <div class="footer-visual">
        <div class="footer-ring"></div>
      </div>
      <p>缅怀先烈 · 传承精神</p>
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
  name: 'FigureDetailPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const pageRef = ref(null)
    const heroSection = ref(null)
    const hero3D = ref(null)
    const heroInfo = ref(null)
    const timelineSection = ref(null)
    const introSection = ref(null)
    const legacySection = ref(null)
    const audioPlayer = ref(null)
    const isPlaying = ref(false)

    const audioSrc = computed(() => {
      const audioMap = {
        'wangweizhou': '',
        'zhangaiping': '/Audio/history/张爱萍介绍1.MP3',
        'xiangshouzhi': '',
        'libaojun': ''
      }
      return audioMap[route.params.id] || ''
    })

    const audioReady = ref(false)

    const figuresData = {
      wangweizhou: {
        id: 'wangweizhou',
        title: '王维舟',
        year: '1887-1970',
        subtitle: '川东游击军创建人',
        image: '/images/History/王维舟.jpeg',
        introduction: '王维舟，四川省宣汉县人，是中国共产党的优秀党员，川东游击队和红三十三军的主要创建者。他领导川东游击军在极其艰苦的条件下坚持革命斗争，为川陕革命根据地的创建和发展作出了重大贡献。毛泽东主席曾亲笔书赠"忠心耿耿，为党为国"，高度评价他的革命精神。',
        events: [
          { year: '1887', desc: '出生于四川省宣汉县' },
          { year: '1927', desc: '加入中国共产党，开始组织农民武装' },
          { year: '1929', desc: '领导川东游击军进行革命斗争' },
          { year: '1933', desc: '川东游击军改编为红三十三军，任军长' },
          { year: '1934', desc: '参加万源保卫战，指挥部队英勇作战' },
          { year: '1949', desc: '新中国成立后，继续为党和人民事业奋斗' },
          { year: '1970', desc: '逝世，享年83岁' }
        ],
        legacy: '忠心耿耿，为党为国',
        legacyDesc: '王维舟同志一生忠于党、忠于人民，他的革命精神和崇高品质激励着一代又一代中国人。红三十三军的光辉战史，是川陕革命根据地斗争史的重要组成部分。'
      },
      zhangaiping: {
        id: 'zhangaiping',
        title: '张爱萍',
        year: '1910-2003',
        subtitle: '开国上将 · 神剑将军',
        image: '/images/History/张爱萍.jpeg',
        introduction: '张爱萍，四川省达县人，中华人民共和国开国上将。他是中国人民解放军海军的重要创建者，长期领导国防尖端武器和航天事业，为我国的国防现代化建设作出了卓越贡献，被誉为"神剑将军"。',
        events: [
          { year: '1910', desc: '出生于四川省达县（今达州市通川区）' },
          { year: '1928', desc: '加入中国共产党' },
          { year: '1933', desc: '参加红四方面军，开始革命生涯' },
          { year: '1949', desc: '新中国成立后，受命组建华东海军' },
          { year: '1955', desc: '被授予上将军衔' },
          { year: '1980', desc: '领导完成洲际导弹发射任务' },
          { year: '2003', desc: '逝世，享年93岁' }
        ],
        legacy: '扎根国防，科技强军',
        legacyDesc: '张爱萍将军的一生，是为国防现代化事业奋斗的一生。他主持完成了"两弹一星"等重大国防科技任务，为我国在国际舞台上赢得尊严和地位。'
      },
      xiangshouzhi: {
        id: 'xiangshouzhi',
        title: '向守志',
        year: '1915-2017',
        subtitle: '开国少将',
        image: '/images/History/向守志.jpeg',
        introduction: '向守志，四川省宣汉县人，中国人民解放军开国少将。他曾亲历万源保卫战，后在抗日战争、解放战争中立下赫赫战功。1955年被授予少将军衔，1988年晋升上将军衔。',
        events: [
          { year: '1915', desc: '出生于四川省宣汉县' },
          { year: '1934', desc: '参加万源保卫战' },
          { year: '1936', desc: '长征途中，历经艰险' },
          { year: '1955', desc: '被授予少将军衔' },
          { year: '1988', desc: '晋升上将军衔' },
          { year: '2017', desc: '逝世，享年102岁' }
        ],
        legacy: '英勇无畏，战功卓著',
        legacyDesc: '向守志将军从一名普通战士成长为共和国将军，他的经历本身就是一部活生生的革命史教材，激励着后人继承革命传统。'
      },
      libaojun: {
        id: 'libaojun',
        title: '李家俊',
        year: '1902-1932',
        subtitle: '万源起义领导人',
        image: '/images/History/李家俊.jpeg',
        introduction: '李家俊，四川省万源县人，1929年领导了万源固军坝起义，这是土地革命时期四川武装反抗国民党反动派的第一枪，在四川革命史上具有开创性意义。',
        events: [
          { year: '1902', desc: '出生于四川省万源县' },
          { year: '1927', desc: '加入中国共产党' },
          { year: '1929', desc: '领导万源固军坝起义，打响四川革命第一枪' },
          { year: '1930', desc: '建立革命根据地' },
          { year: '1932', desc: '在革命斗争中英勇牺牲，年仅30岁' }
        ],
        legacy: '打响四川革命第一枪',
        legacyDesc: '李家俊用鲜血和生命在四川大地上播下了革命的火种，他的英勇事迹将永远铭刻在人民心中。'
      }
    }

    const figure = ref(figuresData.wangweizhou)

    let ctx

    const loadFigure = () => {
      const id = route.params.id
      if (figuresData[id]) {
        figure.value = figuresData[id]
      } else {
        router.push('/culture/red')
      }
    }

    const preloadAudio = () => {
      if (audioPlayer.value && audioSrc.value) {
        audioPlayer.value.load()
        audioPlayer.value.oncanplaythrough = () => {
          console.log('Audio ready to play')
        }
      }
    }

    onMounted(() => {
      loadFigure()
      preloadAudio()

      ctx = gsap.context(() => {
        const tl = gsap.timeline()

        tl.from('.bg-gradient', {
          opacity: 0,
          duration: 1.5
        })
        .from(hero3D.value, {
          z: -150,
          opacity: 0,
          rotateY: -20,
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
            trigger: '.section-timeline',
            start: 'top 75%'
          }
        })

        gsap.from('.timeline-item', {
          x: -60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: timelineSection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.intro-content', {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: introSection.value,
            start: 'top 70%'
          }
        })

        gsap.from('.legacy-quote', {
          y: 100,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: legacySection.value,
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
      hero3D,
      heroInfo,
      timelineSection,
      introSection,
      legacySection,
      audioPlayer,
      isPlaying,
      audioSrc,
      audioReady,
      toggleAudio,
      onAudioEnded,
      figure
    }
  }
}
</script>

<style scoped>
.figure-detail {
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

.figure-hero {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  align-items: center;
  padding: 60px 10vw 100px;
  min-height: 70vh;
}

.hero-3d {
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.avatar-frame {
  position: relative;
  width: 350px;
  height: 450px;
  transform-style: preserve-3d;
  transform: rotateY(-8deg) rotateX(5deg);
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(200, 160, 100, 0.08);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  filter: sepia(0.15) saturate(1.1);
}

.avatar-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse at center, rgba(180, 50, 30, 0.25) 0%, transparent 70%);
  filter: blur(40px);
  z-index: -1;
}

.hero-info {
  padding: 40px 0;
}

.figure-era {
  font-size: 0.7rem;
  letter-spacing: 0.5em;
  color: rgba(200, 160, 100, 0.45);
  margin-bottom: 1.5rem;
}

.figure-name {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 200;
  color: rgba(200, 160, 100, 0.95);
  letter-spacing: 0.15em;
  margin: 0 0 1rem;
}

.figure-subtitle {
  font-size: 1rem;
  font-weight: 300;
  color: rgba(200, 160, 100, 0.55);
  letter-spacing: 0.15em;
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

.section-timeline,
.section-intro,
.section-legacy {
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

.timeline-content {
  max-width: 850px;
  margin: 0 auto;
  padding-left: 30px;
  border-left: 1px solid rgba(200, 160, 100, 0.08);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 25px;
  padding: 25px 0;
  align-items: start;
}

.timeline-marker {
  position: absolute;
  left: -36px;
  top: 30px;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #b4321e, #8c2a16);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(180, 50, 30, 0.5);
}

.timeline-year {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgba(180, 50, 30, 0.65);
  padding-top: 5px;
}

.timeline-text {
  font-size: 0.95rem;
  line-height: 1.9;
  color: rgba(200, 160, 100, 0.6);
}

.intro-content {
  max-width: 850px;
  margin: 0 auto;
}

.intro-content p {
  font-size: 1.1rem;
  line-height: 2.3;
  color: rgba(200, 160, 100, 0.65);
  font-weight: 300;
}

.legacy-content {
  max-width: 850px;
  margin: 0 auto;
}

.legacy-quote {
  text-align: center;
  padding: 60px 0; 
  border-top: 1px solid rgba(200, 160, 100, 0.06);
  border-bottom: 1px solid rgba(200, 160, 100, 0.06);
  margin-bottom: 50px;
}

.legacy-quote blockquote {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 200;
  color: rgba(200, 160, 100, 0.85);
  margin: 0;
  letter-spacing: 0.1em;
}

.legacy-desc p {
  font-size: 1rem;
  line-height: 2.1;
  color: rgba(200, 160, 100, 0.5);
  font-weight: 300;
}

.detail-footer {
  padding: 100px 10vw 80px;
  text-align: center;
  position: relative;
}

.footer-visual {
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
  perspective: 800px;
}

.footer-ring {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(200, 160, 100, 0.1);
  border-radius: 50%;
  transform-style: preserve-3d;
}

.detail-footer p {
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  color: rgba(200, 160, 100, 0.25);
  margin: 0;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .figure-hero {
    grid-template-columns: 1fr;
    gap: 50px;
    text-align: center;
  }

  .avatar-frame {
    width: 280px;
    height: 360px;
    margin: 0 auto;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
