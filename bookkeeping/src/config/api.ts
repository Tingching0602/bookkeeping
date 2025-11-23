// API 路徑設定檔

export const API_CONFIG = {
  // API 基礎路徑
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5108',
  
  // API 端點
  endpoints: {
    // 收支記錄（統一端點，透過 type 區分）
    moneyRecords: '/Bookkeeping/MoneyRecords',
  },
  
  // 請求設定
  timeout: 10000, // 10秒
}

// 輔助函數：組合完整 URL
export function getFullURL(path: string): string {
  return `${API_CONFIG.baseURL}${path}`
}
