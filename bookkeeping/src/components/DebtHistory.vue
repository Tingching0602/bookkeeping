<script setup lang="ts">
import { useDebtStore } from '../stores/debtStore'

const store = useDebtStore()

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
    <h1>債務記錄</h1>
    <p class="muted">檢視您的所有債務歷史記錄</p>

    <div class="history-list">
      <div class="debt-summary">
        <div class="summary-item">
          <span>卡債總額</span>
          <span class="summary-amount">${{ store.totalByCategory('卡債') }}</span>
        </div>
        <div class="summary-item">
          <span>貸款總額</span>
          <span class="summary-amount">${{ store.totalByCategory('貸款') }}</span>
        </div>
      </div>

      <div v-if="store.debts.length === 0" class="no-records">
        <div><router-link to="/debt" class="nav-link">立即新增債務 →</router-link></div>
      </div>

      <ul v-else>
        <li v-for="(debt, index) in store.getDebts" :key="index" class="item">
          <div>
            <div>{{ debt.bank ? debt.bank + ' - ' : '' }}{{ debt.category }}</div>
            <div class="small" v-if="debt.note">備註: {{ debt.note }}</div>
            <div class="small">{{ formatDate(debt.date) }}</div>
          </div>
          <div>${{ debt.amount }}</div>
        </li>
      </ul>

      <div class="total">債務總額: ${{ store.totalDebts }}</div>
    </div>
  </div>
</template>

<style scoped>
.debt-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: #f4f7fb;
  border: 1px solid var(--line);
}
.summary-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: 4px;
}
</style>
