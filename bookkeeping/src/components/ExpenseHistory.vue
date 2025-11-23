<script setup lang="ts">
import { useExpenseStore } from '../stores/expenseStore'
import CategoryChart from './CategoryChart.vue'

const store = useExpenseStore()

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
    <h1>支出記錄</h1>
    <p class="muted">檢視您的所有支出歷史記錄</p>

    <div class="history-list">
      <CategoryChart />
      <div v-if="store.expenses.length === 0" class="no-records">
        <div><router-link to="/input" class="nav-link">立即新增支出 →</router-link></div>
      </div>

      <ul v-else>
  <li v-for="(expense, index) in store.getExpenses" :key="index" class="item">
          <div>
            <div>{{ expense.category }}</div>
            <div class="small" v-if="expense.note">備註: {{ expense.note }}</div>
            <div class="small">{{ formatDate(expense.date) }}</div>
          </div>
          <div>${{ expense.amount }}</div>
        </li>
      </ul>

      <div class="total">總支出: ${{ store.totalExpenses }}</div>
    </div>
  </div>
</template>

