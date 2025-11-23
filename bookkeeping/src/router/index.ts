import { createRouter, createWebHistory } from 'vue-router'
import Expenses from '../components/Expenses.vue'
import Income from '../components/Income.vue'
import ExpenseHistory from '../components/ExpenseHistory.vue'
import IncomeHistory from '../components/IncomeHistory.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/input'
    },
    {
      path: '/input',
      name: 'expenses',
      component: Expenses
    },
    {
      path: '/income',
      name: 'income',
      component: Income
    },
    {
      path: '/history',
      name: 'history',
      component: ExpenseHistory
    },
    {
      path: '/income-history',
      name: 'income-history',
      component: IncomeHistory
    }
  ]
})

export default router