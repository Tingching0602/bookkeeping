import { defineStore } from 'pinia'

type Repayment = {
  id: number
  amount: number
  category: string   // '卡債' | '貸款'
  date: string
  note?: string
  bank?: string
}

const STORAGE_KEY = 'bookkeeping_repayments'

export const useRepaymentStore = defineStore('repayment', {
  state: () => ({
    repayments: loadFromStorage<Repayment[]>(STORAGE_KEY, []),
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    addRepayment(amount: number, category: string, note?: string, bank?: string) {
      const newRepayment: Repayment = {
        id: Date.now(),
        amount,
        category,
        note,
        bank,
        date: new Date().toISOString()
      }
      this.repayments.push(newRepayment)
      saveToStorage(STORAGE_KEY, this.repayments)
    },

    updateRepayment(id: number, amount: number) {
      const repayment = this.repayments.find(r => r.id === id)
      if (!repayment) return
      repayment.amount = amount
      saveToStorage(STORAGE_KEY, this.repayments)
    },

    deleteRepayment(id: number) {
      const index = this.repayments.findIndex(r => r.id === id)
      if (index === -1) return
      this.repayments.splice(index, 1)
      saveToStorage(STORAGE_KEY, this.repayments)
    },
  },

  getters: {
    getRepayments: (state) => {
      return [...state.repayments].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },

    totalRepayments: (state) => {
      return state.repayments.reduce((sum, r) => sum + r.amount, 0)
    },

    totalByCategory: (state) => {
      return (category: string) =>
        state.repayments.filter(r => r.category === category).reduce((sum, r) => sum + r.amount, 0)
    },

    totalByBank: (state) => {
      return (bank: string) =>
        state.repayments.filter(r => r.bank === bank).reduce((sum, r) => sum + r.amount, 0)
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
