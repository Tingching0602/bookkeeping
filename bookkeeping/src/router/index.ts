import { createRouter, createWebHistory } from 'vue-router'
import Expenses from '../components/Expenses.vue'
import Income from '../components/Income.vue'
import ExpenseHistory from '../components/ExpenseHistory.vue'
import IncomeHistory from '../components/IncomeHistory.vue'
import Debt from '../components/Debt.vue'
import DebtHistory from '../components/DebtHistory.vue'
import Repayment from '../components/Repayment.vue'
import RepaymentHistory from '../components/RepaymentHistory.vue'

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
      path: '/debt',
      name: 'debt',
      component: Debt
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
    },
    {
      path: '/debt-history',
      name: 'debt-history',
      component: DebtHistory
    },
    {
      path: '/repayment',
      name: 'repayment',
      component: Repayment
    },
    {
      path: '/repayment-history',
      name: 'repayment-history',
      component: RepaymentHistory
    }
  ]
})

export default router