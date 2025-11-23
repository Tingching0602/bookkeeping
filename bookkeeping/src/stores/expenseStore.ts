import { defineStore } from 'pinia'
import { getMoneyRecords, createMoneyRecord, updateMoneyRecord, deleteMoneyRecord, type MoneyRecordResponse } from '../services/bookkeepingService'

type Expense = {
  id: number
  amount: number
  category: string
  date: string
  note?: string
}

const STORAGE_KEY = 'bookkeeping_expenses'
const CATEGORIES_KEY = 'bookkeeping_expense_categories'

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: loadFromStorage<Expense[]>(STORAGE_KEY, []),
    categories: loadFromStorage<string[]>(CATEGORIES_KEY, ['食物', '交通', '娛樂', '醫療', '日常用品', '其他']),
    isLoading: false,
    error: null as string | null
  }),
  
  actions: {
    // 從 API 載入支出記錄
    async loadExpensesFromAPI() {
      this.isLoading = true
      this.error = null
      try {
        const records = await getMoneyRecords()
        // 篩選出支出記錄 (type === 1)
        const expenses = records
          .filter((r: MoneyRecordResponse) => r.type === 1)
          .map((r: MoneyRecordResponse) => ({
            id: r.id || Date.now(),
            amount: r.price,
            category: r.class,
            date: r.date,
            note: r.note
          }))
        this.expenses = expenses
        saveToStorage(STORAGE_KEY, this.expenses)
      } catch (error) {
        this.error = '載入支出記錄失敗'
        console.error('載入支出記錄失敗:', error)
        // 失敗時使用本地資料
        this.expenses = loadFromStorage<Expense[]>(STORAGE_KEY, [])
      } finally {
        this.isLoading = false
      }
    },

    addCategory(category: string) {
      if (!this.categories.includes(category)) {
        this.categories.push(category)
        saveToStorage(CATEGORIES_KEY, this.categories)
      }
    },

    async addExpense(amount: number, category: string, note?: string) {
      this.isLoading = true
      this.error = null
      try {
        // 呼叫 API 新增
        const record = await createMoneyRecord({
          price: amount,
          class: category,
          note: note || '',
          date: new Date().toISOString(),
          type: 1  // 1 = 支出
        })
        
        // 新增到本地 state
        const newExpense: Expense = {
          id: record.id || Date.now(),
          amount: record.price,
          category: record.class,
          date: record.date,
          note: record.note
        }
        this.expenses.push(newExpense)
        saveToStorage(STORAGE_KEY, this.expenses)
      } catch (error) {
        this.error = '新增支出失敗'
        console.error('新增支出失敗:', error)
        // API 失敗時仍存到本地
        this.expenses.push({
          id: Date.now(),
          amount,
          category,
          note,
          date: new Date().toLocaleString()
        })
        saveToStorage(STORAGE_KEY, this.expenses)
      } finally {
        this.isLoading = false
      }
    },

    async updateExpense(id: number, amount: number) {
      this.isLoading = true
      this.error = null
      const expense = this.expenses.find(e => e.id === id)
      if (!expense) return

      try {
        // 呼叫 API 修改
        await updateMoneyRecord(id, {
          price: amount,
          class: expense.category,
          note: expense.note || '',
          date: expense.date,
          type: 1  // 1 = 支出
        })
        
        // 更新本地 state
        expense.amount = amount
        saveToStorage(STORAGE_KEY, this.expenses)
      } catch (error) {
        this.error = '修改支出失敗'
        console.error('修改支出失敗:', error)
        // API 失敗時仍更新本地
        expense.amount = amount
        saveToStorage(STORAGE_KEY, this.expenses)
      } finally {
        this.isLoading = false
      }
    },

    async deleteExpense(id: number) {
      this.isLoading = true
      this.error = null
      const index = this.expenses.findIndex(e => e.id === id)
      if (index === -1) return

      try {
        // 呼叫 API 刪除
        await deleteMoneyRecord(id)
        
        // 從本地 state 移除
        this.expenses.splice(index, 1)
        saveToStorage(STORAGE_KEY, this.expenses)
      } catch (error) {
        this.error = '刪除支出失敗'
        console.error('刪除支出失敗:', error)
        // API 失敗時仍從本地移除
        this.expenses.splice(index, 1)
        saveToStorage(STORAGE_KEY, this.expenses)
      } finally {
        this.isLoading = false
      }
    },
  },
  
  getters: {
    getExpenses: (state) => {
      return [...state.expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },
    
    totalExpenses: (state) => {
      return state.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    },
    
    expensesByCategory: (state) => {
      return (category: string) => {
        return state.expenses.filter(expense => expense.category === category)
      }
    },

    getAllCategories: (state) => {
      return state.categories
    }
  }
})

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}