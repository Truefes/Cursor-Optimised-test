"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CreateBudgetDialog } from "@/components/budget/create-budget-dialog"
import { AddTransactionDialog } from "@/components/transaction/add-transaction-dialog"
import { formatCurrency, calculatePercentage, getBudgetStatus } from "@/lib/utils"
import { BarChart3, TrendingUp, Target, Plus, Settings } from "lucide-react"

interface Budget {
  id: string
  name: string
  totalAmount: number
  period: string
  startDate: string
  endDate: string
  categories: {
    id: string
    name: string
    icon: string
    color: string
    allocated: number
    spent: number
  }[]
  transactions: {
    id: string
    amount: number
    description: string
    date: string
    category: {
      name: string
      icon: string
    }
  }[]
  _count: {
    transactions: number
  }
}

interface UserStats {
  level: number
  points: number
  streak: number
  achievements: {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
  }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch budgets
      const budgetsResponse = await fetch("/api/budgets")
      if (budgetsResponse.ok) {
        const budgetsData = await budgetsResponse.json()
        setBudgets(budgetsData)
        if (budgetsData.length > 0 && !selectedBudget) {
          setSelectedBudget(budgetsData[0])
        }
      }

      // Fetch user stats (we'll create this API later)
      // For now, use mock data
      setUserStats({
        level: 3,
        points: 1250,
        streak: 7,
        achievements: [
          {
            id: "1",
            name: "First Steps",
            description: "Created your first budget",
            icon: "🎯",
            unlockedAt: new Date().toISOString()
          }
        ]
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBudgetCreated = (newBudget: Budget) => {
    setBudgets(prev => [newBudget, ...prev])
    setSelectedBudget(newBudget)
  }

  const handleTransactionAdded = (transaction: any) => {
    // Refresh the selected budget to show updated spending
    if (selectedBudget) {
      fetchDashboardData()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Calculate totals for current budget
  const currentBudget = selectedBudget
  const totalBudget = currentBudget?.totalAmount || 0
  const totalSpent = currentBudget?.categories.reduce((sum, cat) => sum + cat.spent, 0) || 0
  const totalRemaining = totalBudget - totalSpent
  const spentPercentage = calculatePercentage(totalSpent, totalBudget)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {session.user?.name || "User"}!</p>
            </div>
          </div>
          
          {/* User Level & Points */}
          <div className="flex items-center space-x-4">
            {userStats && (
              <>
                <div className="level-badge">
                  Level {userStats.level}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{userStats.points} XP</div>
                  <div className="text-xs text-gray-600">🔥 {userStats.streak} day streak</div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <CreateBudgetDialog onBudgetCreated={handleBudgetCreated} />
          <AddTransactionDialog 
            budgets={budgets}
            selectedBudgetId={selectedBudget?.id}
            onTransactionAdded={handleTransactionAdded}
          />
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>

        {budgets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Budget</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started with zero-based budgeting by creating your first budget. 
              Allocate every dollar to specific categories and take control of your finances.
            </p>
            <CreateBudgetDialog onBudgetCreated={handleBudgetCreated} />
          </div>
        ) : (
          <>
            {/* Budget Selector */}
            {budgets.length > 1 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Select Budget</h2>
                <div className="flex flex-wrap gap-2">
                  {budgets.map(budget => (
                    <Button
                      key={budget.id}
                      variant={selectedBudget?.id === budget.id ? "default" : "outline"}
                      onClick={() => setSelectedBudget(budget)}
                      className="text-sm"
                    >
                      {budget.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="budget-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Budget</CardTitle>
                  <CardDescription>
                    {currentBudget?.period} budget • {currentBudget?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(totalBudget)}
                  </div>
                </CardContent>
              </Card>

              <Card className="budget-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Spent</CardTitle>
                  <CardDescription>{spentPercentage.toFixed(1)}% of budget used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatCurrency(totalSpent)}
                  </div>
                  <Progress value={spentPercentage} className="h-2" />
                </CardContent>
              </Card>

              <Card className="budget-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Remaining</CardTitle>
                  <CardDescription>Available to spend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalRemaining)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Categories */}
              <div className="lg:col-span-2">
                <Card className="budget-card">
                  <CardHeader>
                    <CardTitle>Budget Categories</CardTitle>
                    <CardDescription>Track spending across different categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentBudget?.categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No categories in this budget</p>
                    ) : (
                      <div className="space-y-4">
                        {currentBudget?.categories.map((category, index) => {
                          const percentage = calculatePercentage(category.spent, category.allocated)
                          const status = getBudgetStatus(category.spent, category.allocated)
                          const statusClass = `budget-status-${status}`
                          
                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{category.icon}</span>
                                  <div>
                                    <h4 className="font-medium">{category.name}</h4>
                                    <p className="text-sm text-gray-600">
                                      {formatCurrency(category.spent)} of {formatCurrency(category.allocated)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
                                    {percentage.toFixed(0)}%
                                  </div>
                                  <AddTransactionDialog
                                    budgets={budgets}
                                    selectedBudgetId={currentBudget?.id}
                                    selectedCategoryId={category.id}
                                    onTransactionAdded={handleTransactionAdded}
                                  />
                                </div>
                              </div>
                              <Progress 
                                value={percentage} 
                                className="h-2" 
                                style={{ 
                                  "--progress-background": category.color + "20",
                                  "--progress-foreground": category.color 
                                } as React.CSSProperties}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Achievements */}
                {userStats?.achievements && userStats.achievements.length > 0 && (
                  <Card className="budget-card">
                    <CardHeader>
                      <CardTitle>Recent Achievements</CardTitle>
                      <CardDescription>Your latest accomplishments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userStats.achievements.slice(0, 3).map((achievement) => (
                          <div key={achievement.id} className="achievement-badge">
                            <span className="mr-2">{achievement.icon}</span>
                            {achievement.name}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Transactions */}
                {currentBudget?.transactions && currentBudget.transactions.length > 0 && (
                  <Card className="budget-card">
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Latest activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentBudget.transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span>{transaction.category.icon}</span>
                              <span className="truncate">{transaction.description}</span>
                            </div>
                            <span className="font-medium text-red-600">
                              -{formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Level Progress */}
                {userStats && (
                  <Card className="budget-card">
                    <CardHeader>
                      <CardTitle>Level Progress</CardTitle>
                      <CardDescription>Keep going to reach Level {userStats.level + 1}!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level {userStats.level}</span>
                          <span>Level {userStats.level + 1}</span>
                        </div>
                        <Progress value={75} className="h-3" />
                        <p className="text-xs text-gray-600 text-center">
                          250 XP to next level
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}