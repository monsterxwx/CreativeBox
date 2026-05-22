<template>
  <div class="h-screen w-full flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
    <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <h1 class="text-base font-bold tracking-tight text-gray-800">
          创作海报编辑器
        </h1>
      </div>
      <button @click="exportPoster" class="bg-gray-900 text-white px-5 py-1.5 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        /></svg>
        导出高清图
      </button>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <aside class="w-80 bg-white border-r border-gray-200 flex shadow-sm z-10 shrink-0">
        <div class="w-16 flex flex-col items-center py-4 gap-4 border-r border-gray-100 bg-gray-50">
          <button @click="activeTab = 'bg'" :class="activeTab === 'bg' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'" class="p-3 rounded-xl transition-colors flex flex-col items-center gap-1">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            /></svg>
            <span class="text-[10px] font-medium">背景</span>
          </button>
          <button @click="activeTab = 'elements'" :class="activeTab === 'elements' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'" class="p-3 rounded-xl transition-colors flex flex-col items-center gap-1">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            /></svg>
            <span class="text-[10px] font-medium">素材</span>
          </button>
          <button @click="activeTab = 'text'" :class="activeTab === 'text' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'" class="p-3 rounded-xl transition-colors flex flex-col items-center gap-1">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
            /></svg>
            <span class="text-[10px] font-medium">文字</span>
          </button>
        </div>

        <div class="flex-1 flex flex-col p-4 overflow-hidden bg-white">
          <div v-show="activeTab === 'bg'" class="flex flex-col h-full">
            <h2 class="text-sm font-bold text-gray-700 mb-4">
              预设背景
            </h2>
            <div class="grid grid-cols-2 gap-3 overflow-y-auto pb-4 custom-scrollbar">
              <div
                v-for="(bg, index) in defaultBackgrounds"
                :key="index"
                @click="setBackground(bg)"
                class="relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group"
              >
                <img :src="bg" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  设为背景
                </div>
              </div>
            </div>
            <div class="mt-auto pt-4 border-t border-gray-100">
              <label class="block w-full bg-gray-50 border border-gray-200 text-gray-700 text-center py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium">
                + 上传自定义背景
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="(e) => handleUpload(e, true)"
                >
              </label>
            </div>
          </div>

          <div v-show="activeTab === 'elements'" class="flex flex-col h-full">
            <h2 class="text-sm font-bold text-gray-700 mb-4 flex justify-between items-center">
              <span>图片资源池</span>
              <span class="text-xs font-normal text-gray-400">拖拽入画布</span>
            </h2>
            <div class="grid grid-cols-2 gap-3 overflow-y-auto pb-4 custom-scrollbar items-start content-start flex-1">
              <div v-for="(imgUrl, index) in resourcePool" :key="index" class="relative aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors group cursor-grab">
                <img
                  :src="imgUrl"
                  draggable="true"
                  @dragstart="handleDragStart($event, imgUrl)"
                  class="max-w-full max-h-full object-contain p-1"
                >
                <button @click="resourcePool.splice(index, 1)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center">
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  /></svg>
                </button>
              </div>
            </div>
            <div class="mt-auto pt-4 border-t border-gray-100">
              <label class="block w-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-center py-2 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors text-sm font-medium">
                + 批量导入图片
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleBatchUpload"
                >
              </label>
            </div>
          </div>

          <div v-show="activeTab === 'text'" class="flex flex-col h-full gap-4">
            <h2 class="text-sm font-bold text-gray-700 mb-2">
              添加文本
            </h2>
            <div @click="addText({ fontSize: 120, fontWeight: 'bold' })" class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition flex items-center justify-center text-3xl font-bold">
              添加大标题
            </div>
            <div @click="addText({ fontSize: 80, fontWeight: 'normal' })" class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition flex items-center justify-center text-xl">
              添加副标题
            </div>
            <div @click="addText({ fontSize: 48, fontWeight: 'normal' })" class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition flex items-center justify-center text-sm text-gray-600">
              添加正文内容
            </div>
          </div>
        </div>
      </aside>

      <main
        class="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-200/80"
        ref="workspaceRef"
        @dragover.prevent
        @drop="handleDropToCanvas"
      >
        <transition name="fade-slide">
          <div v-if="activeElement" class="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 px-2 py-1.5 flex items-center gap-2 z-30 transition-all pointer-events-auto">
            <template v-if="activeElement.type === 'i-text'">
              <div class="flex items-center gap-2 px-2 border-r border-gray-100">
                <div class="flex items-center gap-1 bg-gray-50 rounded-md p-1 border border-gray-200">
                  <div class="relative w-6 h-6 rounded overflow-hidden border border-gray-300 cursor-pointer shadow-inner shrink-0">
                    <input
                      type="color"
                      v-model="textProps.fill"
                      @change="handleColorChange"
                      @input="updateText"
                      class="absolute -inset-2 w-10 h-10 cursor-pointer"
                    >
                  </div>
                  <input
                    type="text"
                    :value="textProps.fill"
                    @change="handleHexInputChange"
                    class="w-16 bg-transparent text-xs text-gray-700 outline-none uppercase font-mono text-center px-1"
                    maxlength="7"
                    placeholder="#000000"
                  >
                </div>
                
                <div class="flex items-center gap-1.5 ml-1">
                  <button
                    v-for="(color, index) in recentColors"
                    :key="index"
                    @click="applyRecentColor(color)"
                    class="w-5 h-5 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform"
                    :style="{ backgroundColor: color }"
                    :title="color"
                  ></button>
                </div>

                <div class="relative" ref="fontDropdownRef">
                  <button @click="isDropdownOpen = !isDropdownOpen" class="flex items-center justify-between w-48 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none hover:bg-gray-100 transition-colors">
                    <span class="truncate pr-2 text-gray-700">{{ displayFontName }}</span>

                    <svg
                      v-if="isFontLoading"
                      class="animate-spin h-4 w-4 text-indigo-500 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <svg
                      v-else
                      class="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200"
                      :class="{'rotate-180': isDropdownOpen}"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    /></svg>
                  </button>

                  <transition name="fade-down">
                    <div v-if="isDropdownOpen" class="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto custom-scrollbar ">
                      <div class="flex flex-col">
                        <button @click="selectFont('sans-serif')" :class="textProps.fontFamily === 'sans-serif' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-gray-100'" class="w-full text-left px-4 py-2 text-sm transition-colors flex justify-between items-center">
                          默认无衬线
                          <span v-if="textProps.fontFamily === 'sans-serif'" class="text-indigo-600">✓</span>
                        </button>
                        <button @click="selectFont('serif')" :class="textProps.fontFamily === 'serif' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-gray-100'" class="w-full text-left px-4 py-2 text-sm transition-colors flex justify-between items-center">
                          默认衬线
                          <span v-if="textProps.fontFamily === 'serif'" class="text-indigo-600">✓</span>
                        </button>

                        <button
                          v-for="font in localFonts"
                          :key="font.name"
                          @click="selectFont(font.name)"
                          :class="textProps.fontFamily === font.name ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 hover:bg-gray-100'"
                          class="w-full text-left px-4 py-2 text-sm transition-colors flex justify-between items-center"
                        >
                          <span class="truncate">{{ font.name }}</span>
                          <span v-if="textProps.fontFamily === font.name" class="text-indigo-600">✓</span>
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="flex items-center gap-1 px-2 border-r border-gray-100">
                <button
                  @click="toggleFontWeight"
                  :class="textProps.fontWeight === 'bold' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
                  class="w-8 h-8 rounded flex items-center justify-center font-bold font-serif transition-colors"
                  title="加粗"
                >
                  B
                </button>
                <button
                  @click="toggleFontStyle"
                  :class="textProps.fontStyle === 'italic' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
                  class="w-8 h-8 rounded flex items-center justify-center italic font-serif transition-colors"
                  title="斜体"
                >
                  I
                </button>
              </div>
            </template>

            <div class="flex items-center gap-1 px-2 border-r border-gray-100">
              <button @click="bringForward" class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="上移一层">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                /></svg>
              </button>
              <button @click="sendBackward" class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="下移一层">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                /></svg>
              </button>
              <button @click="bringToFront" class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="置于顶层">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 11l8-8 8 8M4 21l8-8 8 8"
                /></svg>
              </button>
              <button @click="sendToBack" class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="置于底层">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13l-8 8-8-8M20 3l-8 8-8-8"
                /></svg>
              </button>
            </div>

            <div class="px-2 flex items-center">
              <button @click="deleteSelected" class="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded flex items-center justify-center transition-colors" title="删除选中项">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                /></svg>
              </button>
            </div>
          </div>
        </transition>

        <div id="canvas-wrapper" class="shadow-2xl bg-white origin-center transition-transform duration-100" :style="{ width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px`, transform: `scale(${canvasScale})` }">
          <div class="w-full h-full" v-once>
            <canvas id="poster-canvas" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, markRaw, shallowRef, computed } from 'vue'
