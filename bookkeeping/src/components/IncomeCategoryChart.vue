<template>
  <div class="chart-card">
    <div class="chart-controls">
      <div class="filter-group">
        <label>起始：</label>
        <input type="date" v-model="startDate" />
        <label>結束：</label>
        <input type="date" v-model="endDate" />
      </div>
      <button 
        @click="chartType = 'bar'" 
        :class="{ active: chartType === 'bar' }"
      >長條圖</button>
      <button 
        @click="chartType = 'pie'" 
        :class="{ active: chartType === 'pie' }"
      >圓餅圖</button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { 
  Chart, 
  BarController, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  ArcElement,
  PieController
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useIncomeStore } from '../stores/incomeStore'

Chart.register(
  BarController, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  ArcElement,
  PieController,
  ChartDataLabels
)

const canvas = ref<HTMLCanvasElement | null>(null)
const store = useIncomeStore()
const chartType = ref<'bar' | 'pie'>('bar')
const startDate = ref<string>('')
const endDate = ref<string>('')
let chart: Chart | null = null

function buildChart() {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')!
  const data = aggregateByCategoryFiltered()
  const labels = Object.keys(data)
  const values = Object.values(data)
  
  // Don't render chart if no data
  if (values.length === 0) {
    if (chart) {
      chart.destroy()
      chart = null
    }
    return
  }

  const total = values.reduce((sum, v) => sum + v, 0)
  const colors = [
    'rgba(34,197,94,0.8)',
    'rgba(59,130,246,0.8)',
    'rgba(249,115,22,0.8)',
    'rgba(239,68,68,0.8)',
    'rgba(168,85,247,0.8)',
    'rgba(234,179,8,0.8)'
  ]

  if (chart) {
    chart.destroy()
  }

  const config: any = {
    type: chartType.value,
      data: {
      labels: labels.map((label: string) => {
        return chartType.value === 'pie' ? `${label}` : label
      }),
      datasets: [
        {
          label: '每分類總額',
          data: values,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 0
        }
      ]
    },
      options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: chartType.value === 'pie' ? 1.8 : 1.5,
      plugins: {
        legend: {
          position: chartType.value === 'pie' ? 'right' as const : 'bottom' as const,
          align: 'center' as const,
          labels: {
            padding: chartType.value === 'pie' ? 20 : 12,
            boxWidth: 12,
            usePointStyle: true,
            font: {
              size: 13
            },
            generateLabels: (chart: any) => {
              const data = chart.data
              if (data.labels?.length && data.datasets?.length && chartType.value === 'pie') {
                return data.labels.map((label: string, i: number) => {
                  const value = (data.datasets[0].data?.[i] as number) ?? 0
                  const percentage = ((value / total) * 100).toFixed(1)
                  return {
                    text: `${label} $${value} (${percentage}%)`,
                    fillStyle: colors[i % colors.length],
                    strokeStyle: colors[i % colors.length],
                    lineWidth: 0,
                    hidden: false,
                    index: i,
                    usePointStyle: true
                  }
                })
              }
              return []
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `$${value} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          display: chartType.value === 'pie',
          color: '#fff',
          formatter: (value: number) => {
            if (chartType.value !== 'pie') return ''
            const percent = total > 0 ? (value / total) * 100 : 0
            return `${percent.toFixed(1)}%`
          },
          font: {
            weight: 'bold' as const
          }
        }
      },
      ...(chartType.value === 'bar' ? {
        scales: {
          y: { 
            beginAtZero: true,
            grid: {
              drawBorder: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      } : {}),
      layout: {
        padding: {
          top: 0,
          right: 0,
          bottom: chartType.value === 'pie' ? 0 : 10,
          left: 0
        }
      }
    }
  }

  chart = new Chart(ctx, config)
}

function parseDateFlexible(dateStr: string): Date | null {
  if (!dateStr) return null
  
  // First try direct parse
  let d = new Date(dateStr)
  if (!isNaN(d.getTime())) return d
  
  // Try to parse various locale string formats
  // Match: "2025/11/6 下午3:45:30" or "2025/11/6 上午10:23:15" etc
  const localeMatch = dateStr.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})[日\s]*(.*)/)
  if (localeMatch) {
    const [_, year, month, day, timeStr] = localeMatch
    // Extract time if present
    const timeMatch = timeStr?.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
    if (timeMatch) {
      const [__, h, min, s] = timeMatch
      // Check for 下午 (PM) or 上午 (AM)
      let hour = Number(h)
      if (timeStr && timeStr.includes('下午') && hour < 12) hour += 12
      if (timeStr && timeStr.includes('上午') && hour === 12) hour = 0
      return new Date(Number(year), Number(month) - 1, Number(day), hour, Number(min), Number(s) || 0)
    }
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  
  return null
}

function aggregateByCategoryFiltered() {
  // Filter incomes by custom date range
  let filtered = store.incomes
  let from: Date | null = startDate.value ? new Date(startDate.value + 'T00:00:00') : null
  let to: Date | null = endDate.value ? new Date(endDate.value + 'T23:59:59') : null
  filtered = filtered.filter(e => {
    if (!e.date) return false
    const d = parseDateFlexible(e.date)
    if (!d) {
      // eslint-disable-next-line no-console
      console.warn('無法解析日期', e.date)
      return false
    }
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
  const map: Record<string, number> = {}
  filtered.forEach(e => {
    const c = e.category || '其他'
    map[c] = (map[c] || 0) + (e.amount || 0)
  })
  // eslint-disable-next-line no-console
  console.log('篩選後資料', filtered, map)
  return map
}

onMounted(() => {
  buildChart()
})

watch([() => store.incomes.length, chartType, startDate, endDate], () => {
  buildChart()
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(16,24,40,0.06);
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.chart-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex: 0 0 auto;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-group label {
  font-size: 14px;
  color: #374151;
}
.filter-group input[type="date"] {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
}
.chart-controls button {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}
.chart-controls button:hover {
  border-color: #22c55e;
  color: #22c55e;
}
.chart-controls button.active {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}
.chart-card canvas {
  flex: 1;
  max-height: calc(100% - 50px);
  width: 100%;
  display: block;
}

:deep(.chartjs-legend-right) {
  padding-left: 20px !important;
  justify-content: flex-start !important;
}
</style>
