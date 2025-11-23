import { API_CONFIG, getFullURL } from '../config/api'

// API 資料型別定義
export interface MoneyRecordDTO {
  price: number
  class: string
  note?: string
  date: string
  type: 1 | 2  // 1:支出, 2:收入
}

export interface MoneyRecordResponse extends MoneyRecordDTO {
  id?: number
  // API 可能回傳的其他欄位
}

// 取得所有收支記錄
export async function getMoneyRecords(): Promise<MoneyRecordResponse[]> {
  try {
    const url = getFullURL(API_CONFIG.endpoints.moneyRecords)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('取得記錄失敗:', error)
    throw error
  }
}

// 新增收支記錄
export async function createMoneyRecord(record: MoneyRecordDTO): Promise<MoneyRecordResponse> {
  try {
    const url = getFullURL(API_CONFIG.endpoints.moneyRecords)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('新增記錄失敗:', error)
    throw error
  }
}

// 修改收支記錄
export async function updateMoneyRecord(id: number, record: MoneyRecordDTO): Promise<MoneyRecordResponse> {
  try {
    const url = getFullURL(`${API_CONFIG.endpoints.moneyRecords}/${id}`)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('修改記錄失敗:', error)
    throw error
  }
}

// 刪除收支記錄
export async function deleteMoneyRecord(id: number): Promise<void> {
  try {
    const url = getFullURL(`${API_CONFIG.endpoints.moneyRecords}/${id}`)
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('刪除記錄失敗:', error)
    throw error
  }
}
