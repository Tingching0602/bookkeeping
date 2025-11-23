import { defineStore } from 'pinia'
import { getMoneyRecords, createMoneyRecord, updateMoneyRecord, deleteMoneyRecord, type MoneyRecordResponse } from '../services/bookkeepingService'

type Income = {
  id: number
  amount: number
  category: string
  date: string
  note?: string
}

const STORAGE_KEY = 'bookkeeping_incomes'
const CATEGORIES_KEY = 'bookkeeping_income_categories'

export const useIncomeStore = defineStore('income', {
  state: () => ({
    incomes: loadFromStorage<Income[]>(STORAGE_KEY, []),
    categories: loadFromStorage<string[]>(CATEGORIES_KEY, ['薪資', '獎金', '投資', '兼職', '其他']),
    isLoading: false,
    error: null as string | null
  }),
  
  actions: {
    // 從 API 載入收入記錄
    async loadIncomesFromAPI() {
      this.isLoading = true
      this.error = null
      try {
        const records = await getMoneyRecords()
        // 篩選出收入記錄 (type === 2)
        const incomes = records
          .filter((r: MoneyRecordResponse) => r.type === 2)
          .map((r: MoneyRecordResponse) => ({
            id: r.id || Date.now(),
            amount: r.price,
            category: r.class,
            date: r.date,
            note: r.note
          }))
        this.incomes = incomes
        saveToStorage(STORAGE_KEY, this.incomes)
      } catch (error) {
        this.error = '載入收入記錄失敗'
        console.error('載入收入記錄失敗:', error)
        // 失敗時使用本地資料
        this.incomes = loadFromStorage<Income[]>(STORAGE_KEY, [])
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

    async addIncome(amount: number, category: string, note?: string) {
      this.isLoading = true
      this.error = null
      try {
        // 呼叫 API 新增
        const record = await createMoneyRecord({
          price: amount,
          class: category,
          note: note || '',
          date: new Date().toISOString(),
          type: 2  // 2 = 收入
        })
        
        // 新增到本地 state
        const newIncome: Income = {
          id: record.id || Date.now(),
          amount: record.price,
          category: record.class,
          date: record.date,
          note: record.note
        }
        this.incomes.push(newIncome)
        saveToStorage(STORAGE_KEY, this.incomes)
      } catch (error) {
        this.error = '新增收入失敗'
        console.error('新增收入失敗:', error)
        // API 失敗時仍存到本地
        this.incomes.push({
          id: Date.now(),
          amount,
          category,
          note,
          date: new Date().toLocaleString()
        })
        saveToStorage(STORAGE_KEY, this.incomes)
      } finally {
        this.isLoading = false
      }
    },

    async updateIncome(id: number, amount: number) {
      this.isLoading = true
      this.error = null
      const income = this.incomes.find(e => e.id === id)
      if (!income) return

      try {
        // 呼叫 API 修改
        await updateMoneyRecord(id, {
          price: amount,
          class: income.category,
          note: income.note || '',
          date: income.date,
          type: 2  // 2 = 收入
        })
        
        // 更新本地 state
        income.amount = amount
        saveToStorage(STORAGE_KEY, this.incomes)
      } catch (error) {
        this.error = '修改收入失敗'
        console.error('修改收入失敗:', error)
        // API 失敗時仍更新本地
        income.amount = amount
        saveToStorage(STORAGE_KEY, this.incomes)
      } finally {
        this.isLoading = false
      }
    },

    async deleteIncome(id: number) {
      this.isLoading = true
      this.error = null
      const index = this.incomes.findIndex(e => e.id === id)
      if (index === -1) return

      try {
        // 呼叫 API 刪除
        await deleteMoneyRecord(id)
        
        // 從本地 state 移除
        this.incomes.splice(index, 1)
        saveToStorage(STORAGE_KEY, this.incomes)
      } catch (error) {
        this.error = '刪除收入失敗'
        console.error('刪除收入失敗:', error)
        // API 失敗時仍從本地移除
        this.incomes.splice(index, 1)
        saveToStorage(STORAGE_KEY, this.incomes)
      } finally {
        this.isLoading = false
      }
    },
  },
  
  getters: {
    getIncomes: (state) => {
      return [...state.incomes].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },
    
    totalIncomes: (state) => {
      return state.incomes.reduce((sum, income) => sum + income.amount, 0)
    },
    
    incomesByCategory: (state) => {
      return (category: string) => {
        return state.incomes.filter(income => income.category === category)
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
