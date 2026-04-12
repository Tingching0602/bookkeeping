import { defineStore } from 'pinia'

type Debt = {
  id: number
  amount: number
  category: string   // '卡債' | '貸款'
  date: string
  note?: string
  bank?: string
}

const STORAGE_KEY = 'bookkeeping_debts'

export const useDebtStore = defineStore('debt', {
  state: () => ({
    debts: loadFromStorage<Debt[]>(STORAGE_KEY, []),
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    addDebt(amount: number, category: string, note?: string, bank?: string) {
      const newDebt: Debt = {
        id: Date.now(),
        amount,
        category,
        note,
        bank,
        date: new Date().toISOString()
      }
      this.debts.push(newDebt)
      saveToStorage(STORAGE_KEY, this.debts)
    },

    updateDebt(id: number, amount: number) {
      const debt = this.debts.find(d => d.id === id)
      if (!debt) return
      debt.amount = amount
      saveToStorage(STORAGE_KEY, this.debts)
    },

    deleteDebt(id: number) {
      const index = this.debts.findIndex(d => d.id === id)
      if (index === -1) return
      this.debts.splice(index, 1)
      saveToStorage(STORAGE_KEY, this.debts)
    },
  },

  getters: {
    getDebts: (state) => {
      return [...state.debts].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },

    totalDebts: (state) => {
      return state.debts.reduce((sum, d) => sum + d.amount, 0)
    },

    debtsByCategory: (state) => {
      return (category: string) => state.debts.filter(d => d.category === category)
    },

    totalByCategory: (state) => {
      return (category: string) =>
        state.debts.filter(d => d.category === category).reduce((sum, d) => sum + d.amount, 0)
    },

    totalByBank: (state) => {
      return (bank: string) =>
        state.debts.filter(d => d.bank === bank).reduce((sum, d) => sum + d.amount, 0)
    },

    categories: () => ['卡債', '貸款'] as const
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
