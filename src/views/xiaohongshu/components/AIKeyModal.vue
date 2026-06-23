<template>
  <div class="modal-overlay" v-if="modelValue">
    <div class="modal-content">
      <h3>🔑 配置 DeepSeek API Key</h3>
      <p>请输入您的 DeepSeek API Key 才能使用 AI 排版功能。Key 仅保存在您的浏览器本地，绝不会泄露。</p>
      <div class="input-group">
        <input v-model="tempApiKey" type="password" placeholder="sk-..." class="key-input" />
      </div>
      <div class="modal-actions">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="save-btn" @click="save">保存并使用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@/components/Message/index'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const tempApiKey = ref('')

const close = () => {
  emit('update:modelValue', false)
  tempApiKey.value = ''
}

const save = () => {
  if (!tempApiKey.value.trim()) {
    Message.warning('请输入有效的 API Key')
    return
  }
  emit('save', tempApiKey.value.trim())
  tempApiKey.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #1a1a1a;
  font-size: 20px;
}

.modal-content p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 24px;
}

.key-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.key-input:focus {
  border-color: #ff2442;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f4f4f5;
  color: #606266;
  border: none;
}

.cancel-btn:hover {
  background: #e9e9eb;
}

.save-btn {
  background: #ff2442;
  color: white;
  border: none;
}

.save-btn:hover {
  background: #e61e38;
}
</style>
