// lib/types.ts

// Warehouse Types
export type Warehouse = 'byggmakker' | 'monter' | 'maxbo'

export interface Script {
  id: number // Changed from string to number
  name: string
  description: string
  warehouse: Warehouse
  filename: string
}

export interface Job {
  id: number
  job_id: string
  script_id: number // This should be a number
  cron_expression: string
  enabled: boolean
  created_at: string
}

export interface Log {
  id: number
  level: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
}

export interface LogFilters {
  level?: string
  skip?: number
  limit?: number
}

export interface ScriptExecution {
  execution_id: number
  script_id: number
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
}

export interface RunScriptResponse {
  message: string
  job_id: number
  execution_id: number
  status: 'completed' | 'failed'
  error?: string
}

export interface Script {
  id: number
  name: string
  description: string
  warehouse: Warehouse
  filename: string
  lastExecution?: ScriptExecution // Add this to track last execution
}
