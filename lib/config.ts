// lib/config.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ROUTES = {
  jobs: `${API_BASE_URL}/api/jobs`,
  scripts: `${API_BASE_URL}/api/scripts`,
  warehouses: `${API_BASE_URL}/api/warehouses`,
  runScript: (scriptId: string) => `${API_BASE_URL}/api/run_now/${scriptId}`,
  toggleJob: (jobId: string) => `${API_BASE_URL}/api/jobs/${jobId}/toggle`,
  jobLogs: (executionId: string) =>
    `${API_BASE_URL}/api/jobs/executions/${executionId}/logs`,
} as const
