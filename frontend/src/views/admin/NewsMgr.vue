<template>
  <div class="news-manage">
    <div class="page-actions">
      <button class="btn-primary" @click="openDialog()">
        ➕ 发布新闻
      </button>
    </div>

    <el-table :data="news" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" width="250" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="view_count" label="阅读量" width="100" />
      <el-table-column prop="created_at" label="发布时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑新闻' : '发布新闻'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入新闻标题" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入新闻内容" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="form.cover_image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" placeholder="请输入作者" />
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
import { newsAPI } from '../../api'

export default {
  name: 'NewsManage',
  setup() {
    const news = ref([])
    const loading = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const form = ref({
      id: null,
      title: '',
      summary: '',
      content: '',
      cover_image: '',
      author: '景区管理处'
    })

    const loadNews = async () => {
      loading.value = true
      try {
        const res = await newsAPI.getNews({ page: 1, page_size: 100 })
        news.value = res.data || []
      } catch (error) {
        ElMessage.error('加载新闻失败')
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
          summary: '',
          content: '',
          cover_image: '',
          author: '景区管理处'
        }
      }
      dialogVisible.value = true
    }

    const handleSave = async () => {
      try {
        if (isEdit.value) {
          await newsAPI.updateNews(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await newsAPI.createNews(form.value)
          ElMessage.success('发布成功')
        }
        dialogVisible.value = false
        loadNews()
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这条新闻吗？', '提示', {
          type: 'warning'
        })
        await newsAPI.deleteNews(id)
        ElMessage.success('删除成功')
        loadNews()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }

    onMounted(() => {
      loadNews()
    })

    return {
      news,
      loading,
      dialogVisible,
      isEdit,
      form,
      openDialog,
      handleSave,
      handleDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.news-manage {
  background-color: var(--color-warm-white);
  padding: 30px;
  border-radius: var(--radius-medium);
}

.page-actions {
  margin-bottom: 20px;
}
</style>
