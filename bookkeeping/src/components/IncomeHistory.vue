<script setup lang="ts">
import { useIncomeStore } from '../stores/incomeStore'
import IncomeCategoryChart from './IncomeCategoryChart.vue'

const store = useIncomeStore()

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}
</script>

<template>
  <div class="expense-history">
    <h1>收入記錄</h1>
    <p class="muted">檢視您的所有收入歷史記錄</p>

    <div class="history-list">
      <IncomeCategoryChart />
      <div v-if="store.incomes.length === 0" class="no-records">
        <div><router-link to="/income" class="nav-link">立即新增收入 →</router-link></div>
      </div>

      <ul v-else>
        <li v-for="(income, index) in store.getIncomes" :key="index" class="item">
          <div>
            <div>{{ income.category }}</div>
            <div class="small" v-if="income.note">備註: {{ income.note }}</div>
            <div class="small">{{ formatDate(income.date) }}</div>
          </div>
          <div>${{ income.amount }}</div>
        </li>
      </ul>

      <div class="total">總收入: ${{ store.totalIncomes }}</div>
    </div>
  </div>
</template>
<!-- 使用與支出歷史相同的樣式（class 名稱相同以共用樣式） -->
