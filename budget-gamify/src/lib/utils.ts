import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function calculatePercentage(spent: number, budget: number): number {
  if (budget === 0) return 0
  return Math.round((spent / budget) * 100)
}

export function getBudgetStatus(spent: number, budget: number): 'under' | 'near' | 'over' {
  const percentage = calculatePercentage(spent, budget)
  if (percentage < 80) return 'under'
  if (percentage < 100) return 'near'
  return 'over'
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}