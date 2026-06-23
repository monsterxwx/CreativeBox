import { ref } from 'vue'
import { Message } from '@/components/Message/index'

export function useDeepSeek() {
  const isAILoading = ref(false)
  const showKeyModal = ref(false)
  const apiKey = ref(localStorage.getItem('deepseek-api-key') || '')

  const formatTextWithAI = async (text: string, mode: 'optimize' | 'format-only' | 'translate-prompt' = 'optimize', platform: 'xiaohongshu' | 'wechat' | 'image2' = 'xiaohongshu'): Promise<string | null> => {
    if (!text.trim()) {
      Message.warning('请输入需要排版的文字内容')
      return null
    }

    if (!apiKey.value) {
      showKeyModal.value = true
      return null
    }

    isAILoading.value = true

    let systemPromptOptimize = '你是一个专业的小红书文案爆款排版专家。请帮我重新排版、润色用户提供的文字内容。要求：1. 使用 Markdown 格式进行排版，最大的标题请从三级标题(###)开始，绝对不要使用一级标题(#)和二级标题(##)；2. 适当使用标题(如## \n### 等)、加粗(**)、列表(-)、等语法；3. 合理加入Emoji表情使其更生动；4. 重点突出，网感好，段落清晰，段落之间空行；5. 直接返回排版好的内容，不要做任何多余的解释或寒暄。'
    if (platform === 'wechat') {
      systemPromptOptimize = '你是一个专业的微信公众号爆款排版专家。请帮我重新排版、润色用户提供的文字内容，适合公众号长文阅读。要求：1. 使用 Markdown 格式进行排版；2. 段落之间适度留白；3. 合理加入强调和列表；4. 直接返回排版好的内容，不要做解释。'
    }

    const systemPromptFormatOnly = '你是一个强大的 Markdown 智能排版助手。职责是为用户提供的原文添加合适的 Markdown 排版格式，比如提取标题(###，####等)、将多项并列整合为列表(-)、加粗重点词汇(**)并按意群进行分段空行。要求：最大标题请从三级级标题(###)开始，绝对不要使用一级标题(#)和二级标题(##)；必须完全保留用户原始的文字结构、语气和语意，绝对禁止大篇幅删减或修改用户原话。直接返回排版好的 Markdown 内容，不要做任何解释。'

    let currentSystemPrompt = ''
    if (mode === 'translate-prompt') {
      currentSystemPrompt = '你是一个专业的图像生成提示词翻译专家。请将用户提供的英文提示词准确、流畅地翻译为中文。要求：1. 保持原有的意境和细节；2. 专业名词（如镜头、视角、风格等）采用行业标准译法；3. 直接返回翻译后的中文结果，不要任何解释或寒暄。'
    } else if (mode === 'format-only') {
      currentSystemPrompt = systemPromptFormatOnly
    } else {
      currentSystemPrompt = systemPromptOptimize
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.value}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: currentSystemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7
        })
      })

      const data = await response.json()
      if (response.ok) {
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          Message.warning('API Key 似乎无效或已过期，请重新配置。')
          apiKey.value = ''
          localStorage.removeItem('deepseek-api-key')
          showKeyModal.value = true
          return null
        }
        throw new Error(data.error?.message || '请求失败，请检查 API Key 余额或网络环境。')
      }
    } catch (error: any) {
      console.error('AI 排版失败:', error)
      Message.error(`AI 排版出错: \n${error.message}\n如果是跨域网络问题，请检查网络以及 API Key 是否有效。`)
    } finally {
      isAILoading.value = false
    }
    return null
  }

  const saveApiKey = (key: string) => {
    apiKey.value = key
    localStorage.setItem('deepseek-api-key', apiKey.value)
    showKeyModal.value = false
  }

  return {
    isAILoading,
    showKeyModal,
    apiKey,
    formatTextWithAI,
    saveApiKey
  }
}
