<script setup lang="ts">
import { useRepaymentStore } from '../stores/repaymentStore'
import { useDebtStore } from '../stores/debtStore'

const repaymentStore = useRepaymentStore()
const debtStore = useDebtStore()

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
    <h1>還款歷史</h1>
    <p class="muted">檢視您的所有還款歷史記錄</p>

    <div class="history-list">
      <div class="debt-summary">
        <div class="summary-item">
          <span>卡債</span>
          <span class="summary-sub">債務 ${{ debtStore.totalByCategory('卡債') }}</span>
          <span class="summary-sub">已還 ${{ repaymentStore.totalByCategory('卡債') }}</span>
          <span class="summary-amount" :class="debtStore.totalByCategory('卡債') - repaymentStore.totalByCategory('卡債') > 0 ? 'debt-color' : 'clear-color'">
            剩餘 ${{ debtStore.totalByCategory('卡債') - repaymentStore.totalByCategory('卡債') }}
          </span>
        </div>
        <div class="summary-item">
          <span>貸款</span>
          <span class="summary-sub">債務 ${{ debtStore.totalByCategory('貸款') }}</span>
          <span class="summary-sub">已還 ${{ repaymentStore.totalByCategory('貸款') }}</span>
          <span class="summary-amount" :class="debtStore.totalByCategory('貸款') - repaymentStore.totalByCategory('貸款') > 0 ? 'debt-color' : 'clear-color'">
            剩餘 ${{ debtStore.totalByCategory('貸款') - repaymentStore.totalByCategory('貸款') }}
          </span>
        </div>
      </div>

      <div v-if="repaymentStore.repayments.length === 0" class="no-records">
        <div><router-link to="/repayment" class="nav-link">立即新增還款 →</router-link></div>
      </div>

      <ul v-else>
        <li v-for="(item, index) in repaymentStore.getRepayments" :key="index" class="item">
          <div>
            <div>{{ item.bank ? item.bank + ' - ' : '' }}{{ item.category }}</div>
            <div class="small" v-if="item.note">備註: {{ item.note }}</div>
            <div class="small">{{ formatDate(item.date) }}</div>
          </div>
          <div>${{ item.amount }}</div>
        </li>
      </ul>

      <div class="total">還款總額: ${{ repaymentStore.totalRepayments }}</div>
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
  gap: 4px;
}
.summary-sub {
  font-size: 0.8rem;
  color: var(--muted);
}
.summary-amount {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 2px;
}
.debt-color { color: #d63930; }
.clear-color { color: #2ea043; }
</style>
