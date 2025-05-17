export interface Task {
  _id: string
  title: string
  description: string
  priority: string // urgent-important, not-urgent-important, urgent-not-important, not-urgent-not-important
  category: string // work, study, startup, personal
  completed: boolean
  dueDate: string
  createdAt?: string
  updatedAt?: string
}

export interface TimeBlock {
  _id: string
  title: string
  category: string
  startTime: string
  endTime: string
  createdAt?: string
  updatedAt?: string
}

export interface Habit {
  _id: string
  name: string
  description: string
  frequency: string // daily, weekly
  streak: number
  completedToday: boolean
  history: {
    date: string
    completed: boolean
  }[]
  createdAt?: string
  updatedAt?: string
}

export interface Goal {
  _id: string
  title: string
  description: string
  category: string
  targetDate: string
  progress: number // 0-100
  metrics: {
    name: string
    target: number
    current: number
  }[]
  createdAt?: string
  updatedAt?: string
}

export interface JournalEntry {
  _id: string
  date: string
  content: string
  mood: string
  lessons: string[]
  createdAt?: string
  updatedAt?: string
}

export interface DailyLog {
  _id: string
  date: string
  sleep: number
  energy: number // 1-10
  mood: string
  distractions: string[]
  timeSpent: {
    category: string
    minutes: number
  }[]
  createdAt?: string
  updatedAt?: string
}