import { fabric } from 'fabric'
import { saveAs } from 'file-saver'

interface FontOption {
  name: string;
  url: string;
}
const localFonts = ref<FontOption[]>([])

// 扫描静态字体
const scanLocalFonts = () => {
  // 必须加上 query: '?url'，保证 Vite 提取到文件真实路径
  const fontModules = import.meta.glob('/src/assets/fonts/*.{ttf,otf,woff,woff2}', { eager: true, query: '?url' })
  const fonts: FontOption[] = []

  for (const path in fontModules) {
    let fileName = path.split('/').pop()?.split('.').shift()
    if (fileName) {
      fileName = fileName.trim()
      if (fileName) {
        const fileUrl = (fontModules[path] as any).default || fontModules[path]
        fonts.push({ name: fileName, url: fileUrl as string })
      }
    }
  }
  localFonts.value = fonts
}

const loadedFonts = new Set<string>()

// === 常用颜色与本地存储 ===
const DEFAULT_COLORS = ['#080704', '#fefefe', '#161413']
const recentColors = ref<string[]>([...DEFAULT_COLORS])
const RECENT_COLORS_KEY = 'creative_box_recent_colors'

const initRecentColors = () => {
  const saved = localStorage.getItem(RECENT_COLORS_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        recentColors.value = parsed
      }
    } catch (e) {}
  }
}

