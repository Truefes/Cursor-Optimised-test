"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const { data: session, status } = useSession()

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

  // Mock data for demonstration
  const mockData = {
    totalBudget: 5000,
    totalSpent: 3200,
    totalRemaining: 1800,
    categories: [
      { name: "Housing", allocated: 1500, spent: 1500, icon: "🏠", color: "#3B82F6" },
      { name: "Food", allocated: 800, spent: 650, icon: "🍽️", color: "#10B981" },
      { name: "Transportation", allocated: 400, spent: 320, icon: "🚗", color: "#F59E0B" },
      { name: "Entertainment", allocated: 300, spent: 180, icon: "🎬", color: "#8B5CF6" },
      { name: "Shopping", allocated: 200, spent: 150, icon: "🛍️", color: "#EC4899" },
    ],
    user: {
      level: 3,
      points: 1250,
      streak: 7,
      achievements: ["First Budget", "Week Warrior", "Transaction Master"]
    }
  }

  const spentPercentage = (mockData.totalSpent / mockData.totalBudget) * 100

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
            <div className="level-badge">
              Level {mockData.user.level}
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{mockData.user.points} XP</div>
              <div className="text-xs text-gray-600">🔥 {mockData.user.streak} day streak</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="budget-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Budget</CardTitle>
              <CardDescription>This month's allocated budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(mockData.totalBudget)}
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
                {formatCurrency(mockData.totalSpent)}
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
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(mockData.totalRemaining)}
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
                <div className="space-y-4">
                  {mockData.categories.map((category, index) => {
                    const percentage = (category.spent / category.allocated) * 100
                    const statusClass = percentage < 80 ? "budget-status-under" : 
                                      percentage < 100 ? "budget-status-near" : "budget-status-over"
                    
                    return (
                      <div key={index} className="space-y-2">
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
                          <div className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
                            {percentage.toFixed(0)}%
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
              </CardContent>
            </Card>
          </div>

          {/* Gamification Panel */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.user.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-badge">
                      🏆 {achievement}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  ➕ Add Transaction
                </Button>
                <Button className="w-full" variant="outline">
                  📊 View Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  🎯 Create New Budget
                </Button>
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="budget-card">
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>Keep going to reach Level {mockData.user.level + 1}!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level {mockData.user.level}</span>
                    <span>Level {mockData.user.level + 1}</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-xs text-gray-600 text-center">
                    250 XP to next level
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}