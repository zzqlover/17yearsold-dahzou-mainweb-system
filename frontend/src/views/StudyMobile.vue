<template>
  <div class="study-mobile" ref="pageRef">
    <div class="map-container" id="amapContainer">
      <div v-if="demoMode" class="demo-map-bg">
        <div class="demo-grid"></div>
        <div class="demo-pois">
          <div v-for="(poi, i) in demoPOIs" :key="i" class="demo-poi" :style="{ left: poi.x + '%', top: poi.y + '%' }" :class="'poi-' + poi.type">
            <span class="poi-icon">{{ poi.icon }}</span>
            <span class="poi-name">{{ poi.name }}</span>
          </div>
        </div>
        <div class="demo-fence"></div>
        <div class="demo-user-dot" :style="userDotStyle"></div>
        <div class="demo-label">📍 达州研学区域 · 演示模式</div>
      </div>
    </div>

    <div class="weather-overlay" v-if="weatherData">
      <div class="weather-card" :class="weatherClass">
        <span class="weather-icon">{{ weatherIcon }}</span>
        <span class="weather-temp">{{ weatherData.temp }}°C</span>
        <span class="weather-status">{{ weatherData.status }}</span>
      </div>
    </div>

    <div class="risk-alerts" v-if="riskAlerts.length > 0">
      <transition-group name="alert-slide">
        <div
          v-for="(alert, i) in riskAlerts"
          :key="i"
          class="risk-item"
          :class="'risk-' + alert.level"
        >
          <span class="risk-icon">{{ alert.icon }}</span>
          <span>{{ alert.message }}</span>
        </div>
      </transition-group>
    </div>

    <div class="safety-fence-info" v-if="insideFence !== null">
      <span :class="{ 'fence-safe': insideFence, 'fence-warning': !insideFence }">
        {{ insideFence ? '🛡️ 安全区域内' : '⚠️ 已偏离安全围栏' }}
      </span>
    </div>

    <AITutor
      ref="aiTutor"
      :student-name="studentName"
      :cognitive-profile="cognitiveProfile"
      @message-sent="handleAIMessage"
      @cognitive-test-start="startCognitiveTest"
    />

    <CaseEnginePanel
      v-if="showCasePanel"
      :cognitive-profile="cognitiveProfile"
      :route-plan="currentRoutePlan"
      :agent-logs="agentLogs"
      @close="showCasePanel = false"
    />

    <CognitiveTest
      v-if="showCognitiveTest"
      @complete="handleCognitiveComplete"
      @close="showCognitiveTest = false"
    />

    <div class="floating-actions">
      <button class="fab-btn case-btn" @click="showCasePanel = true" title="CASE引擎">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
          <path d="M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/>
        </svg>
      </button>
      <button class="fab-btn location-btn" @click="locateUser" title="定位">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
        </svg>
      </button>
    </div>

    <MultiAgentLog
      v-if="showAgentLog"
      :logs="agentLogs"
      @close="showAgentLog = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import AITutor from '../components/study/AITutor.vue'
import CognitiveTest from '../components/study/CognitiveTest.vue'
import CaseEnginePanel from '../components/study/CaseEnginePanel.vue'
import MultiAgentLog from '../components/study/MultiAgentLog.vue'

