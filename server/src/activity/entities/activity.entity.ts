/**
 * 活动实体
 */

export interface Activity {
  id: string
  title: string
  category: '文体娱乐' | '健康养生' | '社区服务'
  imageUrl: string
  date: string
  time: string
  location: string
  description: string
  status: 'available' | 'full' | 'signed'
  capacity: number
  enrolled: number
  createdAt: string
  updatedAt: string
}

export type CreateActivityDto = Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'enrolled'>

export type UpdateActivityDto = Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
