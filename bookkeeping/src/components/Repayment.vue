<!--
還款記錄頁面：
1. 頂部 Tab 切換卡債 / 貸款
2. 卡債時顯示銀行下拉選單
3. 輸入金額與備註
4. 列表顯示「債務 - 還款 = 剩餘」
-->
<template>
  <div class="expenses">
    <h1>還款記錄</h1>

    <!-- Tab 切換 -->
    <div class="debt-tabs">
      <button
        v-for="cat in repaymentStore.categories"
        :key="cat"
        class="tab-btn"
        :class="{ active: activeTab === cat }"
        @click="activeTab = cat"
      >{{ cat }}</button>
    </div>

    <!-- 債務餘額摘要 -->
    <div class="balance-summary">
      <div class="balance-item">
        <span class="balance-label">{{ activeTab }}總額</span>
        <span class="balance-amount debt-color">${{ debtTotal }}</span>
      </div>
      <div class="balance-item">
        <span class="balance-label">已還款</span>
        <span class="balance-amount repay-color">${{ repaidTotal }}</span>
      </div>
      <div class="balance-item">
        <span class="balance-label">剩餘</span>
        <span class="balance-amount" :class="remaining > 0 ? 'debt-color' : 'clear-color'">${{ remaining }}</span>
      </div>
    </div>

    <div class="input-section">
      <div class="input-group">
        <select v-if="activeTab === '卡債'" v-model="bank" class="bank-select">
          <option disabled value="">選擇銀行</option>
          <option v-for="b in banks" :key="b" :value="b">{{ b }}</option>
        </select>
        <input v-model.number="amount" type="number" min="0" step="any" placeholder="輸入還款金額" class="amount-input" />
        <input v-model="note" type="text" placeholder="備註" />
        <button @click="addRepayment" class="btn btn-add">新增</button>
      </div>
    </div>

    <div class="day-group" v-for="group in groupedRepayments" :key="group.key">
      <div class="day-header">
        <span class="day-label">{{ group.label }}</span>
        <span class="day-total">合計 ${{ group.total }}</span>
      </div>
      <ul class="expense-list">
        <li v-for="item in group.items" :key="item.id">
          <div class="expense-content">
            <div class="expense-info">
              <span class="cat">{{ item.bank ? item.bank + ' - ' : '' }}{{ item.category }}</span>
              <div class="amount-area">
                <template v-if="editingId === item.id">
                  <input
                    type="number"
                    v-model.number="editAmount"
                    class="edit-input"
                    placeholder="輸入金額"
                    @keyup.enter="updateAmount(item.id)"
                  />
                  <div class="edit-buttons">
                    <button @click="updateAmount(item.id)" class="btn btn-save">更新</button>
                    <button @click="cancelEdit" class="btn btn-cancel">取消</button>
                  </div>
                </template>
                <template v-else>
                  <div class="amount-display">
                    <span>${{ item.amount }}</span>
                    <div class="action-buttons">
                      <button @click="startEdit(item)" class="btn btn-edit">編輯</button>
                      <button @click="handleDelete(item.id)" class="btn btn-delete">刪除</button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="item.note" class="expense-note">{{ item.note }}</div>
            <div v-if="item.bank" class="bank-remaining">
              {{ item.bank }} 剩餘債務: <span :class="bankRemaining(item.bank) > 0 ? 'debt-color' : 'clear-color'">${{ bankRemaining(item.bank) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="total">{{ activeTab }}已還款: ${{ repaidTotal }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRepaymentStore } from '../stores/repaymentStore'
import { useDebtStore } from '../stores/debtStore'

const repaymentStore = useRepaymentStore()
const debtStore = useDebtStore()
const activeTab = ref<string>('卡債')
const amount = ref<number | null>(null)
const note = ref<string>('')
const bank = ref<string>('')
const banks = ['中信', '國泰', '台新', '玉山', '永豐', '富邦', '樂天']
const editingId = ref<number | null>(null)
const editAmount = ref<number | null>(null)

const debtTotal = computed(() => debtStore.totalByCategory(activeTab.value))
const repaidTotal = computed(() => repaymentStore.totalByCategory(activeTab.value))
const remaining = computed(() => debtTotal.value - repaidTotal.value)

function bankRemaining(bankName: string | undefined): number {
  if (!bankName) return 0
  return debtStore.totalByBank(bankName) - repaymentStore.totalByBank(bankName)
}

function startEdit(item: { id: number; amount: number }) {
  editingId.value = item.id
  editAmount.value = item.amount
}

function updateAmount(id: number) {
  if (editAmount.value !== null && editAmount.value > 0) {
    repaymentStore.updateRepayment(id, editAmount.value)
    cancelEdit()
  }
}

function cancelEdit() {
  editingId.value = null
  editAmount.value = null
}

function handleDelete(id: number) {
  if (confirm('確定要刪除這筆記錄嗎？')) {
    repaymentStore.deleteRepayment(id)
  }
}

function addRepayment() {
  if (amount.value === null || amount.value <= 0) {
    alert('請輸入大於 0 的金額')
    return
  }
  if (activeTab.value === '卡債' && !bank.value) {
    alert('請選擇銀行')
    return
  }
  repaymentStore.addRepayment(amount.value, activeTab.value, note.value || undefined, activeTab.value === '卡債' ? bank.value : undefined)
  amount.value = null
  note.value = ''
  bank.value = ''
}

// ---- Group by day ----
function getDayKey(dateStr: string | undefined, fallbackMs: number) {
  let d = dateStr ? new Date(dateStr) : new Date(fallbackMs)
  if (isNaN(d.getTime())) d = new Date(fallbackMs)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const key = `${year}-${month}-${day}`
  const label = `${year}年${month}月${day}日`
  return { key, ts: d.getTime(), label }
}

const groupedRepayments = computed(() => {
  const filtered = repaymentStore.getRepayments.filter(r => r.category === activeTab.value)
  const groups: Record<string, { key: string; label: string; items: any[]; total: number; ts: number }> = {}
  for (const r of filtered) {
    const g = getDayKey(r.date, r.id)
    if (!groups[g.key]) {
      groups[g.key] = { key: g.key, label: g.label, items: [], total: 0, ts: g.ts }
    }
    const bucket = groups[g.key]!
    bucket.items.push(r)
    bucket.total += r.amount || 0
  }
  return Object.values(groups).sort((a, b) => b.ts - a.ts)
})
</script>

<style scoped>
.debt-tabs {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}
.tab-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #f4f7fb;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 4px 10px rgba(58, 124, 135, 0.25);
}

.balance-summary {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}
.balance-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 14px;
  background: #f4f7fb;
  border: 1px solid var(--line);
}
.balance-label {
  font-size: 0.8rem;
  color: var(--muted);
}
.balance-amount {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 2px;
}
.debt-color { color: #d63930; }
.repay-color { color: var(--primary); }
.clear-color { color: #2ea043; }

.bank-remaining {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed var(--line);
}
</style>
