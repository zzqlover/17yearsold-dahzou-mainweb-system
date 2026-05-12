<template>
  <div class="yanjing-page">
    <!-- 地图容器 -->
    <div id="amap-container" ref="mapContainerEl" class="map-container"></div>

    <!-- 天气滤镜覆盖层 -->
    <div class="weather-filter" :class="weatherFilterClass"></div>

    <!-- 天气卡片 -->
    <div class="weather-card" v-if="weatherData">
      <div class="weather-icon" v-html="weatherIcon"></div>
      <div class="weather-info">
        <div class="weather-temp">{{ Math.round(weatherData.temp) }}°C</div>
        <div class="weather-condition">{{ weatherData.condition }}</div>
        <div class="weather-location">{{ weatherData.location }}</div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          @focus="showSuggestions = true"
          @input="onSearchInput"
          @blur="hideSuggestions"
          type="text"
          placeholder="搜索达州景点，如列宁街、凤凰山..."
          class="search-input"
          ref="searchInputEl"
        />
      </div>
      <div class="suggestions" v-if="showSuggestions && filteredPOIs.length > 0">
        <div
          v-for="poi in filteredPOIs"
          :key="poi.id"
          @mousedown="selectPOI(poi)"
          class="suggestion-item"
        >
          <span class="poi-type-badge" :class="poi.type">{{ getTypeName(poi.type) }}</span>
          <span class="poi-name">{{ poi.name }}</span>
        </div>
      </div>
    </div>

    <!-- 景点信息侧边栏 -->
    <transition name="slide-in">
      <div class="info-sidebar" v-if="selectedPOI">
        <div class="sidebar-header">
          <h3 class="sidebar-title">{{ selectedPOI.name }}</h3>
          <button class="close-btn" @click="closeSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 选项卡 -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['tab-item', { active: activeTab === tab.key }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="tab-content">
          <!-- 简介 -->
          <div v-show="activeTab === 'intro'" class="tab-pane">
            <!-- 顶部图片 -->
            <div class="intro-image-wrapper">
              <img
                :src="selectedPOI.image"
                :alt="selectedPOI.name"
                class="intro-image"
                @load="handleImageLoad"
              />
              <div class="intro-image-overlay">
                <div class="image-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ selectedPOI.location }}</span>
                </div>
                <span class="image-badge" :class="selectedPOI.type">{{ getTypeName(selectedPOI.type) }}</span>
              </div>
            </div>

            <!-- 核心简介 -->
            <div class="intro-section">
              <h4 class="section-title">{{ selectedPOI.brief }}</h4>
              <p class="intro-text">{{ selectedPOI.detail }}</p>
            </div>

            <!-- 亮点标签 -->
            <div class="highlights-section">
              <h5 class="section-subtitle">核心看点</h5>
              <div class="highlights-list">
                <span
                  v-for="highlight in selectedPOI.highlights"
                  :key="highlight"
                  class="highlight-tag"
                >
                  {{ highlight }}
                </span>
              </div>
            </div>

            <!-- 历史引用卡片 -->
            <div class="quote-card">
              <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
              <div class="quote-text">
                每一处遗址都是历史的见证者，承载着革命先辈的信仰与坚持。
              </div>
              <div class="quote-author">—— 达州文化记忆</div>
            </div>

            <!-- 信息网格 -->
            <div class="info-grid-modern">
              <div class="info-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div class="info-card-content">
                  <span class="info-card-label">建议游览</span>
                  <span class="info-card-value">{{ selectedPOI.timeCost }} 分钟</span>
                </div>
              </div>
              <div class="info-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div class="info-card-content">
                  <span class="info-card-label">天气敏感</span>
                  <span class="info-card-value">{{ selectedPOI.weatherSensitive ? '是' : '否' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 文章 -->
          <div v-show="activeTab === 'article'" class="tab-pane">
            <div class="article-section">
              <img
                :src="selectedPOI.image"
                :alt="selectedPOI.name"
                class="article-image"
              />
              <h4 class="section-title">{{ selectedPOI.name }}</h4>
              <p class="article-text">{{ selectedPOI.article }}</p>
            </div>
          </div>

          <!-- 路程 -->
          <div v-show="activeTab === 'route'" class="tab-pane">
            <div v-if="routeInfo" class="route-info">
              <div class="route-stats">
                <div class="stat-item">
                  <span class="stat-label">总距离</span>
                  <span class="stat-value">{{ routeInfo.distance }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">预计时间</span>
                  <span class="stat-value">{{ routeInfo.duration }}</span>
                </div>
              </div>
              <button class="nav-btn" @click="planRouteToPOI">重新规划路线</button>
              <button class="clear-btn" @click="clearRoute">取消路线</button>
            </div>
            <div v-else class="route-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p>点击"生成路线"导航到此处</p>
              <button class="generate-route-btn" @click="planRouteToPOI">生成路线</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- AI 按钮 -->
    <button class="ai-button" @click="toggleAIChat" title="AI 研学导师">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="9" cy="11" r="0.5" fill="currentColor"/>
        <circle cx="12" cy="11" r="0.5" fill="currentColor"/>
        <circle cx="15" cy="11" r="0.5" fill="currentColor"/>
      </svg>
    </button>

    <!-- AI 聊天窗口 -->
    <transition name="fade-up">
      <div class="ai-chat" v-if="showAIChat">
        <div class="chat-header">
          <span class="chat-title">AI 研学导师</span>
          <button class="chat-close" @click="showAIChat = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="chat-messages" ref="chatMessagesEl">
          <div v-for="msg in chatMessages" :key="msg.id" :class="['message', msg.type]">
            <div class="message-content">{{ msg.text }}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input
            v-model="chatInput"
            @keyup.enter="sendChat"
            type="text"
            placeholder="输入你的问题..."
            class="chat-input"
          />
          <button class="chat-send" @click="sendChat" :disabled="!chatInput.trim()">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- 路线规划中加载动画弹窗 -->
    <div class="planning-overlay" ref="planningOverlay" style="opacity: 0; pointer-events: none;">
      <div class="planning-card">
        <div class="planning-spinner">
          <svg viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#C41E3A" stroke-width="3" stroke-dasharray="80, 126" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="planning-visual">
          <div class="route-preview">
            <div class="route-dot start"></div>
            <div class="route-line-animate">
              <div class="route-line-inner"></div>
            </div>
            <div class="route-dot end"></div>
          </div>
        </div>
        <div class="planning-text">
          <div class="planning-title">正在计算最优路线</div>
          <div class="planning-subtitle">结合实时天气与认知参数</div>
        </div>
      </div>
    </div>

    <!-- 路线信息面板 -->
    <div class="route-info-panel" ref="routeInfoPanel" style="opacity: 0; transform: translateY(20px);">
      <div class="route-quick-stats">
        <div class="quick-stat">
          <span class="stat-val">{{ routeInfo?.duration || '--' }}</span>
          <span class="stat-lbl">预计时间</span>
        </div>
        <div class="quick-divider"></div>
        <div class="quick-stat">
          <span class="stat-val">{{ routeInfo?.distance || '--' }}</span>
          <span class="stat-lbl">全程距离</span>
        </div>
      </div>
      <div class="route-path-compact" v-if="selectedPOI && userLocation">
        <span class="path-dot start"></span>
        <span class="path-line"></span>
        <span class="path-dot end"></span>
        <span class="path-name">{{ selectedPOI.name }}</span>
      </div>
      <div class="route-actions">
        <button class="route-nav-btn" @click="openNavigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          开始导航
        </button>
        <button class="route-cancel-btn" @click="clearRoute">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          取消
        </button>
      </div>
    </div>

    <!-- 位置不在达州提示 -->
    <transition name="slide-down">
      <div class="location-toast" v-if="showLocationWarning">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
        </svg>
        <span>您当前不在达州范围，已为您跳转至达州地图</span>
      </div>
    </transition>

    <!-- Toast 提示 -->
    <transition name="toast-fade">
      <div class="toast" v-if="toastMessage">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import gsap from 'gsap'

const route = useRoute()

// ============================================================
// 景点数据（硬编码）
// ============================================================
const POIS = [
  {
    id: 'lianhuahu',
    name: '莲花湖湿地公园',
    coord: [107.45, 31.23],
    type: 'nature',
    brief: '达州城市后花园',
    detail: '国家AAAA级景区，始建于1976年，因湖中天然石槽如莲花绽放而得名。水域面积1400余亩，湖岸线长21公里。2017年投资26亿元打造成海绵城市样板，湖区绿化覆盖率98%，水质常年保持III类以上。',
    article: '莲花湖是达州的城市名片之一，被誉为"城市氧吧"。这里集生态保护、休闲娱乐、文化体验于一体，是市民周末休闲的首选之地。',
    timeCost: 60,
    weatherSensitive: false,
    image: '/uploads/images/莲花户.jpg',
    location: '达川区',
    highlights: ['天然莲花湖', '海绵城市样板', '城市氧吧']
  },
  {
    id: 'bataishan',
    name: '八台山风景区',
    coord: [107.78, 32.05],
    type: 'nature',
    brief: '川东小峨眉，大巴山第二峰',
    detail: '国家级地质公园、国家AAAA级景区，海拔2272.3米。因八层梯状地貌得名，孤峰兀立，云雾缠绕，形成日出、佛光、云海、云瀑等气象奇观。年均170天可见佛光，是四川迎接第一缕阳光的地方。',
    article: '八台山是四川观赏日出的绝佳地点，佛光出现频率仅次于峨眉山。景区设有玻璃栈道、滑雪场等体验项目，四季皆宜。',
    timeCost: 180,
    weatherSensitive: true,
    image: '/uploads/images/八台山.jpeg',
    location: '万源市',
    highlights: ['佛光云海', '玻璃栈道', '四川第一缕阳光']
  },
  {
    id: 'bashan-canyon',
    name: '巴山大峡谷',
    coord: [108.25, 31.65],
    type: 'nature',
    brief: '中国巴文化核心发祥地',
    detail: '国家AAAA级景区，大巴山国家地质公园。峡谷全长140公里，海拔高差2000米，集喀斯特地貌、峡谷景观、巴人文化于一体。有桃溪谷、罗盘顶、大象洞等核心景区，秋季红叶如霞，冬季天然滑雪场开放。',
    article: '峡谷徒步路线推荐：从入口到红军桥，全程约3公里。沿途可欣赏到壮观的峡谷风光和红色文化遗迹。这里也是中国巴文化的核心发祥地，传承土家非遗民俗，被誉为"川东小九寨"。',
    timeCost: 120,
    weatherSensitive: true,
    image: '/images/spots/巴山大峡谷.jpeg',
    location: '宣汉县',
    highlights: ['喀斯特地貌', '巴人文化', '红叶如霞']
  },
  {
    id: 'sanli-street',
    name: '梦里巴国·三里古街',
    coord: [107.50, 31.20],
    type: 'culture',
    brief: '达州版小故宫',
    detail: '川东北首个巴文化沉浸式商业街区，全长700米，占地60亩，以"梦里巴国"为主题。历史可追溯至明代，建筑以川东秦汉风格为主。街上的巴人历史文化馆投资4亿元，气势恢宏，夜晚灯火璀璨。',
    article: '三里古街是体验巴人文化、品尝川东美食的绝佳去处。夜晚的灯火璀璨，仿佛穿越回那个古老的巴国时代。',
    timeCost: 50,
    weatherSensitive: false,
    image: '/uploads/images/三里古街peg.jpeg',
    location: '通川区',
    highlights: ['巴人历史文化馆', '川东秦汉建筑', '沉浸式体验']
  },
  {
    id: 'zhenfoshan',
    name: '真佛山风景区',
    coord: [107.42, 31.08],
    type: 'culture',
    brief: '儒释道三教合一文化圣地',
    detail: '国家AAAA级景区，位于达川区福善镇，距市区35公里，海拔710米。始建于清道光年间，相传蒋德化以孝行善闻名，被尊为"蒋活佛"。核心景区德化寺占地400余亩，玉佛寺双塔高21层为全国之最。每年农历六月十九庙会期间，数万香客云集。',
    article: '真佛山是川东地区著名的宗教文化圣地，三教合一的特色在全国也并不多见。每年庙会期间的盛况令人震撼。',
    timeCost: 90,
    weatherSensitive: false,
    image: '/uploads/images/真佛山.jpeg',
    location: '达川区福善镇',
    highlights: ['三教合一', '玉佛寺双塔', '六月十九庙会']
  },
  {
    id: 'lenin-street',
    name: '列宁主义街（石桥古镇）',
    coord: [106.92, 31.28],
    type: 'red',
    brief: '中国红色第一街',
    detail: '这里曾是中国工农红军第四方面军的重要活动区域，街道两侧保留了大量1930年代的红军石刻标语，是研究川东苏维埃政权历史的珍贵实物资料。',
    article: '列宁街的故事发生在1933年，当时红军在此建立了苏维埃政权。红军撤离后，当地人冒着生命危险将这些标语保留了下来，成为川东地区最完整的红色文化遗存之一。',
    timeCost: 45,
    weatherSensitive: false,
    image: '/images/History/列宁街.jpeg',
    location: '达川区石桥镇',
    highlights: ['红军石刻标语', '川东苏维埃旧址', '百年古街']
  },
  {
    id: 'wanyuan-battle',
    name: '万源保卫战战史陈列馆',
    coord: [108.03, 32.06],
    type: 'red',
    brief: '全国爱国主义教育示范基地',
    detail: '全面展示万源保卫战历史，陈列大量珍贵文物和文献资料，还原这场红军历史上最大规模的阵地防御战。',
    article: '1934年，徐向前等指挥红军在此与敌军展开殊死搏斗。万源保卫战历时数月，红军以少胜多，创造了中国革命战争史上的奇迹。',
    timeCost: 60,
    weatherSensitive: false,
    image: '/images/History/万源保卫战.jpeg',
    location: '万源市',
    highlights: ['革命文物', '战史陈列', '红色记忆']
  },
  {
    id: 'fenghuang-mountain',
    name: '凤凰山红军亭',
    coord: [107.50, 31.22],
    type: 'red',
    brief: '登高可俯瞰达州城',
    detail: '红军亭始建于1934年，位于凤凰山顶，是当年红军观察敌情的重要制高点。亭内保存有多处红军题刻和战斗遗迹。',
    article: '春天凤凰山，杜鹃花开遍山岭，红军亭静静矗立。每年春天，大批游客前来登山赏花，缅怀革命先烈。',
    timeCost: 40,
    weatherSensitive: true,
    image: '/images/History/红军纪念馆.jpeg',
    location: '通川区凤凰山',
    highlights: ['红军遗址', '俯瞰全城', '登山健身']
  },
  {
    id: 'dazhou-museum',
    name: '达州博物馆',
    coord: [107.48, 31.20],
    type: 'culture',
    brief: '了解达州巴文化与红色历史',
    detail: '博物馆馆藏文物千余件，系统展示达州从古至今的历史文化脉络，包括巴文化、红色文化、民俗等多个展区。',
    article: '十大镇馆之宝：包括汉代青铜器、红军使用过的武器、古代巴人遗物等，每一件都承载着达州厚重的历史。',
    timeCost: 50,
    weatherSensitive: false,
    image: '/images/dazhou_museum.jpg',
    location: '通川区',
    highlights: ['巴文化', '红色文物', '汉代青铜器']
  },
  {
    id: 'shenjian-garden',
    name: '神剑园（张爱萍故居）',
    coord: [107.55, 31.28],
    type: 'red',
    brief: '开国上将张爱萍将军故居',
    detail: '故居保留原貌，展示了张爱萍将军从少年求学到革命生涯的完整历程，以及他对国防建设的重大贡献。',
    article: '张爱萍将军生平：1910年生于达县，1928年参加革命。他是新中国国防科技工业的奠基人之一，为两弹一星事业做出重大贡献。',
    timeCost: 55,
    weatherSensitive: false,
    image: '/images/History/张爱萍故居.jpeg',
    location: '通川区罗江镇',
    highlights: ['将军故居', '两弹一星', '革命精神']
  }
]

// ============================================================
// 达州范围定义
// ============================================================
const DAZHOU_BOUNDS = {
  minLng: 106.5,
  maxLng: 108.6,
  minLat: 30.8,
  maxLat: 32.5
}
const DAZHOU_CENTER: [number, number] = [107.5, 31.2]

// ============================================================
// 高德地图 API 配置（从环境变量读取或使用默认值）
// ============================================================
const AMAP_JS_KEY = import.meta.env.VITE_AMAP_KEY || '20151150bfc18a0dc76312de9e62bf70'
const AMAP_REST_KEY = import.meta.env.VITE_AMAP_REST_KEY || '237899eb426ba9fed3d09e408121065f'
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE || ''

// ============================================================
// 状态变量
// ============================================================
let map: any = null
let AMap: any = null
let userMarker: any = null
let poiMarkers: any[] = []
let driving: any = null
let routePolyline: any = null
let routePolylineBg: any = null

const mapContainerEl = ref<HTMLElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)
const chatMessagesEl = ref<HTMLElement | null>(null)
const planningOverlay = ref<HTMLElement | null>(null)
const routeInfoPanel = ref<HTMLElement | null>(null)

const mapReady = ref(false)
const isPlanning = ref(false)
const currentRoute = ref<any>(null)
const routeInfo = ref<{ distance: string; duration: string } | null>(null)
let userLocation: [number, number] | null = null

// GSAP 动画实例
let routeProgressTween: gsap.core.Tween | null = null

// 搜索
const searchQuery = ref('')
const showSuggestions = ref(false)

// 侧边栏
const selectedPOI = ref<any>(null)
const activeTab = ref('intro')

const tabs = [
  { key: 'intro', label: '简介' },
  { key: 'article', label: '文章' },
  { key: 'route', label: '路程' }
]

// AI 聊天
const showAIChat = ref(false)
const chatInput = ref('')
const chatMessages = ref<any[]>([
  { id: 1, text: '你好，我是你的研学助手，可以帮你规划路线、讲解景点。', type: 'ai' }
])

// 天气
const weatherData = ref<any>({
  temp: 22,
  condition: '晴',
  location: '四川·达州',
  icon: 'sunny'
})

// 位置警告
const showLocationWarning = ref(false)
const imageLoaded = ref(false)

// Toast 提示
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

// ============================================================
// 计算属性
// ============================================================
const filteredPOIs = computed(() => {
  if (!searchQuery.value.trim()) return POIS
  const query = searchQuery.value.toLowerCase()
  return POIS.filter(poi => poi.name.toLowerCase().includes(query))
})

const weatherIcon = computed(() => {
  const icons: Record<string, string> = {
    sunny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="21" x2="8" y2="23"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="16" y1="21" x2="16" y2="23"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15h16M4 12h16M4 9h16M4 6h16"/></svg>'
  }
  return icons[weatherData.value.icon] || icons.sunny
})

const weatherFilterClass = computed(() => {
  if (weatherData.value.icon === 'rain') return 'weather-rain'
  if (weatherData.value.icon === 'fog') return 'weather-fog'
  return ''
})

// ============================================================
// 工具函数
// ============================================================
function getTypeName(type: string): string {
  const names: Record<string, string> = {
    red: '红色',
    nature: '自然',
    culture: '文化'
  }
  return names[type] || '其他'
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    red: '#C41E3A',
    nature: '#10b981',
    culture: '#3b82f6'
  }
  return colors[type] || '#6b7280'
}

function showToast(msg: string, duration = 2000) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

function calculateDistance(from: [number, number], to: [number, number]): number {
  const dx = (to[0] - from[0]) * 111 * Math.cos((from[1] + to[1]) / 2 * Math.PI / 180)
  const dy = (to[1] - from[1]) * 111
  return Math.sqrt(dx * dx + dy * dy)
}

function checkInDazhou(lng: number, lat: number): boolean {
  return (
    lng >= DAZHOU_BOUNDS.minLng &&
    lng <= DAZHOU_BOUNDS.maxLng &&
    lat >= DAZHOU_BOUNDS.minLat &&
    lat <= DAZHOU_BOUNDS.maxLat
  )
}

// ============================================================
// 地图初始化
// ============================================================
onMounted(async () => {
  try {
    // 预加载地图脚本（提前开始下载）
    const preloadScript = document.createElement('link')
    preloadScript.rel = 'preload'
    preloadScript.as = 'script'
    preloadScript.href = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_JS_KEY}&plugin=AMap.Geolocation,AMap.Driving`
    document.head.appendChild(preloadScript)

    // 并行加载地图和天气
    const [mapPromise] = await Promise.all([
      // 1. 加载地图
      AMapLoader.load({
        key: AMAP_JS_KEY,
        version: '2.0',
        plugins: ['AMap.Geolocation', 'AMap.Driving'],
        AMapSecurityConfig: {
          securityJsCode: AMAP_SECURITY_CODE
        }
      }),
      // 2. 加载天气（并行）
      fetchWeather().catch(() => {}) // 忽略天气错误
    ])

    AMap = mapPromise
    console.log('[YanJingPage] AMap API loaded, version:', AMap?.version)

    // 确保 Driving 插件已加载
    if (!AMap.Driving) {
      console.log('[YanJingPage] Driving plugin not found, loading manually...')
      await new Promise<void>((resolve, reject) => {
        AMap.plugin('AMap.Driving', (err: any) => {
          if (err) {
            console.error('[YanJingPage] Failed to load Driving plugin:', err)
            reject(err)
          } else {
            console.log('[YanJingPage] Driving plugin loaded successfully')
            resolve()
          }
        })
      })
    }

    // 快速初始化地图（先显示基础地图）
    map = new AMap.Map('amap-container', {
      zoom: 12, // 先小一点，加快渲染
      center: DAZHOU_CENTER,
      viewMode: '2D',
      showLabel: true,
      features: ['bg', 'road'], // 先只加载基础和道路
      zooms: [10, 18]
    })

    // 等待地图完成
    await new Promise<void>(resolve => {
      if (!map) return resolve()
      map.on('complete', () => {
        console.log('[YanJingPage] Map loaded completely')
        resolve()
      })
    })

    // 异步加载其他功能（不阻塞地图显示）
    setTimeout(() => {
      // 补充地图特性
      if (map) {
        map.setFeatures(['bg', 'road', 'building', 'point', 'roadarrow'])
      }
      // 初始化定位
      initGeolocation()
      // 渲染 POI
      renderPOIMarkers()
    }, 0)

    // 每 10 分钟更新一次天气
    weatherTimer = setInterval(fetchWeather, 10 * 60 * 1000)

    mapReady.value = true
    console.log('[YanJingPage] Map ready, userLocation:', userLocation)

    // 处理从景点详情页跳转过来的参数
    handleUrlSpotParam()
  } catch (error) {
    console.error('[YanJingPage] 地图初始化失败:', error)
    showToast('地图加载失败，请刷新重试')
  }
})

onUnmounted(() => {
  // 清理定时器
  if (weatherTimer) clearInterval(weatherTimer)
  // 清理GSAP动画
  if (routeProgressTween) {
    routeProgressTween.kill()
    routeProgressTween = null
  }
  // 清理地图
  if (map) {
    map.destroy()
    map = null
  }
  if (toastTimer) clearTimeout(toastTimer)
})

// ============================================================
// 定位
// ============================================================
function initGeolocation() {
  if (!map || !AMap) return

  const geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 8000,
    showButton: false,
    showMarker: false
  })

  geolocation.getCurrentPosition((status: string, result: any) => {
    if (status === 'complete' && result.position) {
      const lng = result.position.lng
      const lat = result.position.lat
      userLocation = [lng, lat]

      const isInDazhou = checkInDazhou(lng, lat)
      if (!isInDazhou) {
        showLocationWarning.value = true
        setTimeout(() => {
          if (map) {
            map.setCenter(DAZHOU_CENTER)
            map.setZoom(13)
          }
          showLocationWarning.value = false
        }, 3000)
      } else {
        if (map) {
          map.setCenter([lng, lat])
        }
      }

      addUserMarker()
    } else {
      userLocation = [...DAZHOU_CENTER] as [number, number]
      addUserMarker()
    }
  })
}

function addUserMarker() {
  if (!map || !AMap || !userLocation) return

  if (userMarker) {
    map.remove(userMarker)
  }

  userMarker = new AMap.Marker({
    position: userLocation,
    content: `
      <div style="
        width: 12px;
        height: 12px;
        background: #2563eb;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(37,99,235,0.4);
      "></div>
    `,
    offset: new AMap.Pixel(-6, -6),
    zIndex: 200
  })

  map.add(userMarker)
}

// ============================================================
// 渲染景点标记
// ============================================================
function renderPOIMarkers() {
  if (!map || !AMap) return

  POIS.forEach(poi => {
    const color = getTypeColor(poi.type)
    const typeName = getTypeName(poi.type)
    const markerContent = `
      <div class="poi-marker-wrapper" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.2s ease;
        transform-origin: center bottom;
      ">
        <div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="font-size: 11px; color: #fff; font-weight: 600;">${typeName[0]}</span>
        </div>
        <div style="
          margin-top: 4px;
          font-size: 11px;
          color: #ccc;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
          font-weight: 500;
        ">${poi.name}</div>
      </div>
    `

    const marker = new AMap.Marker({
      position: poi.coord,
      content: markerContent,
      offset: new AMap.Pixel(-14, -14),
      zIndex: 100,
      cursor: 'pointer'
    })

    marker.on('mouseover', () => {
      const el = marker.getContent()
      if (el && el instanceof HTMLElement) {
        el.style.transform = 'scale(1.3) translateY(-4px)'
      }
      openSidebar(poi)
    })

    marker.on('mouseout', () => {
      const el = marker.getContent()
      if (el && el instanceof HTMLElement) {
        el.style.transform = 'scale(1) translateY(0)'
      }
    })

    marker.on('click', () => {
      openSidebar(poi)
      map.setCenter(poi.coord)
      map.setZoom(16)
    })

    map.add(marker)
    poiMarkers.push(marker)
  })
}

// ============================================================
// 搜索
// ============================================================
function onSearchInput() {
  showSuggestions.value = true
}

function selectPOI(poi: any) {
  searchQuery.value = poi.name
  showSuggestions.value = false

  openSidebar(poi)

  if (map && mapReady.value) {
    map.setCenter(poi.coord)
    map.setZoom(16)
  }
}

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// ============================================================
// 侧边栏
// ============================================================
function openSidebar(poi: any) {
  selectedPOI.value = poi
  activeTab.value = 'intro'
  routeInfo.value = null
  imageLoaded.value = false
}

function closeSidebar() {
  selectedPOI.value = null
}

/**
 * 处理URL中传来的景点参数（从景点详情页跳转）
 */
function handleUrlSpotParam() {
  const spotName = route.query.spot as string
  if (!spotName) return

  const decodedName = decodeURIComponent(spotName)

  // 在POIS中查找匹配的景点（多种匹配策略）
  let matched: typeof POIS[number] | undefined

  // 策略1：精确名称匹配
  matched = POIS.find(p => p.name === decodedName)

  // 策略2：包含关系
  if (!matched) {
    matched = POIS.find(p =>
      decodedName.includes(p.name) ||
      p.name.includes(decodedName) ||
      decodedName.includes(p.name.replace('风景区', '').replace('·', '')) ||
      p.name.includes(decodedName.replace('风景区', ''))
    )
  }

  // 策略3：关键词匹配
  if (!matched) {
    const keywords = decodedName.replace(/（.+）|\(.+\)|[·、\s]/g, '')
    matched = POIS.find(p => {
      const pName = p.name.replace(/（.+）|\(.+\)|[·、\s]/g, '')
      return keywords.includes(pName) || pName.includes(keywords) ||
        p.name.includes(keywords) || keywords.includes(p.name)
    })
  }

  if (matched) {
    map.setCenter(matched.coord)
    map.setZoom(16)

    setTimeout(() => {
      openSidebar(matched)
    }, 500)
  }
}

// ============================================================
// 路线规划（核心功能·GSAP动画）
// ============================================================

/**
 * 显示加载动画弹窗
 */
function showPlanningOverlay() {
  if (!planningOverlay.value) return
  gsap.to(planningOverlay.value, {
    opacity: 1,
    duration: 0.25,
    ease: 'power2.out',
    onStart: () => {
      if (planningOverlay.value) {
        planningOverlay.value.style.pointerEvents = 'auto'
      }
    }
  })
}

/**
 * 隐藏加载动画弹窗
 */
function hidePlanningOverlay() {
  if (!planningOverlay.value) return
  gsap.to(planningOverlay.value, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.out',
    onComplete: () => {
      if (planningOverlay.value) {
        planningOverlay.value.style.pointerEvents = 'none'
      }
    }
  })
}

/**
 * 显示路线信息面板
 */
function showRouteInfoPanel() {
  if (!routeInfoPanel.value) return
  gsap.to(routeInfoPanel.value, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  })
}

/**
 * 隐藏路线信息面板
 */
function hideRouteInfoPanel(callback?: () => void) {
  if (!routeInfoPanel.value) {
    callback?.()
    return
  }
  gsap.to(routeInfoPanel.value, {
    opacity: 0,
    y: 20,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: callback
  })
}

/**
 * 主路线规划函数 - 使用高德 Driving 真实路线
 */
function planRouteToPOI() {
  if (!selectedPOI.value) return

  if (!userLocation) {
    showToast('无法获取您的位置，请稍后重试')
    return
  }

  // 1. 清除旧路线
  clearRouteSilent()

  // 2. 显示加载动画
  isPlanning.value = true
  showPlanningOverlay()

  console.log('[YanJingPage] ========== 开始路线规划 ==========')

  // 3. 检查地图是否就绪
  if (!AMap || !map) {
    console.error('[YanJingPage] 地图未初始化')
    hidePlanningOverlay()
    showToast('路线规划失败，请刷新重试')
    isPlanning.value = false
    return
  }

  // 4. 检查坐标
  if (!userLocation || !selectedPOI.value?.coord) {
    console.error('[YanJingPage] 坐标数据缺失')
    hidePlanningOverlay()
    showToast('路线规划失败，请刷新重试')
    isPlanning.value = false
    return
  }

  // 5. 准备起点和终点 - 使用 AMap.LngLat 对象
  const origin = new AMap.LngLat(userLocation[0], userLocation[1])
  const destination = new AMap.LngLat(selectedPOI.value.coord[0], selectedPOI.value.coord[1])

  console.log('[YanJingPage] 起点坐标:', origin.lng, origin.lat)
  console.log('[YanJingPage] 终点坐标:', destination.lng, destination.lat)

  // 6. 初始化 Driving 插件
  if (!AMap.Driving) {
    console.error('[YanJingPage] AMap.Driving 插件未加载')
    hidePlanningOverlay()
    showToast('路线规划失败，请刷新重试')
    isPlanning.value = false
    return
  }

  // 7. 创建 Driving 实例
  if (driving) {
    driving.clear()
    driving = null
  }

  driving = new AMap.Driving({
    map: map,
    showTraffic: false,
    policy: AMap.DrivingPolicy.LEAST_TIME
  })

  console.log('[YanJingPage] Driving 实例已创建，开始搜索路线...')

  // 8. 调用高德路线规划
  driving.search(origin, destination, (status: string, result: any) => {
    console.log('[YanJingPage] Driving 回调状态:', status)
    console.log('[YanJingPage] Driving 回调结果:', result)

    if (status === 'complete' && result && result.routes && result.routes.length > 0) {
      // 成功获取路线
      const route = result.routes[0]
      console.log('[YanJingPage] 路线规划成功!')
      console.log('[YanJingPage] 距离:', route.distance, '米')
      console.log('[YanJingPage] 时间:', route.time, '秒')

      // 9. 提取完整路径点
      const fullPath: [number, number][] = []
      if (route.steps) {
        route.steps.forEach((step: any) => {
          if (step.path && Array.isArray(step.path)) {
            fullPath.push(...step.path)
          }
        })
      }

      console.log('[YanJingPage] 路径点数量:', fullPath.length)

      if (fullPath.length === 0) {
        console.error('[YanJingPage] 路径点为空')
        hidePlanningOverlay()
        showToast('路线规划失败，请刷新重试')
        isPlanning.value = false
        return
      }

      // 10. 清除旧路线
      clearRouteSilent()

      // 11. 绘制真实道路 Polyline
      routePolyline = new AMap.Polyline({
        map: map,
        path: fullPath,
        strokeColor: '#3498DB',
        strokeWeight: 6,
        strokeOpacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        showDir: true
      })

      // 12. 地图自适应视野
      map.setFitView(routePolyline)

      // 13. 更新路线信息
      const distanceKm = (route.distance / 1000).toFixed(1)
      const durationMin = Math.ceil(route.time / 60) // 向上取整，更符合实际

      console.log('[YanJingPage] 原始数据 - 距离:', route.distance, '米，时间:', route.time, '秒')
      console.log('[YanJingPage] 格式化后 - 距离:', distanceKm, 'km, 时间:', durationMin, '分钟')

      routeInfo.value = {
        distance: distanceKm + ' km',
        duration: durationMin + ' 分钟'
      }

      currentRoute.value = route

      // 14. 隐藏加载动画
      hidePlanningOverlay()

      // 15. 显示路线信息面板
      showRouteInfoPanel()

      // 16. 切换到路程选项卡
      activeTab.value = 'route'

      showToast('路线规划完成')
      console.log('[YanJingPage] ========== 路线规划成功结束 ==========')
    } else {
      // Driving 失败，启用保险B：REST API
      console.error('[YanJingPage] Driving 路线规划失败，状态码:', status)
      console.log('[YanJingPage] 尝试保险B：REST API')

      fetchRouteFromRESTAPI(userLocation[0], userLocation[1], selectedPOI.value.coord[0], selectedPOI.value.coord[1])
        .then((restResult) => {
          if (restResult.path.length === 0) {
            throw new Error('路径点为空')
          }

          // 清除旧路线
          clearRouteSilent()

          // 绘制路线
          routePolyline = new AMap.Polyline({
            map: map,
            path: restResult.path,
            strokeColor: '#3498DB',
            strokeWeight: 6,
            strokeOpacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            showDir: true
          })

          map.setFitView(routePolyline)

          // 更新路线信息
          const distanceKm = (restResult.distance / 1000).toFixed(1)
          const durationMin = Math.ceil(restResult.duration / 60) // 向上取整

          console.log('[YanJingPage] REST API 原始数据 - 距离:', restResult.distance, '米，时间:', restResult.duration, '秒')
          console.log('[YanJingPage] REST API 格式化后 - 距离:', distanceKm, 'km, 时间:', durationMin, '分钟')

          routeInfo.value = {
            distance: distanceKm + ' km',
            duration: durationMin + ' 分钟'
          }

          hidePlanningOverlay()
          showRouteInfoPanel()
          activeTab.value = 'route'
          showToast('路线规划完成')
          console.log('[YanJingPage] ========== 保险B成功 ==========')
        })
        .catch((errorB) => {
          console.error('[YanJingPage] 保险B也失败:', errorB.message)
          console.error('[YanJingPage] ========== 两种方案均失败 ==========')
          hidePlanningOverlay()
          showToast('路线规划失败，请刷新后重试')
        })
        .finally(() => {
          isPlanning.value = false
        })
    }
  })
}

/**
 * 静默清除路线
 */
function clearRouteSilent() {
  // 停止GSAP动画
  if (routeProgressTween) {
    routeProgressTween.kill()
    routeProgressTween = null
  }

  // 清除Polyline背景层
  if (routePolylineBg && map) {
    map.remove(routePolylineBg)
    routePolylineBg = null
  }

  // 清除Polyline主线
  if (routePolyline && map) {
    map.remove(routePolyline)
    routePolyline = null
  }

  // 清除Driving路线
  if (driving && map) {
    driving.clear()
  }

  currentRoute.value = null
}

/**
 * 保险B：高德 REST API 驾车规划（JSONP）
 */
function fetchRouteFromRESTAPI(originLng: number, originLat: number, destLng: number, destLat: number): Promise<{ path: [number, number][], distance: number, duration: number }> {
  return new Promise((resolve, reject) => {
    console.log('[YanJingPage] 启用保险B：REST API')

    const callbackName = `AMap_Route_Callback_${Date.now()}`
    const url = `https://restapi.amap.com/v3/direction/driving?origin=${originLng},${originLat}&destination=${destLng},${destLat}&output=json&key=${AMAP_REST_KEY}`

    console.log('[YanJingPage] REST API URL:', url)

    const timeout = setTimeout(() => {
      delete (window as any)[callbackName]
      reject(new Error('REST API 请求超时'))
    }, 5000)

    ;(window as any)[callbackName] = (data: any) => {
      clearTimeout(timeout)
      delete (window as any)[callbackName]
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }

      console.log('[YanJingPage] REST API 返回数据:', JSON.stringify(data))
      
      // 调试输出数据结构
      console.log('[YanJingPage] data.status:', data?.status)
      console.log('[YanJingPage] data.route:', data?.route)
      console.log('[YanJingPage] data.route.paths:', data?.route?.paths)

      if (data && data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
        const pathData = data.route.paths[0]
        console.log('[YanJingPage] REST API 路线数据:', pathData)
        
        // 查看所有可用字段
        console.log('[YanJingPage] pathData 所有字段:', Object.keys(pathData))

        const fullPath: [number, number][] = []

        if (pathData.steps) {
          pathData.steps.forEach((step: any, idx: number) => {
            if (step.polyline) {
              const points = step.polyline.split(';')
              points.forEach((p: string) => {
                const [lng, lat] = p.split(',').map(Number)
                if (!isNaN(lng) && !isNaN(lat)) {
                  fullPath.push([lng, lat])
                }
              })
            }
          })
        }

        console.log('[YanJingPage] REST API 解析路径点数:', fullPath.length)

        // 获取距离和时间（REST API使用duration而不是time）
        console.log('[YanJingPage] pathData.distance:', pathData.distance)
        console.log('[YanJingPage] pathData.duration:', pathData.duration)
        console.log('[YanJingPage] pathData.time:', pathData.time)

        resolve({
          path: fullPath,
          distance: parseInt(pathData.distance) || 0,
          duration: parseInt(pathData.duration) || parseInt(pathData.time) || 0
        })
      } else {
        console.error('[YanJingPage] REST API 无效数据 - status:', data?.status, 'route:', data?.route)
        reject(new Error('REST API 返回数据无效'))
      }
    }

    const script = document.createElement('script')
    script.src = `${url}&callback=${callbackName}`
    script.onerror = () => {
      clearTimeout(timeout)
      delete (window as any)[callbackName]
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      reject(new Error('REST API 请求失败'))
    }
    document.body.appendChild(script)
  })
}

