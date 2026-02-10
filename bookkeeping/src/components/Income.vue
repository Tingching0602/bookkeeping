<!--
收入記錄頁面：
1. 包含輸入每日收入金額、選擇分類、與新增按鈕
2. 將資料以列表顯示在下方
3. 使用 Pinia 管理狀態
-->
<template>
  <div class="expenses">
    <h1>每日收入記錄</h1>
    <div class="input-section">
      <div class="input-group">
        <input v-model.number="amount" type="number" min="0" step="any" placeholder="輸入收入金額" class="amount-input" />
        <div class="category-input" :class="{ 'with-new': category === '__new__' }">
          <select v-model="category">
            <option disabled value="">選擇分類</option>
            <option v-for="cat in store.getAllCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
            <option value="__new__">+ 新增分類</option>
          </select>
          <input
            v-if="category === '__new__'"
            v-model="newCategory"
            type="text"
            placeholder="輸入新分類名稱"
            @keyup.enter="addNewCategory"
          />
        </div>
  <input v-model="note" type="text" placeholder="備註" />
  <button @click="addIncome" class="btn btn-add">新增</button>
      </div>
    </div>
    <div class="day-group" v-for="group in groupedIncomes" :key="group.key">
      <div class="day-header">
        <span class="day-label">{{ group.label }}</span>
        <span class="day-total">合計 ${{ group.total }}</span>
      </div>
      <ul class="expense-list">
        <li v-for="income in group.items" :key="income.id">
          <div class="expense-content">
            <div class="expense-info">
              <span class="cat">{{ income.category }}</span>
              <div class="amount-area">
                <template v-if="editingId === income.id">
                  <input
                    type="number"
                    v-model.number="editAmount"
                    class="edit-input"
                    placeholder="輸入金額"
                    @keyup.enter="updateAmount(income.id)"
                  />
                  <div class="edit-buttons">
                    <button @click="updateAmount(income.id)" class="btn btn-save">更新</button>
                    <button @click="cancelEdit" class="btn btn-cancel">取消</button>
                  </div>
                </template>
                <template v-else>
                  <div class="amount-display">
                    <span>${{ income.amount }}</span>
                    <div class="action-buttons">
                      <button @click="startEdit(income)" class="btn btn-edit">編輯</button>
                      <button @click="handleDelete(income.id)" class="btn btn-delete">刪除</button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="income.note" class="expense-note">{{ income.note }}</div>
          </div>
        </li>
      </ul>
    </div>
    <div class="total">總收入: ${{ store.totalIncomes }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeStore } from '../stores/incomeStore'

const store = useIncomeStore()
const amount = ref<number | null>(null)
const category = ref<string>('')
const note = ref<string>('')
const newCategory = ref<string>('')
const editingId = ref<number | null>(null)
const editAmount = ref<number | null>(null)

function startEdit(income: { id: number, amount: number }) {
  editingId.value = income.id
  editAmount.value = income.amount
}

function updateAmount(id: number) {
  if (editAmount.value !== null && editAmount.value > 0) {
    store.updateIncome(id, editAmount.value)
    cancelEdit()
  }
}

function cancelEdit() {
  editingId.value = null
  editAmount.value = null
}
function handleDelete(id: number) {
  if (confirm('確定要刪除這筆記錄嗎？')) {
    store.deleteIncome(id)
  }
}
function addNewCategory() {
  const trimmedCategory = newCategory.value.trim()
  if (!trimmedCategory) {
    alert('請輸入分類名稱')
    return
  }
  
  store.addCategory(trimmedCategory)
  category.value = trimmedCategory
  newCategory.value = ''
}

function addIncome() {
  if (amount.value === null || amount.value <= 0) {
    alert('請輸入大於 0 的金額')
    return
  }
  
  if (category.value === '__new__') {
    if (!newCategory.value.trim()) {
      alert('請輸入新分類名稱')
      return
    }
    addNewCategory()
  } else if (!category.value) {
    alert('請選擇分類')
    return
  }

  store.addIncome(amount.value, category.value, note.value || undefined)

  amount.value = null
  category.value = ''
  note.value = ''
}

// ---- Group by day for clearer daily sections ----
function getDayKey(dateStr: string | undefined, fallbackMs: number): { key: string, ts: number, label: string } {
  let d = dateStr ? new Date(dateStr) : new Date(fallbackMs)
  if (isNaN(d.getTime())) d = new Date(fallbackMs)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const key = `${year}-${month}-${day}`
  const label = `${year}年${month}月${day}日`
  return { key, ts: d.getTime(), label }
}

const groupedIncomes = computed(() => {
  const groups: Record<string, { key: string, label: string, items: any[], total: number, ts: number }> = {}
  for (const e of store.getIncomes) {
    const g = getDayKey((e as any).date, (e as any).id)
    if (!groups[g.key]) {
      groups[g.key] = { key: g.key, label: g.label, items: [], total: 0, ts: g.ts }
    }
    const bucket = groups[g.key]!
    bucket.items.push(e)
    bucket.total += (e as any).amount || 0
  }
  return Object.values(groups).sort((a, b) => b.ts - a.ts)
})
</script>

<style scoped>
.input-section {
  display: flex;
  gap: 8px;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.amount-input {
  width: 120px;
  flex-shrink: 0;
}

.category-input {
  position: relative;
  display: flex;
  gap: 8px;
  width: 120px;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.category-input.with-new {
  width: 280px;
}

.category-input select {
  width: 120px;
  flex-shrink: 0;
}

.category-input input {
  width: 150px;
  flex-shrink: 0;
  opacity: 0;
  transform: translateX(-100%);
  transition: all 0.3s ease-in-out;
}

.category-input.with-new input {
  opacity: 1;
  transform: translateX(0);
}

input[type="text"],
input[type="number"],
select,
button {
  height: 32px;
  box-sizing: border-box;
}

/* 隱藏數字輸入框的上下箭頭 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type="text"] {
  flex: 1;
  min-width: 100px;
}

button {
  white-space: nowrap;
  padding: 0 16px;
}

/* 共用按鈕基底 */
.btn {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: filter 0.2s ease;
}

.btn:hover {
  filter: brightness(0.9);
}

.btn-add {
  background-color: #007979;
}

.btn-add:hover {
  background-color: #ffffff;
  color: #007979;
  border: 1px solid #007979;
  filter: none;
}

.btn-edit {
  background-color: #2c4a8b;
}

.btn-delete {
  background-color: #d63930;
}

.btn-edit:hover {
  background-color: #ffffff;
  color: #2c4a8b;
  border: 1px solid #2c4a8b;
  filter: none;
}

.btn-delete:hover {
  background-color: #ffffff;
  color: #d63930;
  border: 1px solid #d63930;
  filter: none;
}

.btn-save {
  background-color: #46A3FF;
}

.btn-cancel {
  background-color: #757575;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.expense-note {
  margin-left: auto;
  color: #6b7280;
  font-size: 0.9em;
  padding-left: 16px;
}

.expense-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.expense-info {
  flex: 1;
}

.expense-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-edit input {
  width: 100px;
  text-align: right;
  padding: 4px 8px;
}

.amt {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.amt:hover {
  background: #f3f4f6;
}

.delete-btn {
  padding: 4px 8px;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fef2f2;
}

.date {
  color: #6b7280;
  margin-top: 4px;
}

/* Day grouping styles */
.day-group { margin-top: 16px; }
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  color: #374151;
  font-weight: 600;
}
.day-total { color: #059669; }
</style>
