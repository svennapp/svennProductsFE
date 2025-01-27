'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { COMMON_SCHEDULES } from '@/lib/constants'
import { API_ROUTES } from '@/lib/config'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Script, Job } from '@/lib/types'

// Cron expression validation schema
const cronSchema = z.string().refine(
  (value) => {
    if (!value) return true

    // Split the cron expression into its components
    const parts = value.trim().split(/\s+/)

    if (parts.length !== 5) return false

    // Validation patterns for each part
    const patterns = {
      minute: /^(\*|(\*\/[1-9][0-9]?)|([0-9]|[1-5][0-9])(,[0-9]|[1-5][0-9])*)$/,
      hour: /^(\*|(\*\/[1-9][0-9]?)|([0-9]|1[0-9]|2[0-3])(,[0-9]|1[0-9]|2[0-3])*)$/,
      day: /^(\*|(\*\/[1-9][0-9]?)|([1-9]|[12][0-9]|3[01])(,[1-9]|[12][0-9]|3[01])*)$/,
      month: /^(\*|(\*\/[1-9][0-9]?)|([1-9]|1[0-2])(,[1-9]|1[0-2])*)$/,
      weekday: /^(\*|(\*\/[1-9][0-9]?)|([0-6])(,[0-6])*)$/,
    }

    const [minute, hour, day, month, weekday] = parts

    return (
      patterns.minute.test(minute) &&
      patterns.hour.test(hour) &&
      patterns.day.test(day) &&
      patterns.month.test(month) &&
      patterns.weekday.test(weekday)
    )
  },
  {
    message:
      'Invalid cron expression format. Use format: minute hour day month weekday',
  }
)

interface ScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  script: Script
  job?: Job
  onSchedule: () => void
}

export function ScheduleModal({
  open,
  onOpenChange,
  script,
  job,
  onSchedule,
}: ScheduleModalProps) {
  const [schedule, setSchedule] = useState('')
  const [customSchedule, setCustomSchedule] = useState(
    job?.cron_expression || ''
  )
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Update custom schedule when predefined schedule is selected
  useEffect(() => {
    if (schedule) {
      setCustomSchedule(schedule)
      setError(null)
    }
  }, [schedule])

  // Validate cron expression
  const validateCronExpression = (value: string): boolean => {
    try {
      cronSchema.parse(value)
      setError(null)
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      }
      return false
    }
  }

  const handleCustomScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setCustomSchedule(value)
    setSchedule('') // Clear predefined selection when custom input changes
    if (value) {
      validateCronExpression(value)
    } else {
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Don't submit if there's no schedule
    if (!customSchedule) {
      setError('Please select or enter a schedule')
      return
    }

    // Validate before submitting
    if (!validateCronExpression(customSchedule)) {
      return
    }

    try {
      // If we have an existing job, update it. Otherwise, create a new one.
      const method = job ? 'PUT' : 'POST'
      const url = job
        ? `${API_ROUTES.jobs()}/${job.id}`
        : API_ROUTES.jobs()

      // For updates, only send cron_expression
      // For new jobs, send script_id and cron_expression
      const body = job
        ? { cron_expression: customSchedule }
        : {
            script_id: script.id,
            cron_expression: customSchedule,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to update schedule')

      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      })
      onSchedule()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Script: {script.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Predefined Schedules</label>
            <Select
              value={schedule}
              onValueChange={(value) => {
                setSchedule(value)
                setCustomSchedule(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a schedule" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_SCHEDULES.map((schedule) => (
                  <SelectItem key={schedule.value} value={schedule.value}>
                    {schedule.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Schedule</label>
            <Input
              placeholder="Enter cron expression (e.g., 0 * * * *)"
              value={customSchedule}
              onChange={handleCustomScheduleChange}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Format: minute hour day month weekday
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!!error || !customSchedule}
          >
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
