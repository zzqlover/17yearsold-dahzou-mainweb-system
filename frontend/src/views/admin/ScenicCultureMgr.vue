<template>
  <div class="culture-manage">
    <div class="page-header">
      <h1>景色文化管理</h1>
      <button class="add-btn" @click="openAdd">添加景点</button>
    </div>

    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div class="items-grid" v-else>
      <div class="item-card" v-for="item in items" :key="item.id">
        <div class="item-image">
          <img :src="item.image" :alt="item.title" />
        </div>
        <div class="item-info">
          <h3>{{ item.title }}</h3>
          <p class="location">{{ item.location }}</p>
          <p class="desc">{{ item.description }}</p>
        </div>
        <div class="item-actions">
          <button class="edit-btn" @click="openEdit(item)">编辑</button>
          <button class="delete-btn" @click="handleDelete(item.id)">删除</button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="items.length === 0">
      <p>暂无数据</p>
    </div>

    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <h2>{{ editingId ? '编辑景点' : '添加景点' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="form.title" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" required></textarea>
          </div>
          <div class="form-group">
            <label>位置</label>
            <input type="text" v-model="form.location" required />
          </div>
          <div class="form-group">
            <label>图片路径</label>
            <input type="text" v-model="form.image" placeholder="/images/xxx.jpg" />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div class="error-toast" v-if="error">{{ error }}</div>
    <div class="success-toast" v-if="success">{{ success }}</div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 30000
})

const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/admin',
  timeout: 30000
})

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  name: 'ScenicCultureManage',
  setup() {
    const items = ref([])
    const showModal = ref(false)
    const editingId = ref(null)
    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    const form = reactive({ title: '', description: '', location: '', image: '' })

    const showToast = (msg, type = 'error') => {
      error.value = type === 'error' ? msg : ''
      success.value = type === 'success' ? msg : ''
      setTimeout(() => { error.value = ''; success.value = '' }, 3000)
    }

    const fetchItems = async () => {
      loading.value = true
      try {
        const res = await publicApi.get('/culture/scenic')
        const apiBase = 'http://localhost:5000'
        const fetchedItems = res.data?.items || []
        items.value = fetchedItems.map(item => ({
          ...item,
          image: item.image?.startsWith('http') ? item.image : apiBase + item.image
        }))
      } catch (e) {
        console.error(e)
        showToast('获取数据失败')
      } finally {
        loading.value = false
      }
    }

    const openAdd = () => {
      editingId.value = null
      Object.assign(form, { title: '', description: '', location: '', image: '' })
      showModal.value = true
    }

    const openEdit = (item) => {
      editingId.value = item.id
      Object.assign(form, { ...item })
      showModal.value = true
    }

    const closeModal = () => { showModal.value = false; editingId.value = null }

    const handleSubmit = async () => {
      try {
        if (editingId.value) {
          await adminApi.put(`/culture/scenic/${editingId.value}`, form)
        } else {
          await adminApi.post('/culture/scenic', form)
        }
        showToast('保存成功', 'success')
        closeModal()
        fetchItems()
      } catch (e) {
        console.error(e)
        showToast(e.response?.data?.error || '保存失败')
      }
    }

    const handleDelete = async (id) => {
      if (!confirm('确定要删除吗？')) return
      try {
        await adminApi.delete(`/culture/scenic/${id}`)
        showToast('删除成功', 'success')
        fetchItems()
      } catch (e) {
        console.error(e)
        showToast('删除失败')
      }
    }

    onMounted(() => { fetchItems() })
    return { items, showModal, editingId, form, error, success, loading, openAdd, openEdit, closeModal, handleSubmit, handleDelete }
  }
}
</script>

<style scoped>
.culture-manage { max-width: 1200px; position: relative; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #1a1a1a; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #666; }
.loading-state p { margin-top: 16px; font-size: 14px; }
.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #2d4a3a; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.add-btn { padding: 10px 20px; background: linear-gradient(135deg, #2d4a3a, #4a6b5a); color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.item-card { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.item-image { height: 160px; overflow: hidden; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-info { padding: 16px; }
.item-info h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: #1a1a1a; }
.location { font-size: 12px; color: #888; margin: 4px 0; }
.desc { font-size: 13px; color: #666; line-height: 1.5; margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.edit-btn, .delete-btn { flex: 1; padding: 8px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; }
.edit-btn { background: #f5f5f5; color: #333; }
.delete-btn { background: #fff0f0; color: #c41e3a; }
.empty-state { text-align: center; padding: 60px; color: #999; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #fff; padding: 24px; border-radius: 8px; width: 90%; max-width: 450px; }
.modal-content h2 { margin: 0 0 20px; font-size: 16px; color: #1a1a1a; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 4px; font-size: 13px; color: #333; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group textarea { min-height: 80px; resize: vertical; }
.form-actions { display: flex; gap: 10px; margin-top: 20px; }
.cancel-btn, .submit-btn { flex: 1; padding: 10px; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; }
.cancel-btn { background: #f5f5f5; color: #333; }
.submit-btn { background: linear-gradient(135deg, #2d4a3a, #4a6b5a); color: #fff; }
.error-toast, .success-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; font-size: 14px; z-index: 2000; animation: slideIn 0.3s ease; }
.error-toast { background: #c41e3a; color: #fff; }
.success-toast { background: #2d4a3a; color: #fff; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
</style>