/**
 * 清除路线（用户主动取消）
 */
function clearRoute() {
  clearRouteSilent()

  hideRouteInfoPanel(() => {
    routeInfo.value = null
  })

  showToast('路线已取消')
}

/**
 * 打开外部导航App（高德/滴滴/百度地图）
 */
function openNavigation() {
  if (!selectedPOI.value || !userLocation) return

  const destName = encodeURIComponent(selectedPOI.value.name)
  const destLng = selectedPOI.value.coord[0]
  const destLat = selectedPOI.value.coord[1]
  const srcLng = userLocation[0]
  const srcLat = userLocation[1]

  // 优先打开高德地图
  const amapUri = `amapuri://route/plan/?sid=bgv1&slat=${srcLat}&slon=${srcLng}&sname=我的位置&did=bgv2&dlat=${destLat}&dlon=${destLng}&dname=${destName}&dev=1&t=0`

  // 备用：滴滴出行（通过高德跳转或web fallback）
  const didiUri = `didi://passenger/start?departure=${srcLat},${srcLng}&destination=${destLat},${destLng}&destination_name=${destName}`

  // 备用：百度地图
  const baiduUri = `baidumap://map/direction?origin=latlng:${srcLat},${srcLng}|name:我的位置&destination=latlng:${destLat},${destLng}|name:${destName}&mode=driving`

  // 网页版高德兜底
  const webAmap = `https://uri.amap.com/navigation?to=${destLng},${destLat},${destName}&mode=car&src=yanjing`

  // 检测平台
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)

  if (isMobile) {
    // 移动端：尝试打开App，失败则降级到网页版
    const openWithFallback = (uri: string, fallback: string) => {
      const startTime = Date.now()
      const blurHandler = () => {
        // App成功打开（页面失去焦点）
        window.removeEventListener('blur', blurHandler)
      }
      window.addEventListener('blur', blurHandler)

      window.location.href = uri

      // 2.5秒后未打开则跳转网页版
      setTimeout(() => {
        window.removeEventListener('blur', blurHandler)
        if (Date.now() - startTime < 3000) {
          window.open(fallback, '_blank')
        }
      }, 2500)
    }

    if (isIOS) {
      // iOS优先尝试高德
      openWithFallback(amapUri, webAmap)
    } else {
      // Android尝试高德 → 滴滴 → 百度 → 网页版
      openWithFallback(amapUri, webAmap)
    }
  } else {
    // 桌面端：直接打开网页版导航
    window.open(webAmap, '_blank')
  }
}

