<template>
  <div class="image2-container">
    <div class="editor-panel">
      <h2>🖼️ OpenAI gpt-image-2 生图</h2>
      <div class="subtitle">输入提示词，利用最新 gpt-image-2 异步接口生成图片（请注意数据保留7天）</div>
      
      <div class="form-group">
        <label>提示词 (Prompt):</label>
        <textarea v-model="prompt" placeholder="请输入你要生成图片的提示词..." rows="4"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>分辨率:</label>
          <select v-model="resolution">
            <option value="1k">1k</option>
            <option value="2k">2k</option>
            <option value="4k">4k</option>
          </select>
        </div>
        <div class="form-group">
          <label>图片比例:</label>
          <select v-model="size">
            <option value="1:1">1:1</option>
            <option value="3:2">3:2</option>
            <option value="2:3">2:3</option>
            <option value="4:3">4:3</option>
            <option value="3:4">3:4</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
          </select>
        </div>
        <div class="form-group">
          <label>生成数量:</label>
          <select v-model="n">
            <option value="1">1张</option>
            <option value="2">2张</option>
            <option value="3">3张</option>
            <option value="4">4张</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn primary" @click="generateImage" :disabled="isLoading">
          {{ isLoading ? '生成中...' : '🚀 开始生成' }}
        </button>
      </div>

      <div v-if="taskStatus" class="task-status">
        {{ taskStatus }}
      </div>
    </div>
    
    <div class="preview-panel">
      <div class="result-area">
        <div v-if="images.length === 0 && !isLoading" class="empty-text">
          这里将展示生成的图片
        </div>
        <div v-else-if="isLoading" class="loading-wrapper">
          <div class="loader"></div>
          <p>正在生成中，请耐心等待 (异步任务)...</p>
        </div>
        <div v-else class="image-grid">
          <div v-for="(url, idx) in images" :key="idx" class="image-item">
            <img :src="url" alt="Generated Image" />
            <a :href="url" target="_blank" class="download-link">🔗 查看大图/下载</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Token Modal -->
    <div v-if="showTokenModal" class="modal-overlay">
      <div class="modal-content">
        <h3>🔑 设置 ALAPI Token</h3>
        <p>需要提供 ALAPI Token 才能调用生图接口。</p>
        <input v-model="tempToken" type="text" placeholder="输入 Token" />
        <div class="modal-actions">
          <button @click="showTokenModal = false">取消</button>
          <button class="primary" @click="saveToken">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Message } from '@/components/Message/index'

const prompt = ref('')
const resolution = ref('1k')
const size = ref('1:1')
const n = ref('1')
const isLoading = ref(false)
const taskStatus = ref('')
const images = ref<string[]>([])

const showTokenModal = ref(false)
const alapiToken = ref('')
const tempToken = ref('')

let pollTimer: number | null = null

onMounted(() => {
  alapiToken.value = localStorage.getItem('alapi-token') || ''
})

onUnmounted(() => {
  if (pollTimer !== null) {
    clearTimeout(pollTimer)
  }
})

const saveToken = () => {
  if (!tempToken.value.trim()) {
    Message.warning('Token 不能为空')
    return
  }
  alapiToken.value = tempToken.value.trim()
  localStorage.setItem('alapi-token', alapiToken.value)
  showTokenModal.value = false
  Message.success('Token 保存成功')
}

const generateImage = async () => {
  if (!prompt.value.trim()) {
    Message.warning('请输入提示词')
    return
  }
  if (!alapiToken.value) {
    tempToken.value = ''
    showTokenModal.value = true
    return
  }

  isLoading.value = true
  taskStatus.value = '提交任务中...'
  images.value = []

  try {
    const formData = new FormData()
    formData.append('token', alapiToken.value)
    formData.append('model', 'gpt-image-2')
    formData.append('prompt', prompt.value)
    formData.append('n', n.value)
    formData.append('size', size.value)
    formData.append('resolution', resolution.value)

    const res = await fetch('https://v3.alapi.cn/api/ai/images/generations_sync', {
      method: 'POST',
      body: formData
    })
    
    const data = await res.json()
    if (data.code === 200 && data.success) {
      const taskId = data.data.task_id
      taskStatus.value = `任务提交成功，任务ID: ${taskId}，排队中...`
      pollTaskResult(taskId)
    } else {
      throw new Error(data.message || '请求失败')
    }
  } catch (error: any) {
    console.error('生图错误:', error)
    Message.error(error.message || '网络错误，请稍后重试')
    isLoading.value = false
    taskStatus.value = '提交失败'
  }
}

const pollTaskResult = (taskId: string) => {
  let retryCount = 0
  const maxRetries = 60 // 最多轮询60次，每次3秒，大约3分钟

  const checkStatus = async () => {
    try {
      const res = await fetch(`https://v3.alapi.cn/api/ai/images/generations/task?token=${alapiToken.value}&task_id=${taskId}`)
      const data = await res.json()

      if (data.code === 200 && data.success) {
        const status = data.data.status
        taskStatus.value = `当前任务状态: ${status}`
        
        if (status === 'success') {
          images.value = data.data.data.map((item: any) => item.url)
          isLoading.value = false
          Message.success('生成成功！(数据只保留7天，请及时下载)')
          return
        } else if (status === 'failed' || status === 'error') {
          throw new Error('任务处理失败')
        }
        
        retryCount++
        if (retryCount >= maxRetries) {
          throw new Error('任务处理超时，请稍后重试')
        }
        pollTimer = window.setTimeout(checkStatus, 3000)
      } else {
        throw new Error(data.message || '查询任务失败')
      }
    } catch (error: any) {
      console.error('轮询错误:', error)
      Message.error(error.message || '查询失败')
      isLoading.value = false
      taskStatus.value = '任务中止'
    }
  }

  pollTimer = window.setTimeout(checkStatus, 3000)
}
</script>

<style scoped>
.image2-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: #f1f2f5;
}

.editor-panel {
  flex: 1;
  background: white;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebedf0;
  max-width: 450px;
}

.editor-panel h2 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 24px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group textarea,
.form-group select,
.form-group input {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.form-group textarea:focus,
.form-group select:focus,
.form-group input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
}

.form-row {
  display: flex;
  gap: 16px;
}
.form-row .form-group {
  flex: 1;
}

.actions {
  margin-top: 10px;
}

.action-btn {
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  width: 100%;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.action-btn.primary {
  background: #1890ff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.task-status {
  margin-top: 16px;
  padding: 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 14px;
}

/* 预览区 */
.preview-panel {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #f8f9fa;
  overflow-y: auto;
}

.result-area {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: auto;
}

.empty-text {
  color: #999;
  font-size: 16px;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #1890ff;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.image-item img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  object-fit: contain;
}

.download-link {
  margin-top: 12px;
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.download-link:hover {
  text-decoration: underline;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-content h3 {
  margin: 0 0 10px 0;
}

.modal-content input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin: 20px 0;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions button {
  padding: 8px 20px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.modal-actions button.primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

@media (max-width: 768px) {
  .image2-container {
    flex-direction: column;
  }
  .editor-panel {
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid #ebedf0;
  }
}
</style>
