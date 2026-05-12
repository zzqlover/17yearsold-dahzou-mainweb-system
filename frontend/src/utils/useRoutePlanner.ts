/**
 * 可复用的路线规划逻辑 - useRoutePlanner
 * 双保险：AMap.Driving JS API + 高德 REST API JSONP
 */

import { ref, reactive } from 'vue'

// 高德 Web API Key (REST API)
const AMAP_REST_KEY = '237899eb426ba9fed3d09e408121065f'

/**
 * 路线规划 Hook
 * @param {any} mapInstance - 高德地图实例
 * @returns {Object} 包含 currentPolyline, planRoute, clearRoute, routeInfo
 */
export function useRoutePlanner(mapInstance) {
  // 当前路线 Polyline
  const currentPolyline = ref(null)

  // 路线信息
  const routeInfo = reactive({
    distance: 0,  // 公里
    duration: 0   // 分钟
  })

  // Driving 实例缓存
  let drivingInstance = null

  /**
   * 内部函数：绘制路线
   * @param {Array} pathArray - 路径点数组 [[lng, lat], ...]
   */
  function drawPath(pathArray) {
    if (!mapInstance || !pathArray || pathArray.length === 0) {
      console.error('[useRoutePlanner] 绘制失败：参数无效')
      return
    }

    console.log('[useRoutePlanner] 绘制路线，点数:', pathArray.length)

    // 移除旧路线
    if (currentPolyline.value) {
      currentPolyline.value.setMap(null)
      currentPolyline.value = null
    }

    // 创建新 Polyline
    const polyline = new AMap.Polyline({
      map: mapInstance,
      path: pathArray,
      strokeColor: '#3498DB',
      strokeWeight: 6,
      strokeOpacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    })

    currentPolyline.value = polyline

    // 自适应视野
    mapInstance.setFitView(polyline)

    console.log('[useRoutePlanner] 路线绘制完成')
  }

  /**
   * 内部函数：解析 polyline 字符串为坐标数组
   * @param {string} polylineStr - 格式："lng,lat;lng,lat;..."
   * @returns {Array} [[lng, lat], ...]
   */
  function parsePolyline(polylineStr) {
    if (!polylineStr) return []

    const points = polylineStr.split(';')
    const result = []

    points.forEach(point => {
      const [lng, lat] = point.split(',').map(Number)
      if (!isNaN(lng) && !isNaN(lat)) {
        result.push([lng, lat])
      }
    })

    return result
  }

  /**
   * 保险B：高德 REST API 驾车规划（JSONP）
   * @param {number} originLng - 起点经度
   * @param {number} originLat - 起点纬度
   * @param {number} destLng - 终点经度
   * @param {number} destLat - 终点纬度
   * @returns {Promise} Promise resolve 带路径数据
   */
  function fetchRouteFromRESTAPI(originLng, originLat, destLng, destLat) {
    return new Promise((resolve, reject) => {
      console.log('[useRoutePlanner] 启用保险B：REST API')

      const callbackName = `AMap_Route_Callback_${Date.now()}`
      const url = `https://restapi.amap.com/v3/direction/driving?origin=${originLng},${originLat}&destination=${destLng},${destLat}&output=json&key=${AMAP_REST_KEY}`

      // 设置超时
      const timeout = setTimeout(() => {
        delete window[callbackName]
        reject(new Error('REST API 请求超时'))
      }, 5000)

      // 全局回调函数
      window[callbackName] = (data) => {
        clearTimeout(timeout)
        delete window[callbackName]
        document.body.removeChild(script)

        if (data && data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
          const pathData = data.route.paths[0]

          // 提取完整路径
          const fullPath = []
          if (pathData.steps) {
            pathData.steps.forEach(step => {
              if (step.polyline) {
                fullPath.push(...parsePolyline(step.polyline))
              }
            })
          }

          resolve({
            path: fullPath,
            distance: parseInt(pathData.distance) || 0,
            duration: parseInt(pathData.time) || 0
          })
        } else {
          reject(new Error('REST API 返回数据无效'))
        }
      }

      // 创建 JSONP script 标签
      const script = document.createElement('script')
      script.src = `${url}&callback=${callbackName}`
      script.onerror = () => {
        clearTimeout(timeout)
        delete window[callbackName]
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
        reject(new Error('REST API 请求失败'))
      }
      document.body.appendChild(script)
    })
  }

  /**
   * 清除路线
   */
  function clearRoute() {
    if (currentPolyline.value) {
      currentPolyline.value.setMap(null)
      currentPolyline.value = null
    }
    if (drivingInstance) {
      drivingInstance.clear()
    }
    routeInfo.distance = 0
    routeInfo.duration = 0
    console.log('[useRoutePlanner] 路线已清除')
  }

  /**
   * 规划路线（主函数）
   * @param {number} originLng - 起点经度
   * @param {number} originLat - 起点纬度
   * @param {number} destLng - 终点经度
   * @param {number} destLat - 终点纬度
   * @returns {Promise}
   */
  async function planRoute(originLng, originLat, destLng, destLat) {
    console.log('[useRoutePlanner] ========== 开始路线规划 ==========')
    console.log('[useRoutePlanner] 起点:', originLng, originLat)
    console.log('[useRoutePlanner] 终点:', destLng, destLat)

    // 参数验证
    if (!mapInstance) {
      console.error('[useRoutePlanner] 地图实例无效')
      return Promise.reject(new Error('地图实例无效'))
    }

    if (!originLng || !originLat || !destLng || !destLat) {
      console.error('[useRoutePlanner] 坐标参数无效')
      return Promise.reject(new Error('坐标参数无效'))
    }

    // 清除旧路线
    clearRoute()

    // ===== 保险A：AMap.Driving JS API =====
    try {
      console.log('[useRoutePlanner] 尝试保险A：AMap.Driving')

      // 确保 Driving 插件已加载
      if (!AMap.Driving) {
        await new Promise((resolve, reject) => {
          AMap.plugin('AMap.Driving', (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      }

      // 创建或复用 Driving 实例
      if (!drivingInstance) {
        drivingInstance = new AMap.Driving({
          map: mapInstance,
          showTraffic: false,
          policy: AMap.DrivingPolicy.LEAST_TIME
        })
      }

      // 调用路线规划
      const result = await new Promise((resolve, reject) => {
        const origin = new AMap.LngLat(originLng, originLat)
        const destination = new AMap.LngLat(destLng, destLat)

        drivingInstance.search(origin, destination, (status, result) => {
          if (status === 'complete' && result && result.routes && result.routes.length > 0) {
            resolve(result)
          } else {
            reject(new Error(`Driving 失败: ${status}`))
          }
        })
      })

      // 提取路径数据
      const route = result.routes[0]
      const fullPath = []

      if (route.steps) {
        route.steps.forEach(step => {
          if (step.path && Array.isArray(step.path)) {
            fullPath.push(...step.path)
          }
        })
      }

      if (fullPath.length === 0) {
        throw new Error('路径点为空')
      }

      // 更新路线信息
      routeInfo.distance = route.distance / 1000  // 米转公里
      routeInfo.duration = Math.round(route.time / 60)  // 秒转分钟

      // 绘制路线
      drawPath(fullPath)

      console.log('[useRoutePlanner] ========== 保险A成功 ==========')
      return Promise.resolve()

    } catch (errorA) {
      console.error('[useRoutePlanner] 保险A失败:', errorA.message)

      // ===== 保险B：高德 REST API =====
      try {
        const restResult = await fetchRouteFromRESTAPI(originLng, originLat, destLng, destLat)

        if (restResult.path.length === 0) {
          throw new Error('REST API 路径点为空')
        }

        // 更新路线信息
        routeInfo.distance = restResult.distance / 1000
        routeInfo.duration = Math.round(restResult.duration / 60)

        // 绘制路线
        drawPath(restResult.path)

        console.log('[useRoutePlanner] ========== 保险B成功 ==========')
        return Promise.resolve()

      } catch (errorB) {
        console.error('[useRoutePlanner] 保险B也失败:', errorB.message)
        console.error('[useRoutePlanner] ========== 两种方案均失败 ==========')
        return Promise.reject(new Error('路线规划失败，请检查网络'))
      }
    }
  }

  // 返回公共接口
  return {
    currentPolyline,
    routeInfo,
    planRoute,
    clearRoute
  }
}
