<template>
  <div class="image2-container">
    <div class="editor-panel">
      <h2>🖼️ OpenAI gpt-image-2 生图</h2>
      <div class="subtitle">输入提示词，利用最新 gpt-image-2 异步接口生成图片（请注意数据保留7天）</div>
      
      <div class="form-group prompt-group">
        <div class="prompt-header">
          <label>提示词 (Prompt):</label>
          <button class="gallery-btn" @click="openGallery">💡 灵感图库</button>
        </div>
        <textarea v-model="prompt" placeholder="请输入你要生成图片的提示词..." rows="4"></textarea>
      </div>

      <div class="form-group prompt-group">
        <label>参考图 (可选) <span class="hint">最多上传 16 张</span></label>
        <div class="upload-list">
          <div v-for="(img, idx) in referenceImages" :key="idx" class="upload-item">
            <img :src="img.preview" />
            <button class="remove-btn" @click.stop="removeReferenceImage(idx)">×</button>
            <div v-if="img.status === 'uploading'" class="upload-mask">上传中</div>
            <div v-else-if="img.status === 'error'" class="upload-mask error-mask" :title="img.errorMessage">上传失败</div>
          </div>
          <div class="upload-item upload-btn" @click="triggerUpload" v-if="referenceImages.length < 16">
            <span class="plus">+</span>
            <span>上传图片</span>
          </div>
          <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/png, image/jpeg, image/webp" multiple hidden />
        </div>
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
        <button class="action-btn primary" @click="generateImage">
          🚀 开始生成
        </button>
      </div>

      <div v-if="taskStatus" class="task-status">
        {{ taskStatus }}
      </div>
    </div>
    
    <div class="preview-panel">
      <div class="result-area">
        <div class="history-header" v-if="history.length > 0">
          <h3>🖼️ 我的生图画廊</h3>
          <button class="clear-btn" @click="clearHistory">清空</button>
        </div>

        <div v-if="history.length === 0" class="empty-text">
          这里将展示生成的图片
        </div>

        <div v-if="history.length > 0" class="image-grid">
          <div v-for="item in history" :key="item.id" class="image-item" :class="item.status">
            <template v-if="item.status === 'completed'">
              <img :src="item.url" :alt="item.prompt" :title="item.prompt" />
              <a :href="item.url" target="_blank" class="download-link">🔗 查看大图/下载</a>
            </template>
            <template v-else-if="item.status === 'pending'">
              <div class="status-box pending-box">
                <div class="loader-small"></div>
                <span>生成中...</span>
              </div>
              <p class="prompt-preview" :title="item.prompt">{{ item.prompt }}</p>
            </template>
            <template v-else-if="item.status === 'failed'">
              <div class="status-box failed-box">
                <span>❌ {{ item.errorMessage || '生成失败' }}</span>
              </div>
              <p class="prompt-preview" :title="item.prompt">{{ item.prompt }}</p>
              <button class="retry-btn" @click.stop="retryTask(item)">🔄 刷新状态</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Modal -->
    <div v-if="showGalleryModal" class="modal-overlay gallery-overlay" @click.self="showGalleryModal = false">
      <div class="modal-content gallery-modal-content">
        <div class="gallery-header">
          <h3>💡 灵感图库</h3>
          <button class="close-btn" @click="showGalleryModal = false">×</button>
        </div>
        <div class="gallery-body">
          <div v-if="galleryCases.length === 0" class="gallery-loading">
            <div class="loader"></div>
            <p>正在加载图库...</p>
          </div>
          <div v-else>
            <div class="category-filters">
              <button 
                class="category-pill" 
                :class="{ active: selectedCategory === 'All' }" 
                @click="selectedCategory = 'All'"
              >全部</button>
              <button 
                v-for="cat in categories" 
                :key="cat"
                class="category-pill" 
                :class="{ active: selectedCategory === cat }"
                @click="selectedCategory = cat"
              >{{ categoryMap[cat] || cat }}</button>
            </div>
            <div class="gallery-grid">
              <div class="gallery-item" v-for="c in filteredCases" :key="c.id" @click="openCaseDetail(c)">
                <div class="image-wrapper">
                  <img :src="c.image" loading="lazy" :alt="c.title" />
                </div>
                <div class="gallery-title" :title="c.title">{{ c.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Case Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedCase" class="modal-overlay case-detail-overlay" @click.self="selectedCase = null">
        <div class="modal-content case-detail-content">
          <h3>{{ selectedCase.title }}</h3>
          <div class="case-detail-body">
            <img :src="selectedCase.image" alt="Case Detail" class="case-detail-image" />
            <div class="case-detail-prompt">
              <div class="prompt-header-row">
                <strong>提示词:</strong>
                <button class="translate-btn" @click="translatePrompt" :disabled="isAILoading">
                  {{ isAILoading ? '翻译中...' : '🇨🇳 转成中文' }}
                </button>
              </div>
              <p>{{ selectedCase.prompt }}</p>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="selectedCase = null">取消</button>
            <button class="primary" @click="applyCase">应用此提示词</button>
          </div>
        </div>
      </div>
    </Teleport>

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

    <!-- DeepSeek Token Modal -->
    <Teleport to="body">
      <AIKeyModal v-model="showAIKeyModal" @save="saveAIApiKey" style="z-index: 9999 !important;" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Message } from '@/components/Message/index'
import { useDeepSeek } from '@/utils/useDeepSeek'
import AIKeyModal from '@/views/xiaohongshu/components/AIKeyModal.vue'

const prompt = ref('')
const resolution = ref('1k')
const size = ref('1:1')
const n = ref('1')
const fileInput = ref<HTMLInputElement | null>(null)
const referenceImages = ref<{ file: File, preview: string, status: 'uploading'|'success'|'error', url?: string, errorMessage?: string }[]>([])

interface HistoryItem {
  id: string;
  taskId?: string;
  url?: string;
  prompt: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
}

const taskStatus = ref('')
const history = ref<HistoryItem[]>([])

const showTokenModal = ref(false)
const alapiToken = ref('')
const tempToken = ref('')

const showGalleryModal = ref(false)
const galleryCases = ref<any[]>([])
const selectedCase = ref<any>(null)
const selectedCategory = ref('All')

const categoryMap: Record<string, string> = {
  'Architecture & Spaces': '建筑与空间',
  'Brand & Logos': '品牌与Logo',
  'Characters & People': '角色与人物',
  'Charts & Infographics': '图表与信息图',
  'Documents & Publishing': '文档与排版',
  'History & Classical Themes': '历史与古典',
  'Illustration & Art': '插画与艺术',
  'Other Use Cases': '其他',
  'Photography & Realism': '摄影与写实',
  'Posters & Typography': '海报与排版',
  'Products & E-commerce': '产品与电商',
  'Scenes & Storytelling': '场景与故事',
  'UI & Interfaces': '界面与UI',
  'Uncategorized': '未分类'
}

const categories = computed(() => {
  const cats = new Set<string>()
  galleryCases.value.forEach(c => {
    if (c.category && c.category !== 'Uncategorized') cats.add(c.category)
  })
  return Array.from(cats).sort()
})

const filteredCases = computed(() => {
  if (selectedCategory.value === 'All') {
    return galleryCases.value
  }
  return galleryCases.value.filter(c => c.category === selectedCategory.value)
})

const { isAILoading, showKeyModal: showAIKeyModal, apiKey: aiApiKey, formatTextWithAI, saveApiKey: saveAIApiKey } = useDeepSeek()

const pollTimers: Record<string, number> = {}

onMounted(() => {
  alapiToken.value = localStorage.getItem('alapi-token') || ''
  try {
    history.value = JSON.parse(localStorage.getItem('image2-history') || '[]')
    
    // Resume polling for pending tasks
    const pendingTasks = history.value.filter(h => h.status === 'pending' && h.taskId)
    pendingTasks.forEach(task => {
      taskStatus.value = `正在恢复任务: ${task.taskId}...`
      pollTaskResult(task.taskId!, task.prompt)
    })
  } catch (e) {
    history.value = []
  }
})

onUnmounted(() => {
  Object.values(pollTimers).forEach(timer => clearTimeout(timer))
})

const openGallery = async () => {
  showGalleryModal.value = true
  if (galleryCases.value.length === 0) {
    try {
      const baseUrl = import.meta.env.BASE_URL
      // Ensure there are no double slashes if BASE_URL has a trailing slash
      const url = `${baseUrl}cases/data.json`.replace('//cases', '/cases')
      const res = await fetch(url)
      const data = await res.json()
      galleryCases.value = data
    } catch (e) {
      console.error('Failed to load gallery cases', e)
      Message.error('加载图库失败')
    }
  }
}

const openCaseDetail = (c: any) => {
  selectedCase.value = c
}

const retryTask = (item: HistoryItem) => {
  if (!item.taskId) return
  item.status = 'pending'
  item.errorMessage = ''
  localStorage.setItem('image2-history', JSON.stringify(history.value))
  taskStatus.value = `正在手动刷新任务: ${item.taskId}...`
  pollTaskResult(item.taskId, item.prompt)
}

const applyCase = () => {
  if (selectedCase.value) {
    prompt.value = selectedCase.value.prompt
    showGalleryModal.value = false
    Message.success(`已应用提示词: ${selectedCase.value.title}`)
    selectedCase.value = null
  }
}

const triggerUpload = () => {
  if (!alapiToken.value) {
    tempToken.value = ''
    showTokenModal.value = true
    return
  }
  fileInput.value?.click()
}

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  const newFiles = Array.from(target.files)
  target.value = '' // reset
  
  for (const file of newFiles) {
    if (referenceImages.value.length >= 16) {
      Message.warning('最多只能上传 16 张参考图')
      break
    }
    
    const preview = URL.createObjectURL(file)
    const imgItem = ref({ file, preview, status: 'uploading' as const, url: '', errorMessage: '' }).value
    referenceImages.value.push(imgItem)
    
    try {
      const fd = new FormData()
      fd.append('token', alapiToken.value)
      fd.append('content_type', file.type)
      fd.append('image', file)
      fd.append('file', file)
      
      const res = await fetch('https://v3.alapi.cn/api/ai/images/generations/upload_image', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (data.code === 200 && data.success) {
        imgItem.status = 'success'
        imgItem.url = typeof data.data === 'string' ? data.data : (data.data?.url || data.data?.image_id)
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (err: any) {
      imgItem.status = 'error'
      imgItem.errorMessage = err.message
      Message.error(`图片 ${file.name} 上传失败: ${err.message}`)
    }
  }
}

const removeReferenceImage = (idx: number) => {
  URL.revokeObjectURL(referenceImages.value[idx].preview)
  referenceImages.value.splice(idx, 1)
}

const translatePrompt = async () => {
  if (!selectedCase.value || !selectedCase.value.prompt) return
  const translated = await formatTextWithAI(selectedCase.value.prompt, 'translate-prompt', 'image2')
  if (translated) {
    selectedCase.value.prompt = translated
  }
}

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

const clearHistory = () => {
  history.value = []
  localStorage.removeItem('image2-history')
  Message.success('历史记录已清空')
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

  taskStatus.value = '提交任务中...'

  try {
    const formData = new FormData()
    formData.append('token', alapiToken.value)
    formData.append('model', 'gpt-image-2')
    formData.append('prompt', prompt.value)
    formData.append('n', n.value)
    formData.append('size', size.value)
    formData.append('resolution', resolution.value)

    const validImages = referenceImages.value.filter(img => img.status === 'success' && img.url).map(img => img.url)
    if (validImages.length > 0) {
      // Pass images either as multiple appended values or joined, depending on ALAPI standard.
      // We will append it as a comma-separated string `images` and also `image` array just to be safe.
      formData.append('images', validImages.join(','))
      validImages.forEach(img => formData.append('image[]', img))
    }

    const res = await fetch('https://v3.alapi.cn/api/ai/images/generations_sync', {
      method: 'POST',
      body: formData
    })
    
    const data = await res.json()
    if (data.code === 200 && data.success) {
      const taskId = data.data.task_id
      
      const newItem: HistoryItem = {
        id: taskId,
        taskId,
        prompt: prompt.value,
        timestamp: Date.now(),
        status: 'pending'
      }
      history.value.unshift(newItem)
      localStorage.setItem('image2-history', JSON.stringify(history.value))
      
      taskStatus.value = `任务提交成功，任务ID: ${taskId}，排队中...`
      pollTaskResult(taskId, prompt.value)
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

const pollTaskResult = (taskId: string, promptStr: string) => {
  let retryCount = 0
  const maxRetries = 60 // 最多轮询60次，每次10秒，大约10分钟

  const checkStatus = async () => {
    try {
      const res = await fetch(`https://v3.alapi.cn/api/ai/images/generations/task?token=${alapiToken.value}&task_id=${taskId}`)
      const data = await res.json()

      if (data.code === 200 && data.success) {
        const status = data.data.status
        taskStatus.value = `当前任务状态: ${status}`
        
        if (status === 'success' || status === 'completed') {
          const newUrls = data.data.data.map((item: any) => item.url)
          
          const index = history.value.findIndex(h => h.taskId === taskId)
          if (index !== -1) {
            history.value[index].status = 'completed'
            history.value[index].url = newUrls[0]
            
            if (newUrls.length > 1) {
              const extraItems = newUrls.slice(1).map((url: string, i: number) => ({
                id: taskId + '-' + i,
                taskId,
                prompt: promptStr,
                timestamp: Date.now(),
                status: 'completed' as const,
                url
              }))
              history.value.splice(index + 1, 0, ...extraItems)
            }
          }
          localStorage.setItem('image2-history', JSON.stringify(history.value))
          
          delete pollTimers[taskId]
          Message.success('生成成功！(数据只保留7天，请及时下载)')
          return
        } else if (status === 'failed' || status === 'error') {
          const index = history.value.findIndex(h => h.taskId === taskId)
          if (index !== -1) {
            history.value[index].status = 'failed'
            history.value[index].errorMessage = '生图失败'
            localStorage.setItem('image2-history', JSON.stringify(history.value))
          }
          delete pollTimers[taskId]
          throw new Error('任务处理失败')
        }
        
        retryCount++
        if (retryCount >= maxRetries) {
          const index = history.value.findIndex(h => h.taskId === taskId)
          if (index !== -1) {
            history.value[index].status = 'failed'
            history.value[index].errorMessage = '任务超时'
            localStorage.setItem('image2-history', JSON.stringify(history.value))
          }
          delete pollTimers[taskId]
          throw new Error('任务处理超时，请稍后重试')
        }
        pollTimers[taskId] = window.setTimeout(checkStatus, 10000)
      } else {
        const index = history.value.findIndex(h => h.taskId === taskId)
        if (index !== -1) {
          history.value[index].status = 'failed'
          history.value[index].errorMessage = data.message || '查询任务失败'
          localStorage.setItem('image2-history', JSON.stringify(history.value))
        }
        delete pollTimers[taskId]
        throw new Error(data.message || '查询任务失败')
      }
    } catch (error: any) {
      console.error('轮询错误:', error)
      Message.error(error.message || '查询失败')
      const index = history.value.findIndex(h => h.taskId === taskId)
      if (index !== -1 && history.value[index].status === 'pending') {
        history.value[index].status = 'failed'
        history.value[index].errorMessage = '查询任务出错'
        localStorage.setItem('image2-history', JSON.stringify(history.value))
      }
      delete pollTimers[taskId]
      taskStatus.value = '任务中止'
    }
  }

  pollTimers[taskId] = window.setTimeout(checkStatus, 10000)
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

.prompt-group {
  margin-bottom: 20px;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.prompt-header label {
  margin-bottom: 0;
}

.gallery-btn {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d48806;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s;
}

.gallery-btn:hover {
  background: #fff1b8;
  border-color: #ffd666;
}

.hint {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.upload-item {
  width: 100px;
  height: 100px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #fafafa;
  cursor: pointer;
}

.upload-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  color: #8c8c8c;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.upload-btn .plus {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  z-index: 2;
  padding: 0;
}

.remove-btn:hover {
  background: #ff4d4f;
}

.upload-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #1890ff;
  font-size: 13px;
  font-weight: 500;
}

.error-mask {
  color: #ff4d4f;
  background: rgba(255,241,240,0.85);
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
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 20px;
  overflow: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.clear-btn {
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #fff1f0;
}

.empty-text {
  margin: auto;
  color: #999;
  font-size: 16px;
}

.loading-wrapper {
  margin: auto;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  width: 100%;
  align-content: start;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  width: 100%;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  box-sizing: border-box;
}

.image-item img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
  object-fit: contain;
}

.status-box {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 8px;
}

.pending-box {
  color: #1890ff;
}

.failed-box {
  color: #ff4d4f;
  background: #fff1f0;
}

.loader-small {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.prompt-preview {
  font-size: 12px;
  color: #666;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  margin: 4px 0 0 0;
}

.retry-btn {
  margin-top: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
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
  max-width: 90vw;
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

/* Gallery Modal specific */
.gallery-overlay {
  align-items: flex-start;
  padding-top: 5vh;
}

.gallery-modal-content {
  width: 900px;
  max-width: 95vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.gallery-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.gallery-body {
  flex: 1;
  overflow-y: auto;
}

.gallery-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 4px;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.image-wrapper {
  width: 100%;
  padding-top: 100%; /* 1:1 aspect ratio */
  position: relative;
  background: #f5f5f5;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-title {
  padding: 10px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.category-filters {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 4px 12px 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.category-filters::-webkit-scrollbar {
  height: 4px;
}

.category-filters::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 2px;
}

.category-pill {
  padding: 6px 16px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  color: #666;
}

.category-pill:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.category-pill.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
  font-weight: bold;
}

/* Case Detail Modal */
.case-detail-overlay {
  z-index: 1001; /* Higher than gallery modal */
}

.case-detail-content {
  width: 600px;
  max-width: 90vw;
}

.case-detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.case-detail-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  background: #f5f5f5;
}

.case-detail-prompt {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
}

.prompt-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.case-detail-prompt strong {
  color: #333;
}

.translate-btn {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.translate-btn:hover:not(:disabled) {
  background: #bae0ff;
  border-color: #69c0ff;
}

.translate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.case-detail-prompt p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
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
