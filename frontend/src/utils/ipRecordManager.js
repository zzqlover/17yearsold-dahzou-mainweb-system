const IP_RECORD_KEY = 'ip_security_records'

export const ipRecordManager = {
  getClientIP() {
    return new Promise((resolve) => {
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => resolve(data.ip))
        .catch(() => {
          const stored = localStorage.getItem('client_ip_fallback') || '127.0.0.1'
          resolve(stored)
        })
    })
  },

  getRecords() {
    try {
      const data = localStorage.getItem(IP_RECORD_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveRecords(records) {
    localStorage.setItem(IP_RECORD_KEY, JSON.stringify(records))
  },

  addRecord(ip, reason = '登录失败超过5次') {
    const records = this.getRecords()
    const existing = records.find(r => r.ip === ip)

    if (existing) {
      existing.fail_count++
      existing.last_time = new Date().toISOString()
      existing.reason = reason
    } else {
      records.push({
        id: Date.now(),
        ip: ip,
        fail_count: 1,
        reason: reason,
        first_time: new Date().toISOString(),
        last_time: new Date().toISOString(),
        blocked: false
      })
    }

    this.saveRecords(records)
    return records
  },

  removeRecord(ip) {
    const records = this.getRecords()
    const filtered = records.filter(r => r.ip !== ip)
    this.saveRecords(filtered)
    return filtered
  },

  clearAllRecords() {
    localStorage.removeItem(IP_RECORD_KEY)
    return []
  },

  blockIP(ip) {
    const records = this.getRecords()
    const record = records.find(r => r.ip === ip)
    if (record) {
      record.blocked = true
      this.saveRecords(records)
    }
    return records
  },

  unblockIP(ip) {
    const records = this.getRecords()
    const record = records.find(r => r.ip === ip)
    if (record) {
      record.blocked = false
      this.saveRecords(records)
    }
    return records
  },

  isBlocked(ip) {
    const records = this.getRecords()
    const record = records.find(r => r.ip === ip)
    return record && record.blocked
  },

  getRecordByIP(ip) {
    const records = this.getRecords()
    return records.find(r => r.ip === ip) || null
  }
}

window.ipRecordManager = ipRecordManager

export default ipRecordManager