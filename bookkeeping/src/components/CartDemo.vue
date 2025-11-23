<template>
  <div class="cart-demo">
    <h2>購物車範例</h2>
    
    <!-- 商品列表 -->
    <div class="products">
      <h3>商品列表</h3>
      <div class="product-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          <div class="product-info">
            <h4>{{ product.name }}</h4>
            <p class="price">NT$ {{ product.price }}</p>
          </div>
          <button @click="addToCart(product)" class="btn-add">
            加入購物車
          </button>
        </div>
      </div>
    </div>

    <!-- 購物車 -->
    <div class="cart">
      <h3>購物車 ({{ cartStore.totalItems }} 件商品)</h3>
      
      <div v-if="cartStore.isEmpty" class="empty-cart">
        購物車是空的
      </div>
      
      <div v-else>
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="price">NT$ {{ item.price }}</p>
          </div>
          
          <div class="quantity-controls">
            <button @click="cartStore.decrementQuantity(item.id)" class="btn-qty">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="cartStore.incrementQuantity(item.id)" class="btn-qty">+</button>
          </div>
          
          <div class="item-total">
            NT$ {{ item.price * item.quantity }}
          </div>
          
          <button @click="cartStore.removeItem(item.id)" class="btn-remove">
            移除
          </button>
        </div>
        
        <div class="cart-summary">
          <div class="total">
            <strong>總計：</strong>
            <strong class="total-price">NT$ {{ cartStore.totalPrice }}</strong>
          </div>
          <button @click="cartStore.clearCart()" class="btn-clear">
            清空購物車
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()

// 範例商品資料
const products = ref([
  { id: 1, name: '筆記本', price: 50 },
  { id: 2, name: '原子筆', price: 15 },
  { id: 3, name: '橡皮擦', price: 10 },
  { id: 4, name: '尺', price: 25 },
  { id: 5, name: '剪刀', price: 35 }
])

function addToCart(product: typeof products.value[0]) {
  cartStore.addItem(product, 1)
}
</script>

<style scoped>
.cart-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #42b983;
  margin-bottom: 30px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
}

.products {
  margin-bottom: 40px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.3s;
}

.product-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-info h4 {
  margin: 0;
  color: #2c3e50;
}

.price {
  color: #42b983;
  font-weight: bold;
  margin: 5px 0;
}

.btn-add {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #35a372;
}

.cart {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.empty-cart {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
}

.cart-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 15px;
  align-items: center;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-qty {
  background-color: #42b983;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.btn-qty:hover {
  background-color: #35a372;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  color: #42b983;
  font-weight: bold;
  font-size: 16px;
}

.btn-remove {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-remove:hover {
  background-color: #ee5555;
}

.cart-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 18px;
}

.total-price {
  color: #42b983;
  font-size: 24px;
}

.btn-clear {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-clear:hover {
  background-color: #ee5555;
}

@media (max-width: 640px) {
  .product-list {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .cart-summary {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