// ============================================================
// AI 聊天
// ============================================================
function toggleAIChat() {
  showAIChat.value = !showAIChat.value
}

/**
 * 发送AI聊天消息
 */
async function sendChat() {
  if (!chatInput.value.trim()) return

  const userInput = chatInput.value.trim()
  const userMsg = {
    id: Date.now(),
    text: userInput,
    type: 'user'
  }
  chatMessages.value.push(userMsg)
  chatInput.value = ''

  // 滚动到底部
  nextTick(() => {
    if (chatMessagesEl.value) {
      chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
    }
  })

  // 显示输入中状态
  const loadingMsg = {
    id: Date.now() + 1,
    text: '正在思考...',
    type: 'ai',
    loading: true
  }
  chatMessages.value.push(loadingMsg)
  nextTick(() => {
    if (chatMessagesEl.value) {
      chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
    }
  })

  try {
    // 尝试调用后端API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const data = await res.json()

    // 移除loading消息
    const loadIdx = chatMessages.value.findIndex(m => m.loading)
    if (loadIdx !== -1) chatMessages.value.splice(loadIdx, 1)

    const aiMsg = {
      id: Date.now() + 2,
      text: data.response || data.message || data.reply || getSmartFallback(userInput),
      type: 'ai'
    }
    chatMessages.value.push(aiMsg)
  } catch {
    // API不可用，使用智能fallback
    const loadIdx = chatMessages.value.findIndex(m => m.loading)
    if (loadIdx !== -1) chatMessages.value.splice(loadIdx, 1)

    const aiMsg = {
      id: Date.now() + 2,
      text: getSmartFallback(userInput),
      type: 'ai'
    }
    chatMessages.value.push(aiMsg)
  }

  nextTick(() => {
    if (chatMessagesEl.value) {
      chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
    }
  })
}

