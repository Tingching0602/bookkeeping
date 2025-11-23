<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useExpenseStore } from './stores/expenseStore'
import { useIncomeStore } from './stores/incomeStore'

const expenseStore = useExpenseStore()
const incomeStore = useIncomeStore()

// 應用啟動時載入 API 資料
onMounted(async () => {
  try {
    await Promise.all([
      expenseStore.loadExpensesFromAPI(),
      incomeStore.loadIncomesFromAPI()
    ])
  } catch (error) {
    console.error('載入資料失敗:', error)
  }
})
</script>

<template>
  <div>
    <nav class="nav-bar">
      <router-link to="/input" class="nav-link" :class="{ active: $route.path === '/input' }">支出記錄</router-link>
      <router-link to="/income" class="nav-link" :class="{ active: $route.path === '/income' }">收入記錄</router-link>
      <router-link to="/history" class="nav-link" :class="{ active: $route.path === '/history' }">支出歷史</router-link>
      <router-link to="/income-history" class="nav-link" :class="{ active: $route.path === '/income-history' }">收入歷史</router-link>
    </nav>
    <main id="app">
      <RouterView />
    </main>
  </div>
</template>
