import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays, isAfter } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM yyyy', { locale: idLocale })
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMMM yyyy', { locale: idLocale })
}

export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale })
}

export function getDaysRemaining(dueDate: Date | string): number {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return differenceInDays(d, new Date())
}

export function isOverdue(dueDate: Date | string): boolean {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return isAfter(new Date(), d)
}

export function getBorrowStatusInfo(dueDate: Date | string): {
  label: string
  variant: 'success' | 'warning' | 'danger'
  daysText: string
} {
  const days = getDaysRemaining(dueDate)

  if (days < 0) {
    return {
      label: 'Terlambat',
      variant: 'danger',
      daysText: `Terlambat ${Math.abs(days)} Hari`,
    }
  } else if (days <= 3) {
    return {
      label: 'Segera',
      variant: 'warning',
      daysText: days === 0 ? 'Hari ini' : `${days} hari lagi`,
    }
  } else {
    return {
      label: 'Aktif',
      variant: 'success',
      daysText: `${days} hari lagi`,
    }
  }
}

export function generateMemberId(): string {
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, '0')
  return `PK-${num}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
