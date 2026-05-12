<template>
  <div class="slide-manage">
    <div class="page-actions">
      <button class="btn-primary" @click="openDialog()">
        ➕ 添加轮播图
      </button>
    </div>

    <el-table :data="slides" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="sort_order" label="排序" width="100" />
      <el-table-column prop="is_active" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'">
            {{ scope.row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="200">
        <template #default="scope">
          <img :src="scope.row.image_url" style="width: 160px; height: 80px; object-fit: cover; border-radius: 4px;" />
        </template>
      </el-table-column>
      <el-table-column prop="link_url" label="链接" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑轮播图' : '添加轮播图'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="form.image_url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.link_url" placeholder="请输入跳转链接，如 /spots/1" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.is_active" />
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
import { slideAPI } from '../../api'

export default {
  name: 'SlideManage',
  setup() {
    const slides = ref([])
    const loading = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const form = ref({
      id: null,
      title: '',
      image_url: '',
      link_url: '',
      sort_order: 0,
      is_active: true
    })

    const loadSlides = async () => {
      loading.value = true
      try {
        const res = await slideAPI.getAllSlides()
        slides.value = res.data || []
      } catch (error) {
        ElMessage.error('加载轮播图失败')
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
          image_url: '',
          link_url: '',
          sort_order: 0,
          is_active: true
        }
      }
      dialogVisible.value = true
    }

    const handleSave = async () => {
      try {
        if (isEdit.value) {
          await slideAPI.updateSlide(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await slideAPI.createSlide(form.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadSlides()
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个轮播图吗？', '提示', {
          type: 'warning'
        })
        await slideAPI.deleteSlide(id)
        ElMessage.success('删除成功')
        loadSlides()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    onMounted(() => {
      loadSlides()
    })
    return {
      slides,
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
.slide-manage {
  background-color: var(--color-warm-white);
  padding: 30px;
  border-radius: var(--radius-medium);
}

.page-actions {
  margin-bottom: 20px;
}
</style>