const saveToRecentColors = (color: string) => {
  if (!color || typeof color !== 'string') return
  const validColor = color.toLowerCase()
  const colors = recentColors.value.filter(c => c.toLowerCase() !== validColor)
  colors.unshift(validColor)
  if (colors.length > 3) colors.pop()
  recentColors.value = colors
  localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(colors))
}

const handleColorChange = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  saveToRecentColors(val)
}

const handleHexInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value.trim()
  if (!val.startsWith('#')) val = '#' + val
  
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) {
    if (val.length === 4) {
      val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3]
    }
    textProps.fill = val
    updateText()
    saveToRecentColors(val)
  } else {
    target.value = textProps.fill
  }
}

const applyRecentColor = (color: string) => {
  textProps.fill = color
  updateText()
  saveToRecentColors(color)
}

// === 字体下拉菜单与加载状态 ===
const isDropdownOpen = ref(false)
const isFontLoading = ref(false)
const fontDropdownRef = ref<HTMLElement | null>(null)

const displayFontName = computed(() => {
  if (textProps.fontFamily === 'sans-serif') return '默认无衬线'
  if (textProps.fontFamily === 'serif') return '默认衬线'
  return textProps.fontFamily
})

const handleClickOutside = (e: MouseEvent) => {
  if (fontDropdownRef.value && !fontDropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  initCanvas()
  calculateScale()
  scanLocalFonts()
  initRecentColors()
  window.addEventListener('resize', calculateScale)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateScale)
  document.removeEventListener('mousedown', handleClickOutside)
  canvas?.dispose()
})

const selectFont = async (fontName: string) => {
  isDropdownOpen.value = false
  if (textProps.fontFamily === fontName || isFontLoading.value) return
  textProps.fontFamily = fontName
  await handleFontChange()
}

