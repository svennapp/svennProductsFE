// lib/config.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ROUTES = {
  jobs: ({ scheduledOnly }: { scheduledOnly?: boolean } = {}) => 
    `${API_BASE_URL}/api/jobs${scheduledOnly ? '?scheduled_only=true' : ''}`,
  scripts: `${API_BASE_URL}/api/scripts`,
  warehouses: `${API_BASE_URL}/api/warehouses`,
  warehouseScripts: (warehouseId: number) => 
    `${API_BASE_URL}/api/warehouses/${warehouseId}/scripts`,
  runScript: (scriptId: string) => 
    `${API_BASE_URL}/api/run_now/${scriptId}`,
  scriptExecutionStatus: (executionId: string) => 
    `${API_BASE_URL}/api/jobs/execution/${executionId}/status`,
  toggleJob: (jobId: string) => 
    `${API_BASE_URL}/api/jobs/${jobId}/toggle`,
  jobLogs: (executionId: string) =>
    `${API_BASE_URL}/api/jobs/executions/${executionId}/logs`,
  scriptLastExecution: (scriptId: number) => 
    `${API_BASE_URL}/api/jobs/scripts/${scriptId}/logs?skip=0&limit=1`,
  scriptLogs: (scriptId: number, { skip, limit }: { skip?: number; limit?: number } = {}) => {
    const params = new URLSearchParams()
    if (typeof skip !== 'undefined') params.append('skip', skip.toString())
    if (typeof limit !== 'undefined') params.append('limit', limit.toString())
    const queryString = params.toString()
    return `${API_BASE_URL}/api/jobs/scripts/${scriptId}/logs${queryString ? `?${queryString}` : ''}`
  }
} as const
