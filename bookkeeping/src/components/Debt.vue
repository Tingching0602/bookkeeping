<!--
債務記錄頁面：
1. 頂部 Tab 切換卡債 / 貸款
2. 輸入金額與備註
3. 列表按日期分組顯示
-->
<template>
  <div class="expenses">
    <h1>債務記錄</h1>

    <!-- Tab 切換 -->
    <div class="debt-tabs">
      <button
        v-for="cat in store.categories"
        :key="cat"
        class="tab-btn"
        :class="{ active: activeTab === cat }"
        @click="activeTab = cat"
      >{{ cat }}</button>
    </div>

    <div class="input-section">
      <div class="input-group">
        <select v-if="activeTab === '卡債'" v-model="bank" class="bank-select">
          <option disabled value="">選擇銀行</option>
          <option v-for="b in banks" :key="b" :value="b">{{ b }}</option>
        </select>
        <input v-model.number="amount" type="number" min="0" step="any" placeholder="輸入金額" class="amount-input" />
        <input v-model="note" type="text" placeholder="備註" />
        <button @click="addDebt" class="btn btn-add">新增</button>
      </div>
    </div>

    <div class="day-group" v-for="group in groupedDebts" :key="group.key">
      <div class="day-header">
        <span class="day-label">{{ group.label }}</span>
        <span class="day-total">合計 ${{ group.total }}</span>
      </div>
      <ul class="expense-list">
        <li v-for="debt in group.items" :key="debt.id">
          <div class="expense-content">
            <div class="expense-info">
              <span class="cat">{{ debt.bank ? debt.bank + ' - ' : '' }}{{ debt.category }}</span>
              <div class="amount-area">
                <template v-if="editingId === debt.id">
                  <input
                    type="number"
                    v-model.number="editAmount"
                    class="edit-input"
                    placeholder="輸入金額"
                    @keyup.enter="updateAmount(debt.id)"
                  />
                  <div class="edit-buttons">
                    <button @click="updateAmount(debt.id)" class="btn btn-save">更新</button>
                    <button @click="cancelEdit" class="btn btn-cancel">取消</button>
                  </div>
                </template>
                <template v-else>
                  <div class="amount-display">
                    <span>${{ debt.amount }}</span>
                    <div class="action-buttons">
                      <button @click="startEdit(debt)" class="btn btn-edit">編輯</button>
                      <button @click="handleDelete(debt.id)" class="btn btn-delete">刪除</button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="debt.note" class="expense-note">{{ debt.note }}</div>
          </div>
        </li>
      </ul>
    </div>

    <div class="total">{{ activeTab }}總額: ${{ categoryTotal }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebtStore } from '../stores/debtStore'

const store = useDebtStore()
const activeTab = ref<string>('卡債')
const amount = ref<number | null>(null)
const note = ref<string>('')
const bank = ref<string>('')
const banks = ['中信', '國泰', '台新', '玉山', '永豐', '富邦', '樂天']
const editingId = ref<number | null>(null)
const editAmount = ref<number | null>(null)

function startEdit(debt: { id: number; amount: number }) {
  editingId.value = debt.id
  editAmount.value = debt.amount
}

function updateAmount(id: number) {
  if (editAmount.value !== null && editAmount.value > 0) {
    store.updateDebt(id, editAmount.value)
    cancelEdit()
  }
}

function cancelEdit() {
  editingId.value = null
  editAmount.value = null
}

function handleDelete(id: number) {
  if (confirm('確定要刪除這筆記錄嗎？')) {
    store.deleteDebt(id)
  }
}

function addDebt() {
  if (amount.value === null || amount.value <= 0) {
    alert('請輸入大於 0 的金額')
    return
  }
  if (activeTab.value === '卡債' && !bank.value) {
    alert('請選擇銀行')
    return
  }
  store.addDebt(amount.value, activeTab.value, note.value || undefined, activeTab.value === '卡債' ? bank.value : undefined)
  amount.value = null
  note.value = ''
  bank.value = ''
}

const categoryTotal = computed(() => store.totalByCategory(activeTab.value))

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

const groupedDebts = computed(() => {
  const filtered = store.getDebts.filter(d => d.category === activeTab.value)
  const groups: Record<string, { key: string; label: string; items: any[]; total: number; ts: number }> = {}
  for (const d of filtered) {
    const g = getDayKey(d.date, d.id)
    if (!groups[g.key]) {
      groups[g.key] = { key: g.key, label: g.label, items: [], total: 0, ts: g.ts }
    }
    const bucket = groups[g.key]!
    bucket.items.push(d)
    bucket.total += d.amount || 0
  }
  return Object.values(groups).sort((a, b) => b.ts - a.ts)
})
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
}

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
</style>