/**
 * 智能AI回复（当后端API不可用时使用）
 */
function getSmartFallback(input: string): string {
  const lower = input.toLowerCase()

  // 当前景点上下文
  const spotName = selectedPOI.value?.name || ''
  const spotType = selectedPOI.value?.type || ''
  const spotBrief = selectedPOI.value?.brief || ''
  const spotArticle = selectedPOI.value?.article || ''

  // 天气相关
  if (lower.includes('天气') || lower.includes('下雨') || lower.includes('温度') || lower.includes('穿')) {
    if (weatherData.value) {
      return `达州当前天气：${weatherData.value.condition}，温度 ${weatherData.value.temp}°C。${weatherData.value.icon === 'rain' ? '建议带雨具出行哦。' : weatherData.value.temp < 15 ? '天气较凉，建议多穿一些。' : '天气不错，适合外出研学！'}`
    }
    return '达州四季分明，春秋两季最适合研学。建议你查看实时天气安排行程。'
  }

  // 路线/导航相关
  if (lower.includes('路线') || lower.includes('怎么去') || lower.includes('多远') || lower.includes('多久') || lower.includes('导航')) {
    if (routeInfo.value) {
      return `从你的位置到${spotName}，全程约${routeInfo.value.distance}，预计${routeInfo.value.duration}。点击"开始导航"可以打开地图App导航。`
    }
    return `你可以点击景点的"生成路线"按钮，系统会为你规划从当前位置到${spotName}的最优路线。`
  }

  // 开放时间/门票
  if (lower.includes('开放') || lower.includes('门票') || lower.includes('免费') || lower.includes('时间')) {
    return `达州大多数红色景点都是免费开放的，建议游览时长${selectedPOI.value?.timeCost || 40}分钟。具体开放时间建议在出行前电话咨询景区。`
  }

  // 历史/红色文化
  if (lower.includes('历史') || lower.includes('红军') || lower.includes('革命') || lower.includes('故事')) {
    if (spotType === 'red' && spotArticle) {
      return `${spotBrief}。${spotArticle.substring(0, 80)}... 如果你想了解更多，建议到实地参观，感受会更加深刻。`
    }
    return `达州是川陕革命根据地的重要组成部分，有很多红色文化遗迹。红军在这里留下了许多珍贵的历史遗迹和感人故事。`
  }

  // 美食相关
  if (lower.includes('美食') || lower.includes('吃') || lower.includes('特产') || lower.includes('推荐')) {
    return `达州的美食值得一试！灯影牛肉、七星椒卤菜、羊肉格格都是当地特色。建议在研学之余品尝一下地道的川菜风味。`
  }

  // 景点相关
  if (lower.includes('推荐') || lower.includes('好玩') || lower.includes('值得')) {
    return `达州的景点各有特色：红色文化推荐列宁街和万源保卫战陈列馆，自然风光推荐巴山大峡谷，了解历史文化可以去达州博物馆。你可以根据兴趣选择。`
  }

  // 通用智能回复
  const generalReplies = [
    `这是个好问题！${spotName}是一个很特别的研学景点，${spotBrief}。建议你亲自去感受一下，收获会更多。`,
    `关于这个问题，${spotName}其实有很多值得探索的地方。${spotBrief}，希望这对你有所帮助！`,
    `达州研学之旅很有意义！${spotName}作为${spotType === 'red' ? '红色文化' : spotType === 'nature' ? '自然风光' : '历史文化'}类景点，能让你了解到很多课本上学不到的知识。`
  ]
  return generalReplies[Math.floor(Math.random() * generalReplies.length)]
}

