import { defineStore } from 'pinia'

// 購物車商品介面
export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

const STORAGE_KEY = 'cart-items'

// 從 localStorage 讀取
function loadFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('載入購物車資料失敗:', error)
    return []
  }
}

// 儲存到 localStorage
function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('儲存購物車資料失敗:', error)
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadFromStorage() as CartItem[]
  }),

  getters: {
    // 購物車總數量
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    // 購物車總金額
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },

    // 是否為空購物車
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    // 新增商品到購物車
    addItem(product: Omit<CartItem, 'quantity'>, quantity: number = 1) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // 如果商品已存在，增加數量
        existingItem.quantity += quantity
      } else {
        // 新增商品
        this.items.push({
          ...product,
          quantity
        })
      }
      
      saveToStorage(this.items)
    },

    // 移除購物車商品
    removeItem(id: number) {
      const index = this.items.findIndex(item => item.id === id)
      if (index !== -1) {
        this.items.splice(index, 1)
        saveToStorage(this.items)
      }
    },

    // 更新商品數量
    updateQuantity(id: number, quantity: number) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        if (quantity <= 0) {
          // 數量為 0 或負數時，移除商品
          this.removeItem(id)
        } else {
          item.quantity = quantity
          saveToStorage(this.items)
        }
      }
    },

    // 增加商品數量
    incrementQuantity(id: number) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.quantity++
        saveToStorage(this.items)
      }
    },

    // 減少商品數量
    decrementQuantity(id: number) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          saveToStorage(this.items)
        } else {
          // 數量為 1 時再減就移除商品
          this.removeItem(id)
        }
      }
    },

    // 清空購物車
    clearCart() {
      this.items = []
      saveToStorage(this.items)
    },

    // 檢查商品是否在購物車中
    isInCart(id: number): boolean {
      return this.items.some(item => item.id === id)
    },

    // 取得特定商品的數量
    getItemQuantity(id: number): number {
      const item = this.items.find(item => item.id === id)
      return item ? item.quantity : 0
    }
  }
})
