<template>
  <div class="contact">
    <div class="page-header">
      <h1>联系我们</h1>
      <p>期待您的来访</p>
    </div>

    <section class="contact-content">
      <div class="container">
        <div class="contact-grid">
          <ParallaxSection>
            <div class="contact-info">
              <h2>联系方式</h2>

              <div class="info-item">
                <div class="info-icon">◈</div>
                <div class="info-text">
                  <h3>地址</h3>
                  <p>四川省达州市通川区莲花湖路1号</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">TEL</div>
                <div class="info-text">
                  <h3>电话</h3>
                  <p>0818-1234567</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">@</div>
                <div class="info-text">
                  <h3>邮箱</h3>
                  <p>info@lotus-lake.cn</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">◑</div>
                <div class="info-text">
                  <h3>开放时间</h3>
                  <p>全天开放（部分项目除外）</p>
                </div>
              </div>
            </div>
          </ParallaxSection>

          <ParallaxSection :delay="100">
            <div class="contact-form">
              <h2>在线咨询</h2>
              <el-form :model="form" label-position="top">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" placeholder="请输入您的姓名" />
                </el-form-item>
                <el-form-item label="电话">
                  <el-input v-model="form.phone" placeholder="请输入您的电话" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入您的邮箱" />
                </el-form-item>
                <el-form-item label="咨询内容">
                  <el-input
                    v-model="form.content"
                    type="textarea"
                    :rows="5"
                    placeholder="请输入您想咨询的内容"
                  />
                </el-form-item>
                <el-form-item>
                  <button type="button" class="btn-primary" @click="submitForm">
                    提交咨询
                  </button>
                </el-form-item>
              </el-form>
            </div>
          </ParallaxSection>
        </div>

        <ParallaxSection :delay="200">
          <div class="map-section">
            <h2>景区位置</h2>
            <div class="map-placeholder">
              <p> 四川省达州市生态莲花湖湿地公园</p>
            </div>
          </div>
        </ParallaxSection>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ParallaxSection from '../components/ParallaxSection.vue'

export default {
  name: 'Contact',
  components: { ParallaxSection },
  setup() {
    const form = ref({
      name: '',
      phone: '',
      email: '',
      content: ''
    })

    const submitForm = () => {
      if (!form.value.name || !form.value.content) {
        ElMessage.warning('请填写必填项')
        return
      }
      ElMessage.success('提交成功，我们会尽快联系您')
      form.value = {
        name: '',
        phone: '',
        email: '',
        content: ''
      }
    }

    return {
      form,
      submitForm
    }
  }
}
</script>

<style scoped>
.contact {
  min-height: 100vh;
}

.contact-content {
  padding: 60px 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
}

.contact-info,
.contact-form {
  background-color: var(--color-warm-white);
  padding: 40px;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
}

.contact-info h2,
.contact-form h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.info-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent-green), var(--color-accent-red));
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.info-text h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.info-text p {
  color: var(--color-text-secondary);
}

.map-section {
  margin-top: 60px;
}

.map-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
}

.map-placeholder {
  background-color: var(--color-warm-white);
  height: 400px;
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-light);
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
