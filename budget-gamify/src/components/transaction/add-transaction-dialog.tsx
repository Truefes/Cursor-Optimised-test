"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Calendar, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createTransactionSchema, CreateTransactionInput } from "@/lib/validations"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Budget {
  id: string
  name: string
  categories: {
    id: string
    name: string
    icon: string
    color: string
    allocated: number
    spent: number
  }[]
}

interface AddTransactionDialogProps {
  budgets?: Budget[]
  selectedBudgetId?: string
  selectedCategoryId?: string
  onTransactionAdded?: (transaction: any) => void
}

export function AddTransactionDialog({ 
  budgets = [], 
  selectedBudgetId, 
  selectedCategoryId, 
  onTransactionAdded 
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableBudgets, setAvailableBudgets] = useState<Budget[]>(budgets)

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
      budgetId: selectedBudgetId || "",
      categoryId: selectedCategoryId || "",
      isRecurring: false,
      frequency: undefined,
      attachments: []
    }
  })

  const watchedBudgetId = form.watch("budgetId")
  const watchedIsRecurring = form.watch("isRecurring")

  const selectedBudget = availableBudgets.find(b => b.id === watchedBudgetId)
  const availableCategories = selectedBudget?.categories || []

  // Fetch budgets if not provided
  useEffect(() => {
    if (budgets.length === 0) {
      fetchBudgets()
    }
  }, [budgets])

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
      if (response.ok) {
        const data = await response.json()
        setAvailableBudgets(data)
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
    }
  }

  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add transaction")
      }

      const transaction = await response.json()
      onTransactionAdded?.(transaction)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error adding transaction:", error)
      // You could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  // Reset category when budget changes
  useEffect(() => {
    if (watchedBudgetId && !selectedCategoryId) {
      form.setValue("categoryId", "")
    }
  }, [watchedBudgetId, form, selectedCategoryId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record a new expense or income transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping at Whole Foods"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", { 
                valueAsDate: true,
                setValueAs: (value) => value ? new Date(value) : new Date()
              })}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Budget Selection */}
          <div className="space-y-2">
            <Label>Budget</Label>
            <Select 
              onValueChange={(value) => form.setValue("budgetId", value)}
              value={form.watch("budgetId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a budget" />
              </SelectTrigger>
              <SelectContent>
                {availableBudgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.budgetId && (
              <p className="text-sm text-red-600">{form.formState.errors.budgetId.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              onValueChange={(value) => form.setValue("categoryId", value)}
              value={form.watch("categoryId")}
              disabled={!watchedBudgetId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => {
                  const remaining = category.allocated - category.spent
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatCurrency(remaining)} left
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          {/* Recurring Transaction */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                {...form.register("isRecurring")}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isRecurring">This is a recurring transaction</Label>
            </div>
          </div>

          {/* Frequency (shown only if recurring) */}
          {watchedIsRecurring && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select onValueChange={(value) => form.setValue("frequency", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Budget Impact Preview */}
          {watchedBudgetId && form.watch("categoryId") && form.watch("amount") > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Budget Impact</h4>
              {(() => {
                const category = availableCategories.find(c => c.id === form.watch("categoryId"))
                const amount = form.watch("amount")
                if (category) {
                  const newSpent = category.spent + amount
                  const remaining = category.allocated - newSpent
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Category: {category.name}</span>
                        <span>{category.icon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current spent:</span>
                        <span>{formatCurrency(category.spent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After this transaction:</span>
                        <span>{formatCurrency(newSpent)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Remaining:</span>
                        <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      {remaining < 0 && (
                        <p className="text-red-600 text-xs mt-1">
                          ⚠️ This will exceed your budget for this category
                        </p>
                      )}
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}