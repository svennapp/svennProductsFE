'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Play, Pause, Calendar, FileText } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { API_ROUTES } from '@/lib/config'
import { format } from 'date-fns'
import type {
  Job,
  Script,
  RunScriptResponse,
  ScriptExecutionStatus,
} from '@/lib/types'
import { ScheduleModal } from './schedule-modal'
import { LogsModal } from './logs-modal'
import { useWarehouseScripts } from '@/hooks/use-warehouse-scripts'
import { Loader2 } from '@/components/ui/loader'

interface ScriptListProps {
  warehouseId: number
}

export function ScriptList({ warehouseId }: ScriptListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [runningScripts, setRunningScripts] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const { scripts, isLoading: scriptsLoading, error: scriptsError, mutate: mutateScripts } =
    useWarehouseScripts(warehouseId)

  useEffect(() => {
    if (scriptsError) {
      toast({
        title: 'Error',
        description: scriptsError,
        variant: 'destructive',
      })
    }
  }, [scriptsError, toast])

  const findScheduledJob = (jobs: Job[], scriptId: number) => {
    return jobs.find(
      (job) => job.script_id === scriptId && job.job_id.startsWith('script_')
    )
  }

  useEffect(() => {
    fetchJobs()
  }, [warehouseId])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<Job[]>(API_ROUTES.jobs({ scheduledOnly: true }))
      setJobs(data)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to load scheduled jobs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateScriptExecutionTime = async (scriptId: number, timestamp: string, status: string) => {
    // Optimistically update the script
    mutateScripts(
      scripts?.map(script => 
        script.id === scriptId 
          ? { 
              ...script, 
              last_execution_time: timestamp,
              lastExecution: {
                execution_id: 0, // Will be updated with real value
                script_id: scriptId,
                timestamp: timestamp,
                status: status as 'pending' | 'completed' | 'failed'
              }
            }
          : script
      )
    )

    try {
      const response = await apiClient.get<{
        items: Array<{
          execution_id: number,
          timestamp: string,
          execution_status: string
        }>
      }>(
        API_ROUTES.scriptLogs(scriptId, { skip: 0, limit: 1 })
      )
      
      if (response.items.length > 0) {
        mutateScripts(
          scripts?.map(script => 
            script.id === scriptId 
              ? { 
                  ...script, 
                  last_execution_time: response.items[0].timestamp,
                  lastExecution: {
                    execution_id: response.items[0].execution_id,
                    script_id: scriptId,
                    timestamp: response.items[0].timestamp,
                    status: response.items[0].execution_status as 'pending' | 'completed' | 'failed'
                  }
                }
              : script
          )
        )
      }
    } catch (error) {
      console.error('Failed to update script execution time:', error)
    }
  }

  const checkScriptStatus = async (scriptId: number, executionId: number) => {
    try {
      const statusResponse = await apiClient.get<ScriptExecutionStatus>(
        API_ROUTES.scriptExecutionStatus(executionId.toString())
      )

      if (statusResponse.status !== 'running') {
        // Store current scroll position
        const scrollPosition = window.scrollY

        // Update running scripts state
        setRunningScripts(prev => {
          const newSet = new Set(prev)
          newSet.delete(scriptId)
          return newSet
        })

        if (statusResponse.status === 'failed') {
          toast({
            title: 'Script Failed',
            description: statusResponse.error_message || 'Script execution failed',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Script execution completed successfully',
          })

          // Optimistically update the script execution time
          updateScriptExecutionTime(
            scriptId, 
            statusResponse.end_time || new Date().toISOString(),
            'completed'
          )
        }

        // Restore scroll position
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        })
        
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to check script status:', error)
      return false
    }
  }

  const handleRunNow = async (scriptId: number) => {
    try {
      setRunningScripts(prev => {
        const newSet = new Set(prev)
        newSet.add(scriptId)
        return newSet
      })
      
      const response = await apiClient.post<RunScriptResponse>(
        API_ROUTES.runScript(scriptId.toString())
      )

      toast({
        title: 'Script Started',
        description: 'Script execution has begun',
      })

      // Start polling for status
      const pollInterval = setInterval(async () => {
        const isComplete = await checkScriptStatus(scriptId, response.execution_id)
        if (isComplete) {
          clearInterval(pollInterval)
        }
      }, 3000)

    } catch (error) {
      setRunningScripts(prev => {
        const newSet = new Set(prev)
        newSet.delete(scriptId)
        return newSet
      })
      
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to run script',
        variant: 'destructive',
      })
    }
  }

  const handleToggleStatus = async (jobId: number) => {
    try {
      await apiClient.post<{ success: boolean }>(
        API_ROUTES.toggleJob(jobId.toString())
      )
      await fetchJobs()
      toast({
        title: 'Success',
        description: 'Job status updated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to toggle job status',
        variant: 'destructive',
      })
    }
  }

  const handleViewLogs = (script: Script) => {
    const hasRecentExecution = script.last_execution_time != null && script.lastExecution != null
    if (!hasRecentExecution) {
      toast({
        title: 'Error',
        description: 'No recent execution found for this script',
        variant: 'destructive',
      })
      return
    }

    setSelectedScript(script)
    setShowLogsModal(true)
  }

  if (loading || scriptsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading scripts...</p>
        </div>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Spiders Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Spiders</h2>
          <div className="space-y-4">
            {scripts
              .filter((script) => script.script_type === 'spider')
              .map((script) => {
                const job = findScheduledJob(jobs, script.id)
                const hasRecentExecution = script.last_execution_time != null

                return (
                  <Card key={script.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{script.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {script.description}
                        </p>
                        {job && (
                          <p className="mt-2 text-sm">
                            Schedule: <code>{job.cron_expression}</code>
                          </p>
                        )}
                        {hasRecentExecution && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Last run:{' '}
                            {script.last_execution_time && format(new Date(script.last_execution_time), 'dd.MM.yyyy, HH:mm:ss')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRunNow(script.id)}
                              disabled={runningScripts.has(script.id)}
                            >
                              {runningScripts.has(script.id) ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                'Run Now'
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Run script now</TooltipContent>
                        </Tooltip>

                        {job && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleToggleStatus(job.id)}
                              >
                                {job.enabled ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {job.enabled ? 'Pause schedule' : 'Resume schedule'}
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedScript(script)
                                const existingJob = findScheduledJob(jobs, script.id)
                                setSelectedScript({ ...script, job: existingJob })
                                setShowScheduleModal(true)
                              }}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Manage schedule</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewLogs(script)}
                              disabled={!hasRecentExecution}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {hasRecentExecution ? 'View logs' : 'No recent execution'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>

        {/* Processors Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Processors</h2>
          <div className="space-y-4">
            {scripts
              .filter((script) => script.script_type === 'python')
              .map((script) => {
                const job = findScheduledJob(jobs, script.id)
                const hasRecentExecution = script.last_execution_time != null

                return (
                  <Card key={script.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{script.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {script.description}
                        </p>
                        {job && (
                          <p className="mt-2 text-sm">
                            Schedule: <code>{job.cron_expression}</code>
                          </p>
                        )}
                        {hasRecentExecution && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Last run:{' '}
                            {script.last_execution_time && format(new Date(script.last_execution_time), 'dd.MM.yyyy, HH:mm:ss')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRunNow(script.id)}
                              disabled={runningScripts.has(script.id)}
                            >
                              {runningScripts.has(script.id) ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                'Run Now'
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Run script now</TooltipContent>
                        </Tooltip>

                        {job && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleToggleStatus(job.id)}
                              >
                                {job.enabled ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {job.enabled ? 'Pause schedule' : 'Resume schedule'}
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedScript(script)
                                const existingJob = findScheduledJob(jobs, script.id)
                                setSelectedScript({ ...script, job: existingJob })
                                setShowScheduleModal(true)
                              }}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Manage schedule</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewLogs(script)}
                              disabled={!hasRecentExecution}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {hasRecentExecution ? 'View logs' : 'No recent execution'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>

      {selectedScript && (
        <ScheduleModal
          script={selectedScript}
          job={selectedScript.job}
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          onSchedule={fetchJobs}
        />
      )}

      {selectedScript && selectedScript.lastExecution && (
        <LogsModal
          script={selectedScript}
          open={showLogsModal}
          onOpenChange={setShowLogsModal}
          executionId={selectedScript.lastExecution.execution_id}
        />
      )}
    </TooltipProvider>
  )
}
