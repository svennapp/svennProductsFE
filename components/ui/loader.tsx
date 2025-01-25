'use client'

import { Loader2 as LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideProps } from 'lucide-react'

export function Loader2({ className, ...props }: LucideProps) {
  return (
    <LoaderIcon
      className={cn('h-4 w-4 animate-spin', className)}
      {...props}
    />
  )
}
