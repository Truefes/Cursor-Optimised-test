"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Calculator } from "lucide-react"
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
import { createBudgetSchema, CreateBudgetInput } from "@/lib/validations"
import { formatCurrency } from "@/lib/utils"

const defaultCategories = [
  { name: "Housing", icon: "🏠", color: "#3B82F6" },
  { name: "Food & Dining", icon: "🍽️", color: "#10B981" },
  { name: "Transportation", icon: "🚗", color: "#F59E0B" },
  { name: "Healthcare", icon: "🏥", color: "#EF4444" },
  { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { name: "Shopping", icon: "🛍️", color: "#EC4899" },
  { name: "Utilities", icon: "⚡", color: "#6B7280" },
  { name: "Savings", icon: "💰", color: "#059669" },
]

const categoryIcons = [
  "🏠", "🍽️", "🚗", "🏥", "🎬", "🛍️", "⚡", "💰", 
  "📚", "💅", "✈️", "🎁", "📦", "💳", "🛡️", "🎯"
]

const categoryColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
  "#6B7280", "#14B8A6", "#059669", "#DC2626", "#7C3AED", "#F97316",
  "#0EA5E9", "#84CC16", "#64748B", "#06B6D4"
]

interface CreateBudgetDialogProps {
  onBudgetCreated?: (budget: any) => void
}

export function CreateBudgetDialog({ onBudgetCreated }: CreateBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: "",
      description: "",
      totalAmount: 0,
      period: "monthly",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      categories: defaultCategories.map(cat => ({ ...cat, allocated: 0 }))
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories"
  })

  const watchedCategories = form.watch("categories")
  const watchedTotalAmount = form.watch("totalAmount")

  const totalAllocated = watchedCategories?.reduce((sum, cat) => sum + (cat.allocated || 0), 0) || 0
  const remaining = watchedTotalAmount - totalAllocated

  const handleAutoAllocate = () => {
    const categories = form.getValues("categories")
    const totalAmount = form.getValues("totalAmount")
    
    if (categories.length > 0 && totalAmount > 0) {
      const amountPerCategory = Math.floor((totalAmount / categories.length) * 100) / 100
      const remainder = totalAmount - (amountPerCategory * categories.length)
      
      categories.forEach((category, index) => {
        const allocation = index === 0 ? amountPerCategory + remainder : amountPerCategory
        form.setValue(`categories.${index}.allocated`, allocation)
      })
    }
  }

  const onSubmit = async (data: CreateBudgetInput) => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create budget")
      }

      const budget = await response.json()
      onBudgetCreated?.(budget)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error creating budget:", error)
      // You could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set up your zero-based budget by allocating every dollar to specific categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Budget Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input
                id="name"
                placeholder="e.g., January 2024 Budget"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Budget Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                placeholder="5000.00"
                {...form.register("totalAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.totalAmount && (
                <p className="text-sm text-red-600">{form.formState.errors.totalAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Budget Period</Label>
              <Select onValueChange={(value) => form.setValue("period", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this budget"
                {...form.register("description")}
              />
            </div>
          </div>

          {/* Budget Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Budget Allocation</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoAllocate}
                className="gap-2"
              >
                <Calculator className="h-4 w-4" />
                Auto Allocate
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Budget</p>
                <p className="font-semibold text-blue-600">{formatCurrency(watchedTotalAmount || 0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Allocated</p>
                <p className="font-semibold text-purple-600">{formatCurrency(totalAllocated)}</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining</p>
                <p className={`font-semibold ${remaining === 0 ? 'text-green-600' : remaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>
            {remaining !== 0 && (
              <p className="text-sm text-orange-600 mt-2">
                {remaining > 0 ? "You have unallocated funds." : "You've over-allocated your budget."}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Budget Categories</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", icon: "📦", color: "#64748B", allocated: 0 })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Icon Selector */}
                    <Select
                      onValueChange={(value) => form.setValue(`categories.${index}.icon`, value)}
                      defaultValue={field.icon}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryIcons.map(icon => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Category Name */}
                    <Input
                      placeholder="Category name"
                      className="flex-1"
                      {...form.register(`categories.${index}.name`)}
                    />

                    {/* Color Selector */}
                    <Select
                      onValueChange={(value) => form.setValue(`categories.${index}.color`, value)}
                      defaultValue={field.color}
                    >
                      <SelectTrigger className="w-20">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: form.watch(`categories.${index}.color`) }}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryColors.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Allocated Amount */}
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-28"
                      {...form.register(`categories.${index}.allocated`, { valueAsNumber: true })}
                    />

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              disabled={isLoading || remaining !== 0}
            >
              {isLoading ? "Creating..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}