// ============================================================
// 天气系统
// ============================================================
function handleImageLoad() {
  imageLoaded.value = true
}

// ============================================================
// 天气系统（加强调用）
// ============================================================
let weatherTimer: ReturnType<typeof setInterval> | null = null

async function fetchWeather() {
  try {
    // 尝试从后端获取天气数据
    const res = await fetch('/api/v1/weather?city=达州')
    const data = await res.json()
    if (data.weather) {
      weatherData.value = {
        temp: data.weather.temp,
        condition: data.weather.status,
        humidity: data.weather.humidity,
        windSpeed: data.weather.windSpeed,
        location: data.weather.city || '四川·达州',
        icon: getWeatherIcon(data.weather.status),
        source: data.source || 'api'
      }
    }
  } catch {
    // 模拟天气数据
    const conditions = [
      { icon: 'sunny', condition: '晴', temp: 22, humidity: 65, windSpeed: 3 },
      { icon: 'cloudy', condition: '多云', temp: 18, humidity: 72, windSpeed: 5 },
      { icon: 'rain', condition: '小雨', temp: 15, humidity: 85, windSpeed: 8 },
      { icon: 'fog', condition: '雾', temp: 12, humidity: 90, windSpeed: 2 }
    ]
    const c = conditions[Math.floor(Math.random() * conditions.length)]
    weatherData.value = {
      temp: c.temp,
      condition: c.condition,
      humidity: c.humidity,
      windSpeed: c.windSpeed,
      location: '四川·达州',
      icon: c.icon,
      source: 'mock'
    }
  }

  applyWeatherFilter()
}

