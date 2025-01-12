"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { COMMON_SCHEDULES } from '@/lib/constants';
import type { Script } from '@/lib/types';

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: Script;
  onSchedule: () => void;
}

export function ScheduleModal({
  open,
  onOpenChange,
  script,
  onSchedule,
}: ScheduleModalProps) {
  const [schedule, setSchedule] = useState('');
  const [customSchedule, setCustomSchedule] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/jobs/${script.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cron_expression: schedule || customSchedule,
        }),
      });

      if (!response.ok) throw new Error('Failed to update schedule');

      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      });
      onSchedule();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

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
                setSchedule(value);
                setCustomSchedule('');
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
              placeholder="Enter cron expression"
              value={customSchedule}
              onChange={(e) => {
                setCustomSchedule(e.target.value);
                setSchedule('');
              }}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!schedule && !customSchedule}
          >
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}