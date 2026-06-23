<template>
  <div class="layout-container">
    <!-- Mobile header -->
    <div class="mobile-header">
      <button class="menu-toggle" @click="isMobileMenuOpen = true">
        <span class="icon">☰</span>
      </button>
      <h2>🛠️ 创作盒子</h2>
    </div>

    <!-- Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay" 
      @click="isMobileMenuOpen = false"
    ></div>

    <div class="sidebar" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="logo">
        <h2>🛠️ 创作盒子</h2>
        <button class="close-menu" @click="isMobileMenuOpen = false">×</button>
      </div>
      <div class="menu">
        <router-link 
          v-for="item in menuList" 
          :key="item.path" 
          :to="item.path" 
          class="menu-item" 
          active-class="active"
          @click="isMobileMenuOpen = false"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.text }}</span>
        </router-link>
        <router-link to="/poster" class="menu-item" active-class="active">
          <span class="icon">🖼️</span>
          <span class="text">海报编辑</span>
        </router-link>
      </div>
    </div>
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const menuList = ref([
  { path: '/xhs', icon: '📱', text: '小红书封面' },
  { path: '/wechat', icon: '✍️', text: '公众号排版' },
  { path: '/markdown', icon: '📝', text: 'Markdown 简历' },
  { path: '/image2', icon: '🖼️', text: 'Image2生图' }
])
</script>

<style scoped>
.layout-container {
  display: flex;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background-color: #f1f2f5;
}
/* 默认隐藏移动端特有元素 */
.mobile-header, .mobile-overlay, .close-menu {
  display: none;
}
.sidebar {
  z-index: 100;
  display: flex;
  width: 240px;
  border-right: 1px solid #ebedf0;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgb(0 0 0 / 2%);
  flex-direction: column;
}
.logo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  border-bottom: 1px solid #ebedf0;
}
.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #333333;
}
.menu {
  display: flex;
  padding: 16px 12px;
  flex-direction: column;
  gap: 8px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #606266;
  transition: all 0.3s ease;
}
.menu-item:hover {
  color: #333333;
  background-color: #f5f7fa;
}
.menu-item.active {
  font-weight: 500;
  color: #1890ff;
  background-color: #e6f7ff;
}
.menu-item .icon {
  margin-right: 12px;
  font-size: 18px;
}
.menu-item .text {
  font-size: 15px;
}
.main-content {
  flex: 1;
  position: relative;
  overflow: auto; /* Changed to auto so mobile content can scroll if needed */
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 📱 移动端适配：改为左侧抽屉 */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }
  
  /* 移动端顶部 Header */
  .mobile-header {
    display: flex;
    align-items: center;
    height: 50px;
    background: #fff;
    border-bottom: 1px solid #ebedf0;
    padding: 0 16px;
    z-index: 50;
  }
  .mobile-header h2 {
    margin: 0 0 0 16px;
    font-size: 16px;
    color: #333;
  }
  .menu-toggle {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    color: #666;
  }

  /* 遮罩层 */
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.4);
    z-index: 100;
  }

  /* 侧边栏改为抽屉形式 */
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 260px;
    height: 100vh;
    border-right: none;
    box-shadow: 2px 0 12px rgba(0,0,0,0.1);
    z-index: 101;
    transition: left 0.3s ease;
    flex-direction: column;
  }
  .sidebar.is-open {
    left: 0;
  }
  
  .logo {
    display: flex;
    justify-content: space-between;
  }
  
  .close-menu {
    display: block;
    background: none;
    border: none;
    font-size: 28px;
    color: #999;
    cursor: pointer;
  }

  .main-content {
    height: calc(100vh - 50px);
    flex: none;
  }
}
</style>