function getWeatherIcon(status: string): string {
  if (status.includes('雨')) return 'rain'
  if (status.includes('雾') || status.includes('霾')) return 'fog'
  if (status.includes('多云')) return 'cloudy'
  return 'sunny'
}

function applyWeatherFilter() {
  const container = mapContainerEl.value
  if (!container) return

  if (weatherData.value.icon === 'rain') {
    container.style.filter = 'brightness(0.92) saturate(0.85)'
  } else if (weatherData.value.icon === 'fog') {
    container.style.filter = 'brightness(0.88) saturate(0.7)'
  } else {
    container.style.filter = 'none'
  }
}
</script>

<style scoped>
.yanjing-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.map-container {
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease-in-out;
}

/* 天气滤镜 */
.weather-filter {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  transition: background 0.3s ease-in-out;
}

.weather-filter.weather-rain {
  background: rgba(80, 80, 80, 0.15);
  mix-blend-mode: overlay;
}

.weather-filter.weather-fog {
  background: rgba(120, 120, 130, 0.1);
  mix-blend-mode: overlay;
}

/* 天气卡片 */
.weather-card {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  background: rgba(16, 16, 20, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.weather-icon {
  width: 32px;
  height: 32px;
  color: #e5e5e5;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.weather-temp {
  font-size: 18px;
  font-weight: 600;
  color: #f0f2f5;
}

.weather-condition {
  font-size: 12px;
  color: #8b9298;
}

.weather-location {
  font-size: 11px;
  color: #5c6370;
}

/* 搜索框 */
.search-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  max-width: calc(100% - 48px);
  z-index: 100;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(16, 16, 20, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: rgba(196, 30, 58, 0.4);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(196, 30, 58, 0.1), 0 0 20px rgba(196, 30, 58, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #8b9298;
  margin-right: 14px;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: #C41E3A;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 400;
  color: #f0f2f5;
  background: transparent;
  letter-spacing: 0.3px;
}

.search-input::placeholder {
  color: #5c6370;
}

.search-input:focus {
  outline: none;
}

/* 搜索建议下拉 */
.suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(24, 24, 28, 0.96);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  z-index: 110;
  animation: sugIn 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes sugIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scaleY(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggestion-item:hover {
  background: rgba(196, 30, 58, 0.1);
}

.suggestion-item:active {
  background: rgba(196, 30, 58, 0.15);
}

.poi-type-badge {
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.poi-type-badge.red {
  background: #fef2f2;
  color: #C41E3A;
}

.poi-type-badge.nature {
  background: #ecfdf5;
  color: #10b981;
}

.poi-type-badge.culture {
  background: #eff6ff;
  color: #3b82f6;
}

.poi-name {
  font-size: 14px;
  color: #e4e7eb;
  font-weight: 400;
}

/* 信息侧边栏 */
.info-sidebar {
  position: absolute;
  right: 16px;
  top: 16px;
  bottom: 16px;
  width: 360px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 150;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease-in-out;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* 选项卡 */
.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-item {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: relative;
}

.tab-item:hover {
  color: #1f2937;
}

.tab-item.active {
  color: #C41E3A;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #C41E3A;
  border-radius: 1px;
}

/* 内容区域 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

/* 图片区域 */
.intro-image-wrapper {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
  overflow: hidden;
  background: #cbd5e1;
}

.intro-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.intro-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.image-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 12px;
}

.image-location svg {
  width: 14px;
  height: 14px;
}

.image-badge {
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(8px);
}

.image-badge.red {
  background: rgba(196, 30, 58, 0.8);
}

.image-badge.nature {
  background: rgba(16, 185, 129, 0.8);
}

.image-badge.culture {
  background: rgba(59, 130, 246, 0.8);
}

/* 核心简介 */
.intro-section {
  padding: 0 16px 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.section-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.intro-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
  margin: 0;
}

/* 亮点标签 */
.highlights-section {
  padding: 0 16px 20px;
}

.highlights-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-tag {
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.highlight-tag:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* 引用卡片 */
.quote-card {
  margin: 0 16px 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fef2f2, #fce7f3);
  border-radius: 10px;
  border-left: 3px solid #C41E3A;
}

.quote-icon {
  width: 20px;
  height: 20px;
  color: #C41E3A;
  margin-bottom: 8px;
  opacity: 0.8;
}

.quote-text {
  font-size: 14px;
  color: #7f1d1d;
  line-height: 1.7;
  font-style: italic;
  margin: 0 0 8px 0;
}

.quote-author {
  font-size: 12px;
  color: #991b1b;
  text-align: right;
  font-weight: 500;
}

/* 现代信息网格 */
.info-grid-modern {
  padding: 0 16px 20px;
  display: flex;
  gap: 12px;
}

.info-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.info-card svg {
  width: 20px;
  height: 20px;
  color: #64748b;
  flex-shrink: 0;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-card-label {
  font-size: 11px;
  color: #94a3b8;
}

.info-card-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* 路程选项卡 */
.route-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.route-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.nav-btn {
  width: 100%;
  padding: 14px;
  background: #C41E3A;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.nav-btn:hover {
  background: #a01830;
}

.clear-btn {
  width: 100%;
  padding: 14px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.clear-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

.route-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.route-placeholder svg {
  width: 48px;
  height: 48px;
  color: #d1d5db;
}

/* 文章区域 */
.article-section {
  padding: 0;
}

.article-image {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
  background-color: #e2e8f0;
  margin-bottom: 20px;
}

.article-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
  margin: 0;
  padding: 0 16px 20px;
}

.generate-route-btn {
  padding: 12px 24px;
  background: #3498DB;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.generate-route-btn:hover {
  background: #2980b9;
}

/* AI 按钮 */
.ai-button {
  position: absolute;
  bottom: 100px;
  right: 16px;
  width: 48px;
  height: 48px;
  background: #C41E3A;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(196, 30, 58, 0.3);
  z-index: 200;
  transition: all 0.3s ease-in-out;
}

.ai-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(196, 30, 58, 0.4);
}

.ai-button svg {
  width: 22px;
  height: 22px;
}

/* AI 聊天窗口 */
.ai-chat {
  position: absolute;
  bottom: 160px;
  right: 16px;
  width: 360px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 200;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.chat-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.chat-close {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}

.chat-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.chat-close svg {
  width: 14px;
  height: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 85%;
  animation: fadeIn 0.3s ease-in-out;
}

.message.ai {
  align-self: flex-start;
}

.message.user {
  align-self: flex-end;
}

.message-content {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message.ai .message-content {
  background: #f3f4f6;
  color: #1f2937;
}

.message.user .message-content {
  background: #C41E3A;
  color: #fff;
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease-in-out;
}

.chat-input:focus {
  border-color: #C41E3A;
}

.chat-send {
  width: 32px;
  height: 32px;
  background: #C41E3A;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
}

.chat-send:hover:not(:disabled) {
  background: #a01830;
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-send svg {
  width: 16px;
  height: 16px;
}

/* 路线规划加载动画 */
.planning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.planning-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 36px 44px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  min-width: 320px;
  max-width: 360px;
}

.planning-spinner {
  width: 56px;
  height: 56px;
  position: relative;
}

.planning-spinner::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(196, 30, 58, 0.15);
}

.planning-spinner svg {
  animation: spin 1s linear infinite;
  filter: drop-shadow(0 2px 8px rgba(196, 30, 58, 0.3));
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.planning-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.route-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.route-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
}

.route-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
}

.route-dot.start {
  background: #2563eb;
  color: #2563eb;
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
}

.route-dot.end {
  background: #C41E3A;
  color: #C41E3A;
  box-shadow: 0 0 12px rgba(196, 30, 58, 0.5);
}

.route-line-animate {
  width: 80px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.route-line-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #2563eb, #C41E3A);
  border-radius: 4px;
  animation: lineMove 1.8s ease-in-out infinite;
}

@keyframes lineMove {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

.planning-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.planning-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.3px;
}

.planning-subtitle {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.planning-progress {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.planning-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #C41E3A);
  border-radius: 2px;
  animation: progressPulse 1.5s ease-in-out infinite;
}

@keyframes progressPulse {
  0% { width: 20%; opacity: 0.8; }
  50% { width: 60%; opacity: 1; }
  100% { width: 90%; opacity: 0.6; }
}

/* 路线信息面板 */
.route-info-panel {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  width: auto;
  min-width: 300px;
  max-width: 420px;
  padding: 14px 18px;
  background: rgba(16, 16, 20, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 150;
}

.route-quick-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.quick-stat .stat-val {
  font-size: 18px;
  font-weight: 700;
  color: #f0f2f5;
}

.quick-stat .stat-lbl {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.3px;
}

.quick-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
}

.route-path-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 14px;
}

.path-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.path-dot.start {
  background: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
}

.path-dot.end {
  background: #C41E3A;
  box-shadow: 0 0 8px rgba(196, 30, 58, 0.5);
}

.path-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #2563eb, #C41E3A);
  border-radius: 1px;
}

.path-name {
  font-size: 13px;
  color: #94a3b8;
  margin-left: 4px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-actions {
  display: flex;
  gap: 10px;
}

.route-nav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #3498DB, #2563eb);
  border: none;
  border-radius: 9px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.route-nav-btn:hover {
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}

.route-nav-btn:active {
  transform: scale(0.98);
}

.route-nav-btn svg {
  width: 15px;
  height: 15px;
}

.route-cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.route-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.route-cancel-btn svg {
  width: 14px;
  height: 14px;
}

/* 位置提示 */
.location-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2000;
}

.location-toast svg {
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
}

.location-toast span {
  font-size: 13px;
  color: #374151;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(24, 24, 28, 0.95);
  color: #e5e5e5;
  border-radius: 8px;
  font-size: 13px;
  z-index: 3000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* 动画 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.planning-fade-enter-active,
.planning-fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.planning-fade-enter-from,
.planning-fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .search-container {
    width: calc(100% - 32px);
  }

  .info-sidebar {
    width: calc(100% - 32px);
    right: 16px;
    left: 16px;
    top: auto;
    bottom: 16px;
    height: 50vh;
  }

  .ai-chat {
    width: calc(100% - 32px);
    right: 16px;
    left: 16px;
    height: 60vh;
  }
}
</style>
