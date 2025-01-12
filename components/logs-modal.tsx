'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Log, Script } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { API_ROUTES } from '@/lib/config'

interface LogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  script: Script
  executionId?: number
}

export function LogsModal({
  open,
  onOpenChange,
  script,
  executionId,
}: LogsModalProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [level, setLevel] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && executionId) {
      fetchLogs()
    }
  }, [open, level, executionId])

  const fetchLogs = async () => {
    if (!executionId) {
      toast({
        title: 'Error',
        description: 'No execution ID provided',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (level !== 'all') params.append('level', level)

      const response = await apiClient.get(
        `${API_ROUTES.jobLogs(executionId.toString())}?${params}`
      )
      setLogs(response)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load logs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Logs: {script.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[400px] overflow-auto rounded border p-4">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading logs...
              </p>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 rounded p-2 ${
                    log.level === 'error'
                      ? 'bg-red-50 dark:bg-red-900/10'
                      : log.level === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/10'
                      : 'bg-gray-50 dark:bg-gray-900/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        log.level === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : log.level === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <p className="mt-1">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No logs found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