// 加载外部字体核心逻辑
const handleFontChange = async () => {
  if (!canvas || !activeElement.value || activeElement.value.type !== 'i-text') return

  const targetFont = textProps.fontFamily
  const matchedFont = localFonts.value.find(f => f.name === targetFont)

  if (matchedFont) {
    if (!loadedFonts.has(matchedFont.name)) {
      isFontLoading.value = true
      try {
        // 关键修复 1：在 URL 内部使用双引号，防止中文路径阻断加载
        const fontFace = new FontFace(matchedFont.name, `url("${matchedFont.url}")`)
        const loadedFace = await fontFace.load()
        document.fonts.add(loadedFace)
        loadedFonts.add(matchedFont.name)
      } catch (error) {
        console.error(`字体 [${matchedFont.name}] 文件解析或加载失败:`, error)
        isFontLoading.value = false
        return
      }
      isFontLoading.value = false
    }
  }

  // 直接调用通用的更新方法同步所有属性到 Canvas
  updateText()
}

// === 常量配置 ===
const POSTER_WIDTH = 1024
const POSTER_HEIGHT = 1536

const defaultBackgrounds = ref([
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1024&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1024&q=80',
  '/模板.png'
])

const resourcePool = ref<string[]>([])
const activeTab = ref('bg')
const workspaceRef = ref<HTMLElement | null>(null)
const canvasScale = ref(1)

let canvas: fabric.Canvas | null = null
const activeElement = shallowRef<fabric.Object | null>(null)

// 当前选中文字的响应式状态
const textProps = reactive({
  fill: '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontFamily: 'sans-serif'
})

const initCanvas = () => {
  canvas = markRaw(new fabric.Canvas('poster-canvas', {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    backgroundColor: '#ffffff',
    preserveObjectStacking: true
  }))

  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', () => {
    activeElement.value = null
  })
}

const calculateScale = () => {
  if (!workspaceRef.value) return
  const container = workspaceRef.value
  const padding = 100
  const scaleX = (container.clientWidth - padding) / POSTER_WIDTH
  const scaleY = (container.clientHeight - padding) / POSTER_HEIGHT
  canvasScale.value = Math.min(scaleX, scaleY, 1)
}

const setBackground = (urlOrBase64: string) => {
  if (!canvas) return
  fabric.Image.fromURL(urlOrBase64, (img: any) => {
    if (!img) return
    const scale = Math.max(POSTER_WIDTH / (img.width || 1), POSTER_HEIGHT / (img.height || 1))
    img.set({
      scaleX: scale,
      scaleY: scale,
      originX: 'center',
      originY: 'center',
      left: POSTER_WIDTH / 2,
      top: POSTER_HEIGHT / 2
    })
    canvas!.setBackgroundImage(img, canvas!.renderAll.bind(canvas!))
  }, { crossOrigin: 'anonymous' })
}

const handleUpload = (e: Event, isBackground: boolean) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !canvas) return

  const reader = new FileReader()
  reader.onload = (f) => {
    const dataUrl = f.target?.result as string
    if (isBackground) setBackground(dataUrl)
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const handleBatchUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (f) => {
      const dataUrl = f.target?.result as string
      resourcePool.value.push(dataUrl)
    }
    reader.readAsDataURL(file)
  })
  target.value = ''
}

const handleDragStart = (e: DragEvent, url: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', url)
    e.dataTransfer.effectAllowed = 'copy'
  }
}

const handleDropToCanvas = (e: DragEvent) => {
  const url = e.dataTransfer?.getData('text/plain')
  if (!url || !canvas) return

  const wrapper = document.getElementById('canvas-wrapper')
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()

  const dropX = (e.clientX - rect.left) / canvasScale.value
  const dropY = (e.clientY - rect.top) / canvasScale.value

  fabric.Image.fromURL(url, (img: any) => {
    if (!img) return
    if (img.width && img.width > POSTER_WIDTH * 0.4) {
      img.scaleToWidth(POSTER_WIDTH * 0.4)
    }

    img.set({
      left: dropX,
      top: dropY,
      originX: 'center',
      originY: 'center',
      cornerColor: '#4f46e5',
      cornerStrokeColor: '#4f46e5',
      transparentCorners: false,
      borderColor: '#4f46e5',
      cornerSize: 12,
      padding: 10
    })
    canvas!.add(img)
    canvas!.setActiveObject(img)
    canvas!.renderAll()
  })
}