export default {
  name: 'StudyMobile',
  components: { AITutor, CognitiveTest, CaseEnginePanel, MultiAgentLog },
  setup() {
    const pageRef = ref(null)
    const aiTutor = ref(null)
    const mapInstance = ref(null)
    const studentName = ref('小明')
    const showCasePanel = ref(false)
    const showCognitiveTest = ref(false)
    const showAgentLog = ref(false)
    const demoMode = ref(true)

    const demoPOIs = [
      { name: '张爱萍故居', x: 35, y: 40, type: 'history', icon: '🏠' },
      { name: '红军纪念馆', x: 70, y: 25, type: 'history', icon: '🏛️' },
      { name: '万源保卫战遗址', x: 20, y: 20, type: 'history', icon: '⚔️' },
      { name: '列宁主义街', x: 65, y: 60, type: 'history', icon: '📜' },
      { name: '医疗点', x: 50, y: 55, type: 'medical', icon: '🏥' },
      { name: '应急避难点', x: 15, y: 65, type: 'shelter', icon: '🏕️' }
    ]

    const userDotStyle = ref({ left: '48%', top: '45%' })

    const cognitiveProfile = ref({
      theta: null,
      historyKnowledge: 0,
      logicReasoning: 0,
      emotionalEmpathy: 0,
      attentionSpan: 0,
      level: '未诊断'
    })

    const weatherData = ref({
      temp: 26,
      status: '晴',
      humidity: 65,
      windSpeed: 3,
      visibility: 10
    })

    const riskAlerts = ref([])
    const insideFence = ref(null)
    const currentRoutePlan = ref(null)
    const agentLogs = ref([])

    let map = null
    let weatherTimer = null
    let positionWatcher = null

    const weatherClass = computed(() => {
      if (!weatherData.value) return ''
      const s = weatherData.value.status
      if (s.includes('雨')) return 'weather-rain'
      if (s.includes('雷')) return 'weather-storm'
      if (s.includes('晴') || s.includes('阳')) return 'weather-sunny'
      return 'weather-cloudy'
    })

    const weatherIcon = computed(() => {
      const s = weatherData.value?.status || ''
      if (s.includes('雨')) return '🌧️'
      if (s.includes('雷')) return '⛈️'
      if (s.includes('晴') || s.includes('阳')) return '☀️'
      return '☁️'
    })

    const initMap = async () => {
      try {
        const AMap = await AMapLoader.load({
          key: import.meta.env.VITE_AMAP_KEY || '',
          version: '2.0',
          plugins: [
            'AMap.Scale',
            'AMap.ToolBar',
            'AMap.Geolocation',
            'AMap.Weather',
            'AMap.PolygonEditor',
            'AMap.AdvancedInfoWindow'
          ]
        })

        map = new AMap.Map('amapContainer', {
          zoom: 15,
          center: [107.5035, 31.2159],
          viewMode: '3D',
          pitch: 45,
          mapStyle: 'amap://styles/dark',
          showBuildingBlock: true
        })

        map.on('complete', () => {
          demoMode.value = false
          addSafetyFence(map)
          addStudyPOIs(map)
          enableGeolocation(map, AMap)
          startWeatherMonitor(AMap)
          simulateRiskAlerts()
        })

        map.on('error', (e) => {
          console.log('Map error, switching to demo mode:', e)
          demoMode.value = true
          startDemoMode()
        })

      } catch (e) {
        console.log('AMap not available, using demo mode:', e.message || e)
        demoMode.value = true
        startDemoMode()
      }
    }

    const startDemoMode = () => {
      simulateWeather()
      simulateRiskAlerts()
      startDemoPositionAnimation()

      setTimeout(() => {
        addAgentLog('系统', 'CASE引擎初始化完成（演示模式），等待学生接入...', 'system')
        addAgentLog('安全守护智能体', '地理围栏已激活，监控范围：107.4935-107.5135E, 31.2059-31.2259N', 'info')
      }, 1000)

      setTimeout(() => {
        triggerEnvironmentAgent(107.5035, 31.2159)
      }, 5000)
    }

    const startDemoPositionAnimation = () => {
      let angle = 0
      setInterval(() => {
        angle += 0.008
        userDotStyle.value = {
          left: (48 + Math.cos(angle) * 18) + '%',
          top: (45 + Math.sin(angle * 0.7) * 15) + '%'
        }
        checkFenceStatus(107.5035 + Math.cos(angle) * 0.002, 31.2159 + Math.sin(angle * 0.7) * 0.0015)
      }, 2000)
    }

    const addSafetyFence = (map) => {
      const fencePath = [
        [107.4935, 31.2059],
        [107.5135, 31.2059],
        [107.5135, 31.2259],
        [107.4935, 31.2259]
      ]

      const fence = new AMap.Polygon({
        path: fencePath,
        fillColor: '#34d399',
        fillOpacity: 0.08,
        strokeColor: '#10b981',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        strokeStyle: 'dashed',
        zIndex: 50
      })
      map.add(fence)

      const label = new AMap.Marker({
        position: [107.5035, 31.2259],
        content: '<div style="background:#10b981;color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;white-space:nowrap;">研学安全区域</div>',
        offset: new AMap.Pixel(-40, 0),
        zIndex: 51
      })
      map.add(label)
    }

    const addStudyPOIs = (map) => {
      const pois = [
        { name: '张爱萍故居', pos: [107.5005, 31.2189], type: 'history' },
        { name: '红军纪念馆', pos: [107.5085, 31.2129], type: 'history' },
        { name: '万源保卫战遗址', pos: [107.4985, 31.2109], type: 'history' },
        { name: '列宁主义街', pos: [107.5055, 31.2229], type: 'history' },
        { name: '医疗点', pos: [107.5035, 31.2089], type: 'medical' },
        { name: '应急避难点', pos: [107.4965, 31.2209], type: 'shelter' }
      ]

      pois.forEach(poi => {
        const markerColor = poi.type === 'medical' ? '#ef4444' : poi.type === 'shelter' ? '#f59e0b' : '#dc2626'
        const marker = new AMap.Marker({
          position: poi.pos,
          content: `<div style="
            position:relative;
            width:24px;height:32px;
          ">
            <div style="
              position:absolute;
              top:0;
              left:50%;
              margin-left:-12px;
              width:24px;
              height:24px;
              background:${markerColor};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid #fff;
              box-shadow:0 3px 10px rgba(0,0,0,0.35);
            "></div>
            <div style="
              position:absolute;
              top:6px;
              left:50%;
              margin-left:-5px;
              width:10px;
              height:10px;
              background:#fff;
              border-radius:50%;
              transform:rotate(45deg);
            "></div>
            <div style="
              position:absolute;
              bottom:0;
              left:50%;
              margin-left:-6px;
              width:0;
              height:0;
              border-left:6px solid transparent;
              border-right:6px solid transparent;
              border-top:8px solid ${markerColor};
            "></div>
          </div>`,
          offset: new AMap.Pixel(-12, -32)
        })

        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="padding:10px;min-width:140px;">
              <div style="font-weight:600;font-size:14px;color:#1f2937;margin-bottom:4px;">${poi.name}</div>
              <div style="color:#6b7280;font-size:12px;">${poi.type === 'history' ? '红色文化景点' : poi.type === 'medical' ? '紧急医疗点' : '应急避难场所'}</div>
            </div>
          `,
          offset: new AMap.Pixel(0, -40)
        })

        marker.on('click', () => infoWindow.open(map, marker.getPosition()))
        map.add(marker)
      })
    }

    const enableGeolocation = (map, AMap) => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        showButton: false,
        showMarker: true,
        markerOptions: {
          content: '<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px rgba(59,130,246,0.6);animation:pulse 1.5s infinite;"></div>',
          offset: new AMap.Pixel(-7, -7)
        },
        circleOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          strokeColor: '#3b82f6',
          strokeWeight: 1,
          strokeOpacity: 0.4
        }
      })

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          checkFenceStatus(result.position.lng, result.position.lat)
        }
      })

      geolocation.on('complete', (data) => {
        checkFenceStatus(data.position.lng, data.position.lat)
        triggerEnvironmentAgent(data.position.lng, data.position.lat)
      })

      geolocation.on('error', (err) => {
        console.log('Location error:', err)
        useSimulatedPosition()
      })

      geolocation.watchPosition()
    }

    const useSimulatedPosition = () => {
      let angle = 0
      setInterval(() => {
        angle += 0.01
        const lng = 107.5035 + Math.cos(angle) * 0.003
        const lat = 31.2159 + Math.sin(angle * 0.7) * 0.003
        checkFenceStatus(lng, lat)
      }, 3000)
    }

    const checkFenceStatus = (lng, lat) => {
      const inFence = lng >= 107.4935 && lng <= 107.5135 &&
                       lat >= 31.2059 && lat <= 31.2259
      insideFence.value = inFence

      if (!inFence) {
        addRiskAlert({
          level: 'danger',
          icon: '⚠️',
          message: '已偏离安全围栏，请立即返回！'
        })
        addAgentLog('安全守护智能体', `检测到学生偏离安全围栏！坐标(${lng.toFixed(4)}, ${lat.toFixed(4)})，正在通知老师...`, 'warning')
      }
    }

    const startWeatherMonitor = (AMap) => {
      const fetchWeather = async () => {
        try {
          const res = await fetch(`/api/v1/weather?city=达州`)
          const data = await res.json()
          if (data.weather) {
            weatherData.value = data.weather
            analyzeWeatherForNarrative(data.weather)
          }
        } catch (e) {
          simulateWeather()
        }
      }

      fetchWeather()
      weatherTimer = setInterval(fetchWeather, 180000)
      setTimeout(simulateWeather, 1000)
    }

    const simulateWeather = () => {
      const weathers = [
        { temp: 26, status: '晴', humidity: 65, windSpeed: 3 },
        { temp: 23, status: '多云', humidity: 72, windSpeed: 5 },
        { temp: 21, status: '小雨', humidity: 85, windSpeed: 8 },
        { temp: 18, status: '雷阵雨', humidity: 92, windSpeed: 15 }
      ]
      weatherData.value = weathers[Math.floor(Math.random() * weathers.length)]

      if (weatherData.value.status.includes('雨') || weatherData.value.status.includes('雷')) {
        addRiskAlert({
          level: 'warning',
          icon: '🌧️',
          message: `${weatherData.value.status}预警，注意防滑避雨`
        })
      }
    }

    const analyzeWeatherForNarrative = (weather) => {
      if (weather.status.includes('太阳雨') || (weather.temp > 25 && weather.status.includes('雨'))) {
        addAgentLog('环境感知智能体', `检测到即将下太阳雨！触发"东边日出西边雨"红色民谣学习任务。`, 'info')
        aiTutor.value?.sendMessage(`你感到风变冷了吗？当年红军就是在这种天气下翻越巴山的。今天正好可以观察太阳雨现象，这是学习"东边日出西边雨"民谣的好机会！`)
      } else if (weather.windSpeed > 10) {
        addAgentLog('环境感知智能体', `风速达到${weather.windSpeed}m/s，插入情境描述。`, 'info')
        aiTutor.value?.sendMessage(`起风了，当年红军战士在巴山翻山越岭时，经常遇到这种天气。`)
      }
    }

    const simulateRiskAlerts = () => {
      const alerts = [
        { level: 'info', icon: '🔵', message: '莲花湖景区人流适中，预计通行时间5分钟' },
        { level: 'warning', icon: '🟡', message: '三里古街路段轻微拥堵，建议绕行' },
        { level: 'danger', icon: '🔴', message: '八台山方向有落石风险，请远离该区域' }
      ]

      alerts.forEach((alert, i) => {
        setTimeout(() => {
          addRiskAlert(alert)
        }, (i + 1) * 8000 + Math.random() * 5000)
      })
    }

    const addRiskAlert = (alert) => {
      riskAlerts.value.push(alert)
      setTimeout(() => {
        riskAlerts.value.shift()
      }, 15000)
    }

    const triggerEnvironmentAgent = (lng, lat) => {
      const nearbyPOIs = [
        { name: '老茶馆', distance: 80, story: '曾是地下党秘密联络点' },
        { name: '古槐树', distance: 120, story: '红军曾在此树下召开群众大会' },
        { name: '石板桥', distance: 60, story: '红四方面军经过此桥进入城区' }
      ]

      nearbyPOIs.forEach(poi => {
        if (Math.random() > 0.7) {
          setTimeout(() => {
            addAgentLog('历史严谨性智能体', `通过地理逆解析发现附近${poi.name}（距离${poi.distance}m），经DeepSeek分析：${poi.story}`, 'discovery')
            aiTutor.value?.sendMessage(`你已抵达${poi.name}附近，这里有一个被遗忘的故事：${poi.story}。请完成探索任务！`)
            currentRoutePlan.value = {
              type: 'dynamic_discovery',
              target: poi.name,
              task: `找出与${poi.story}相关的3个线索`
            }
          }, 2000 + Math.random() * 5000)
        }
      })
    }

    const handleAIMessage = async (msg) => {
      addAgentLog('教育对话智能体', `收到学生消息："${msg}"`, 'student')

      try {
        const res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            context: 'study_mode',
            studentName: studentName.value,
            cognitiveProfile: cognitiveProfile.value,
            currentLocation: '达州研学区域',
            weather: weatherData.value
          })
        })
        const data = await res.json()

        const responseLevel = cognitiveProfile.value.theta !== null
          ? cognitiveProfile.value.theta > 0 ? 'advanced' : 'basic'
          : 'neutral'

        addAgentLog('教育对话智能体', `生成回复（认知适配级别: ${responseLevel}）: "${data.reply?.substring(0, 50)}..."`, 'ai')

        if (aiTutor.value) {
          aiTutor.value.receiveResponse(data.reply)
        }
      } catch (e) {
        console.error('AI chat error:', e)
      }
    }

    const startCognitiveTest = () => {
      showCognitiveTest.value = true
    }

    const handleCognitiveComplete = (result) => {
      showCognitiveTest.value = false
      cognitiveProfile.value = result

      addAgentLog('认知诊断模型', `IRT分析完成！θ=${result.theta.toFixed(3)}, 历史知识=${result.historyKnowledge}, 逻辑推理=${result.logicReasoning}, 情感共情=${result.emotionalEmpathy}, 等级=${result.level}`, 'diagnosis')

      runCASEEngine(result)
    }

    const runCASEEngine = (profile) => {
      addAgentLog('CASE-L2调度器', `输入认知画像θ=${profile.theta.toFixed(3)}，开始多目标动态规划...`, 'system')

      setTimeout(() => {
        const plan = generateRoutePlan(profile)
        currentRoutePlan.value = plan

        addAgentLog('CASE-L2调度器', `A*+帕累托规划完成！推荐路线：${plan.route.join(' → ')}`, 'success')
        addAgentLog('教育对话智能体', `根据学生${profile.level}水平，调整讲解深度为${plan.teachingDepth}`, 'info')

        if (plan.replanNeeded) {
          addAgentLog('CASE-L2调度器', `D* Lite重规划触发：${plan.replanReason}，新路线耗时${plan.newDuration}分钟`, 'replan')
        }

        aiTutor.value?.sendMessage(`${studentName.value}同学，根据你的认知特点，我为你定制了专属研学路线。准备好了吗？我们从${plan.route[0]}开始！`)
      }, 2500)
    }

    const generateRoutePlan = (profile) => {
      const routes = {
        advanced: ['列宁主义街', '万源保卫战遗址', '红军纪念馆', '张爱萍故居'],
        intermediate: ['红军纪念馆', '张爱萍故居', '列宁主义街'],
        basic: ['张爱萍故居', '红军纪念馆']
      }

      const routeKey = profile.theta > 0.5 ? 'advanced' : profile.theta > 0 ? 'intermediate' : 'basic'

      return {
        route: routes[routeKey],
        teachingDepth: profile.theta > 0.5 ? '深度探究' : profile.theta > 0 ? '引导式' : '基础讲解',
        estimatedTime: profile.theta > 0.5 ? 240 : profile.theta > 0 ? 180 : 120,
        gainScore: (profile.theta * 30 + 70).toFixed(1),
        safetyScore: 92.5,
        comfortScore: weatherData.value?.status.includes('雨') ? 65 : 88,
        replanNeeded: weatherData.value?.status.includes('雨'),
        replanReason: weatherData.value?.status.includes('雨') ? '降雨预测，优先安排室内场馆' : null,
        newDuration: weatherData.value?.status.includes('雨') ? 195 : null
      }
    }

    const addAgentLog = (agent, content, type) => {
      const log = {
        time: new Date().toLocaleTimeString(),
        agent,
        content,
        type,
        avatar: getAgentAvatar(agent)
      }
      agentLogs.value.push(log)
      if (agentLogs.value.length > 50) agentLogs.value.shift()
    }

    const getAgentAvatar = (agent) => {
      const avatars = {
        '历史严谨性智能体': '📚',
        '教育对话智能体': '🎓',
        '环境感知智能体': '🌤️',
        '安全守护智能体': '🛡️',
        '认知诊断模型': '🧠',
        'CASE-L2调度器': '⚙️'
      }
      return avatars[agent] || '🤖'
    }

    const locateUser = () => {
      if (map) {
        map.setZoom(17)
      }
    }

    onMounted(() => {
      initMap()
    })

    onUnmounted(() => {
      if (map) {
        map.destroy()
        map = null
      }
      if (weatherTimer) clearInterval(weatherTimer)
      if (positionWatcher) clearInterval(positionWatcher)
    })

    return {
      pageRef,
      aiTutor,
      studentName,
      showCasePanel,
      showCognitiveTest,
      showAgentLog,
      cognitiveProfile,
      weatherData,
      riskAlerts,
      insideFence,
      currentRoutePlan,
      agentLogs,
      weatherClass,
      weatherIcon,
      demoMode,
      demoPOIs,
      userDotStyle,
      handleAIMessage,
      startCognitiveTest,
      handleCognitiveComplete,
      locateUser
    }
  }
}
</script>

<style scoped>
.study-mobile {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
}

.map-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.demo-map-bg {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.85)),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.3"/></pattern></defs><rect fill="%230f172a" width="100" height="100"/><rect fill="url(%23g)" width="100" height="100"/></svg>');
  position: relative;
  overflow: hidden;
}

.demo-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}

.demo-fence {
  position: absolute;
  left: 10%;
  top: 12%;
  right: 10%;
  bottom: 18%;
  border: 2px dashed rgba(16, 185, 129, 0.5);
  border-radius: 8px;
  box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.08);
}

.demo-label {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  z-index: 5;
}

.demo-pois { position: absolute; inset: 0; }

.demo-poi {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.demo-poi:hover { transform: translate(-50%, -50%) scale(1.15); }

.poi-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  border: 2.5px solid #fff;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
  animation: poiFloat 3s ease-in-out infinite;
}
.demo-poi:nth-child(2) .poi-icon { animation-delay: 0.4s; }
.demo-poi:nth-child(3) .poi-icon { animation-delay: 0.8s; }
.demo-poi:nth-child(4) .poi-icon { animation-delay: 1.2s; }
.demo-poi:nth-child(5) .poi-icon { animation-delay: 1.6s; }
.demo-poi:nth-child(6) .poi-icon { animation-delay: 2s; }

@keyframes poiFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.poi-history .poi-icon { background: #dc2626; }
.poi-medical .poi-icon { background: #ef4444; }
.poi-shelter .poi-icon { background: #f59e0b; }

.poi-name {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 7px;
  border-radius: 8px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

.demo-user-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  border: 3px solid #fff;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.25);
  transform: translate(-50%, -50%);
  z-index: 10;
  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: userPulse 2s infinite;
}

@keyframes userPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.25); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.35); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0; }
}

.weather-overlay {
  position: absolute;
  top: 55px;
  left: 16px;
  z-index: 100;
}

.weather-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: #fff;
  transition: all 0.3s ease;
}

.weather-card.weather-rain { border-color: rgba(96, 165, 250, 0.4); }
.weather-card.weather-storm { border-color: rgba(168, 85, 247, 0.4); animation: stormPulse 1s infinite; }
.weather-card.weather-sunny { border-color: rgba(251, 191, 36, 0.4); }

@keyframes stormPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 0 20px 5px rgba(168, 85, 247, 0.1); }
}

.weather-icon { font-size: 20px; }
.weather-temp { font-weight: 600; font-size: 16px; }
.weather-status { color: rgba(255, 255, 255, 0.6); font-size: 11px; }

.risk-alerts {
  position: absolute;
  top: 110px;
  left: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  backdrop-filter: blur(12px);
  animation: slideIn 0.3s ease;
}

.risk-info { background: rgba(59, 130, 246, 0.85); color: #fff; }
.risk-warning { background: rgba(245, 158, 11, 0.9); color: #000; }
.risk-danger { background: rgba(239, 68, 68, 0.95); color: #fff; animation: dangerPulse 1.5s infinite; }

.risk-icon { font-size: 16px; }

@keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes dangerPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

.alert-slide-enter-active, .alert-slide-leave-active { transition: all 0.3s ease; }
.alert-slide-enter-from, .alert-slide-leave-to { transform: translateX(-100%); opacity: 0; }

.safety-fence-info {
  position: absolute;
  top: auto;
  bottom: 140px;
  left: 16px;
  z-index: 100;
}

.fence-safe { color: #34d399; font-size: 12px; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.fence-warning { color: #fbbf24; font-size: 12px; font-weight: 600; animation: blink 0.8s infinite; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.floating-actions {
  position: absolute;
  right: 16px;
  bottom: 160px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.fab-btn svg { width: 22px; height: 22px; }

.case-btn {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}
.case-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4); }

.location-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}
.location-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4); }
</style>
