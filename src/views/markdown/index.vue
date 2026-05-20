<template>
  <div class="h-screen w-full flex flex-col bg-white text-gray-900 font-sans overflow-hidden">
    <header class="flex-shrink-0 h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 print:hidden">
      <div class="flex items-center gap-3">
        <div class="w-2 h-6 bg-black rounded-sm" />
        <h1 class="text-lg font-medium tracking-wide">
          Markdown 简历
        </h1>
      </div>
      <button
        @click="exportToPDF"
        class="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-all duration-200 shadow-sm active:scale-95"
      >
        导出为 PDF
      </button>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <section class="flex-1 bg-gray-50/50 print:hidden flex flex-col p-[12px_6px_12px_12px]  relative">
        <div class="flex-1 flex flex-col relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-shadow duration-300 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div class="h-10 bg-gray-50/50 border-b border-gray-50 flex items-center px-4 justify-between select-none">
            <div class="flex gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-red-400 transition-colors cursor-pointer" />
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-yellow-400 transition-colors cursor-pointer" />
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-green-400 transition-colors cursor-pointer" />
            </div>
            <span class="text-[11px] font-semibold text-gray-400 font-mono tracking-widest uppercase">Markdown Editor</span>
          </div>

          <textarea
            v-model="markdownText"
            class="flex-1 w-full p-6 bg-transparent resize-none border-none outline-none focus:ring-0 focus:outline-none text-[14px] leading-loose text-gray-600 custom-scrollbar font-mono selection:bg-gray-200"
            placeholder="在此粘贴你的 Markdown 简历内容..."
            spellcheck="false"
          />
        </div>
      </section>

      <section class="flex-1 bg-gray-50/50 print:hidden flex flex-col p-[12px_12px_12px_6px]  relative">
        <div class="flex-1 flex flex-col relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div class="h-10 bg-gray-50/50 border-b border-gray-50 flex items-center px-4 justify-between select-none">
            <div class="flex gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-red-400 transition-colors cursor-pointer" />
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-yellow-400 transition-colors cursor-pointer" />
              <div class="w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-green-400 transition-colors cursor-pointer" />
            </div>
            <span class="text-[11px] font-semibold text-gray-400 font-mono tracking-widest uppercase">Live Preview</span>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div class="resume-container mx-auto p-10 max-w-[850px]" v-html="compiledHtml" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

// 初始默认内容，可以替换为空字符串
const markdownText = ref(`
# 你的名字 | 开发工程师
- **电话**：15888888888 | **邮箱**：888888888@qq.com
- **现居**: 广州 | **工作经验**：4年 (2022.06 - 至今)

## 🚀 个人优势
* **AI 研发提效**：深度拥抱 AI 辅助编程，熟练运用大模型。
* **全栈与工程化**: 熟练使用 Vue 3、Next.js 15、Uni-app、Node.js。
`)

// 实时编译 Markdown
const compiledHtml = computed(() => {
  if (!markdownText.value) return ''
  return marked(markdownText.value)
})

const exportToPDF = () => {
  // 1. 获取要打印的简历核心容器
  const resumeDom = document.querySelector('.resume-container')
  if (!resumeDom) return

  // 2. 深度克隆该节点
  const printDom = resumeDom.cloneNode(true)

  // 3. 加上专属的打印 class
  printDom.classList.add('print-only-node')

  // 4. 追加到 body 最外层，脱离所有外层布局的束缚
  document.body.appendChild(printDom)
  document.body.classList.add('is-printing')

  // 5. 延迟一小段时间确保 DOM 更新后调用系统打印
  setTimeout(() => {
    window.print()

    // 6. 打印结束后清理现场，恢复原样
    document.body.classList.remove('is-printing')
    document.body.removeChild(printDom)
  }, 100)
}
</script>

<style>
/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #e5e7eb;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
}

/* =========================================================
   1. 简历基础排版 (紧凑+高级感优化)
========================================================== */
.resume-container {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.5; /* 从 1.6 缩减到 1.5 */
  color: #222222;
}
.resume-container h1 {
  margin-bottom: 8px; /* 减少底部留白 */
  font-size: 26px; /* 稍微缩小主标题 */
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
}
.resume-container h2 {
  display: flex;
  align-items: center;
  margin-top: 18px; /* 从 32px 大幅缩减，核心压缩点 */
  margin-bottom: 10px; /* 从 16px 缩减 */
  padding-bottom: 6px;
  font-size: 17px;
  border-bottom: 1px solid #eaeaea;
  color: #111111;
}
.resume-container h2::before {
  display: inline-block;
  margin-right: 8px;
  width: 3px;
  height: 14px;
  background-color: #111111;
  content: "";
}
.resume-container ul {
  margin-bottom: 8px;
  padding-left: 20px;
}
.resume-container li {
  margin-bottom: 4px; /* 从 8px 缩减，列表变得更紧凑但不断联 */
  font-size: 14px;
  text-align: justify;
  color: #333333;
}
.resume-container p {
  margin-top: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444444;
}
.resume-container a {
  text-decoration: underline;
  color: #000000;
  transition: all 0.2s;
  text-underline-offset: 3px;
  text-decoration-color: #cccccc;
}
.resume-container a:hover {
  text-decoration-color: #000000;
}
.resume-container strong {
  font-weight: 600;
  color: #111111;
}

/* 顶部联系方式信息列表 */
.resume-container > ul:first-of-type {
  display: flex;
  justify-content: center;
  margin-bottom: 16px; /* 从 30px 大幅缩减 */
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
  gap: 12px;
}
.resume-container > ul:first-of-type li {
  margin: 0;
  color: #555555;
}

/* =========================================================
   2. DOM 克隆法专属打印样式 (极致空间压缩)
========================================================== */
.print-only-node {
  display: none;
}

@media print {
  @page { margin: 0; }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: white !important;
  }
  .is-printing #app {
    display: none !important;
  }

  /* 打印专用容器样式 */
  .print-only-node {
    display: block;
    margin: 0 auto !important;

    /* 上下边距缩减为 8mm，左右保持 15mm，为页面上下释放极大空间 */
    padding: 8mm 15mm !important;
    width: 100%;
    max-width: 800px;
  }

  /* 打印时字体整体等比缩放一点点，是压缩页数最有效的手段 */
  .print-only-node li,
  .print-only-node p {
    font-size: 13.5px !important;
    line-height: 1.45 !important;
  }
  .print-only-node h2 {
    margin-top: 14px !important;
    font-size: 16px !important;
  }

  /* 保证内容在跨页时不会被从中间强行切断文字 */
  .print-only-node h2,
  .print-only-node li,
  .print-only-node p {
    page-break-inside: avoid;
  }
}
</style>