const addText = (opts: { fontSize: number, fontWeight: string }) => {
  if (!canvas) return
  const text = new fabric.IText('双击编辑文本', {
    left: POSTER_WIDTH / 2,
    top: POSTER_HEIGHT / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: 'sans-serif',
    fill: '#333333',
    fontSize: opts.fontSize,
    fontWeight: opts.fontWeight,
    cornerColor: '#4f46e5',
    transparentCorners: false,
    borderColor: '#4f46e5',
    cornerSize: 12,
    padding: 10
  })
  canvas.add(text)
  canvas.setActiveObject(text)
  canvas.renderAll()
}

// 选中事件：读取当前属性并去掉可能存在的引号
const handleSelection = (e: fabric.IEvent) => {
  const selected = e.selected?.[0]
  if (selected) {
    activeElement.value = selected
    if (selected.type === 'i-text') {
      const textObj = selected as fabric.IText
      textProps.fill = (textObj.fill as string) || '#000000'
      textProps.fontWeight = (textObj.fontWeight as string) || 'normal'
      textProps.fontStyle = (textObj.fontStyle as string) || 'normal'
      // 关键：读取时清除内部的引号，让 Vue 面板正常显示名称
      textProps.fontFamily = (textObj.fontFamily || 'sans-serif').replace(/['"]/g, '')
    }
  }
}

// 更新事件：将 Vue 的属性应用到 Fabric 画布
const updateText = () => {
  if (!canvas || !activeElement.value || activeElement.value.type !== 'i-text') return
  const textObj = activeElement.value as fabric.IText

  // 关键修复 2：如果使用了非默认的自定义中文字体，必须用引号包裹，否则 Canvas 拒绝渲染！
  let finalFontFamily = textProps.fontFamily
  if (finalFontFamily !== 'sans-serif' && finalFontFamily !== 'serif') {
    finalFontFamily = `"${finalFontFamily}"`
  }

  textObj.set({
    fill: textProps.fill,
    fontWeight: textProps.fontWeight,
    fontStyle: textProps.fontStyle,
    fontFamily: finalFontFamily
  })

  textObj.initDimensions() // 重新计算包围盒防止错位
  canvas.renderAll()
}

// 加粗与斜体切换
const toggleFontWeight = () => {
  textProps.fontWeight = textProps.fontWeight === 'bold' ? 'normal' : 'bold'
  updateText()
}
const toggleFontStyle = () => {
  textProps.fontStyle = textProps.fontStyle === 'italic' ? 'normal' : 'italic'
  updateText()
}

const deleteSelected = () => {
  if (!canvas) return
  const activeObjects = canvas.getActiveObjects()
  if (activeObjects.length === 0) return
  activeObjects.forEach((obj) => canvas!.remove(obj))
  canvas.discardActiveObject()
  canvas.renderAll()
  activeElement.value = null
}

const bringForward = () => {
  if (!canvas || !activeElement.value) return
  canvas.bringForward(activeElement.value)
  canvas.renderAll()
}

const sendBackward = () => {
  if (!canvas || !activeElement.value) return
  canvas.sendBackwards(activeElement.value)
  canvas.renderAll()
}

const bringToFront = () => {
  if (!canvas || !activeElement.value) return
  canvas.bringToFront(activeElement.value)
  canvas.renderAll()
}

const sendToBack = () => {
  if (!canvas || !activeElement.value) return
  canvas.sendToBack(activeElement.value)
  canvas.renderAll()
}

const exportPoster = () => {
  if (!canvas) return
  canvas.discardActiveObject()
  canvas.renderAll()
  const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
  const blob = dataURLtoBlob(dataURL)
  saveAs(blob, `poster-${new Date().getTime()}.png`)
}

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) { u8arr[n] = bstr.charCodeAt(n) }
  return new Blob([u8arr], { type: mime })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 20px;
  background-color: #e5e7eb;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
