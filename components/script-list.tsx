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
import type {
  Job,
  Script,
  RunScriptResponse,
} from '@/lib/types'
import { ScheduleModal } from './schedule-modal'
import { LogsModal } from './logs-modal'
import { useWarehouseScripts } from '@/hooks/use-warehouse-scripts'

interface ScriptListProps {
  warehouseId: number
}

export function ScriptList({ warehouseId }: ScriptListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const { toast } = useToast()
  const { scripts, isLoading: scriptsLoading, error: scriptsError } =
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
      const data = await apiClient.get<Job[]>(`${API_ROUTES.jobs}?scheduled_only=true`)
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

  const handleRunNow = async (scriptId: number) => {
    try {
      toast({
        title: 'Script Started',
        description: 'Script execution has begun',
      })

      const response = await apiClient.post<RunScriptResponse>(
        API_ROUTES.runScript(scriptId.toString())
      )

      if (response.status === 'completed') {
        toast({
          title: 'Success',
          description: 'Script execution completed successfully',
        })
      } else if (response.status === 'failed') {
        throw new Error(response.error || 'Script execution failed')
      }

      fetchJobs()
    } catch (error) {
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
      await apiClient.post<{ success: boolean }>(API_ROUTES.toggleJob(jobId.toString()))
      await fetchJobs()
      toast({
        title: 'Success',
        description: 'Job status updated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update job status',
        variant: 'destructive',
      })
    }
  }

  const handleViewLogs = (script: Script) => {
    const hasRecentExecution = script.last_execution_time != null
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
                            {script.last_execution_time && new Date(script.last_execution_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRunNow(script.id)}
                            >
                              <Play className="h-4 w-4" />
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
                            {script.last_execution_time && new Date(script.last_execution_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRunNow(script.id)}
                            >
                              <Play className="h-4 w-4" />
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
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          onSchedule={fetchJobs}
        />
      )}

      {selectedScript && (
        <LogsModal
          script={selectedScript}
          open={showLogsModal}
          onOpenChange={setShowLogsModal}
        />
      )}
    </TooltipProvider>
  )
}
