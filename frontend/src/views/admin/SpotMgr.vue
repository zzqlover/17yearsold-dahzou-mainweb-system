<template>
  <div class="spot-manage">
    <div class="page-actions">
      <button class="btn-primary" @click="openDialog()">
        ➕ 添加景点
      </button>
    </div>

    <el-table :data="spots" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="名称" width="200" />
      <el-table-column prop="location" label="位置" width="180" />
      <el-table-column prop="rating" label="评分" width="100">
        <template #default="scope">
          ⭐ {{ scope.row.rating }}
        </template>
      </el-table-column>
      <el-table-column prop="ticket_info" label="门票" />
      <el-table-column label="封面" width="120">
        <template #default="scope">
          <img :src="scope.row.cover_image" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑景点' : '添加景点'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="景点名称">
          <el-input v-model="form.title" placeholder="请输入景点名称" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="详细介绍">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入详细介绍" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="form.cover_image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="form.opening_hours" placeholder="请输入开放时间" />
        </el-form-item>
        <el-form-item label="门票信息">
          <el-input v-model="form.ticket_info" placeholder="请输入门票信息" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input-number v-model="form.rating" :min="0" :max="5" :step="0.1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { spotAPI } from '../../api'

export default {
  name: 'SpotManage',
  setup() {
    const spots = ref([])
    const loading = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const form = ref({
      id: null,
      title: '',
      description: '',
      content: '',
      cover_image: '',
      location: '',
      rating: 5.0,
      opening_hours: '',
      ticket_info: ''
    })

    const apiBase = 'http://localhost:5000'

    const loadSpots = async () => {
      loading.value = true
      try {
        const res = await spotAPI.getSpots()
        spots.value = (res.data || []).map(item => ({
          ...item,
          image: item.image?.startsWith('http') ? item.image : apiBase + item.image
        }))
      } catch (error) {
        ElMessage.error('加载景点失败')
      } finally {
        loading.value = false
      }
    }

    const openDialog = (row = null) => {
      if (row) {
        isEdit.value = true
        form.value = { ...row }
      } else {
        isEdit.value = false
        form.value = {
          id: null,
          title: '',
          description: '',
          content: '',
          cover_image: '',
          location: '',
          rating: 5.0,
          opening_hours: '',
          ticket_info: ''
        }
      }
      dialogVisible.value = true
    }

    const handleSave = async () => {
      try {
        if (isEdit.value) {
          await spotAPI.updateSpot(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await spotAPI.createSpot(form.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadSpots()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error(error.response?.data?.error || '保存失败')
      }
    }

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个景点吗？', '提示', {
          type: 'warning'
        })
        await spotAPI.deleteSpot(id)
        ElMessage.success('删除成功')
        loadSpots()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    onMounted(() => {
      loadSpots()
    })

    return {
      spots,
      loading,
      dialogVisible,
      isEdit,
      form,
      openDialog,
      handleSave,
      handleDelete
    }
  }
}
</script>

<style scoped>
.spot-manage {
  background-color: var(--color-warm-white);
  padding: 30px;
  border-radius: var(--radius-medium);
}

.page-actions {
  margin-bottom: 20px;
}

.el-table {
  border-radius: var(--radius-small);
}
</style>
