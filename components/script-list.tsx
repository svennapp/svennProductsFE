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
import { Play, Pause, Calendar, FileText, Download } from 'lucide-react'
import { SCRIPTS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import { API_ROUTES } from '@/lib/config'
import type {
  Job,
  Script,
  Warehouse,
  RunScriptResponse,
  ScriptExecution,
} from '@/lib/types'
import { ScheduleModal } from './schedule-modal'
import { LogsModal } from './logs-modal'

interface ScriptListProps {
  warehouse: Warehouse
}

export function ScriptList({ warehouse }: ScriptListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [scriptExecutions, setScriptExecutions] = useState<
    Record<number, ScriptExecution>
  >({})
  const { toast } = useToast()

  const warehouseScripts = SCRIPTS.filter(
    (script) => script.warehouse === warehouse
  )

  useEffect(() => {
    fetchJobs()
  }, [warehouse])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get(`${API_ROUTES.jobs}?scheduled_only=true`)
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

  const handleRunNow = async (scriptId: string) => {
    try {
      const response: RunScriptResponse = await apiClient.post(
        API_ROUTES.runScript(scriptId)
      )

      if (response.status === 'completed') {
        // Store the execution information
        setScriptExecutions((prev) => ({
          ...prev,
          [parseInt(scriptId)]: {
            execution_id: response.execution_id,
            script_id: parseInt(scriptId),
            timestamp: new Date().toISOString(),
            status: response.status,
          },
        }))

        toast({
          title: 'Success',
          description: 'Script execution started',
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

  const handleToggleStatus = async (jobId: string) => {
    try {
      const response = await apiClient.post(API_ROUTES.toggleJob(jobId))
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

  const handleDownloadLogs = async (scriptId: string | number) => {
    try {
      // Assuming your API provides an endpoint for downloading logs
      const response = await fetch(
        `${API_ROUTES.scripts}/${scriptId}/logs/download`
      )
      if (!response.ok) throw new Error('Failed to download logs')

      // Create a blob from the response and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `script_${scriptId}_logs.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to download logs',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading scripts...</p>
        </div>
      </Card>
    )
  }
  const handleViewLogs = (script: Script) => {
    const execution = scriptExecutions[script.id]
    if (!execution) {
      toast({
        title: 'Error',
        description: 'No recent execution found for this script',
        variant: 'destructive',
      })
      return
    }
    setSelectedScript({ ...script, lastExecution: execution })
    setShowLogsModal(true)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {warehouseScripts.map((script) => {
          const job = jobs.find((j) => j.script_id === script.id)
          const hasRecentExecution = !!scriptExecutions[script.id]

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
                      {new Date(
                        scriptExecutions[script.id].timestamp
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRunNow(script.id.toString())}
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
                          onClick={() => handleToggleStatus(job.job_id)}
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

                  {/* ... other buttons ... */}
                </div>
              </div>
            </Card>
          )
        })}

        {selectedScript && (
          <>
            <ScheduleModal
              open={showScheduleModal}
              onOpenChange={setShowScheduleModal}
              script={selectedScript}
              onSchedule={fetchJobs}
            />
            <LogsModal
              open={showLogsModal}
              onOpenChange={setShowLogsModal}
              script={selectedScript}
              executionId={selectedScript.lastExecution?.execution_id}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
