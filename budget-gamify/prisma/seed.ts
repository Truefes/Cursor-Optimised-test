import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultAchievements = [
  {
    name: "First Steps",
    description: "Create your first budget",
    icon: "🎯",
    points: 50,
    rarity: "common",
    condition: JSON.stringify({ type: "budget_created", count: 1 })
  },
  {
    name: "Transaction Master",
    description: "Add your first transaction",
    icon: "💳",
    points: 25,
    rarity: "common",
    condition: JSON.stringify({ type: "transaction_created", count: 1 })
  },
  {
    name: "Week Warrior",
    description: "Log transactions for 7 consecutive days",
    icon: "🔥",
    points: 100,
    rarity: "rare",
    condition: JSON.stringify({ type: "daily_streak", count: 7 })
  },
  {
    name: "Month Master",
    description: "Stay within budget for a full month",
    icon: "🏆",
    points: 200,
    rarity: "epic",
    condition: JSON.stringify({ type: "monthly_budget_success", count: 1 })
  },
  {
    name: "Savings Superstar",
    description: "Save 20% of your budget",
    icon: "⭐",
    points: 150,
    rarity: "rare",
    condition: JSON.stringify({ type: "savings_percentage", value: 20 })
  },
  {
    name: "Category Champion",
    description: "Stay under budget in all categories for a month",
    icon: "🎖️",
    points: 300,
    rarity: "legendary",
    condition: JSON.stringify({ type: "all_categories_under_budget", count: 1 })
  },
  {
    name: "Streak Legend",
    description: "Maintain a 30-day activity streak",
    icon: "🔥",
    points: 500,
    rarity: "legendary",
    condition: JSON.stringify({ type: "daily_streak", count: 30 })
  },
  {
    name: "Budget Builder",
    description: "Create 5 different budgets",
    icon: "🏗️",
    points: 200,
    rarity: "epic",
    condition: JSON.stringify({ type: "budget_created", count: 5 })
  }
]

const defaultCategories = [
  { name: "Housing", icon: "🏠", color: "#3B82F6" },
  { name: "Food & Dining", icon: "🍽️", color: "#10B981" },
  { name: "Transportation", icon: "🚗", color: "#F59E0B" },
  { name: "Healthcare", icon: "🏥", color: "#EF4444" },
  { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { name: "Shopping", icon: "🛍️", color: "#EC4899" },
  { name: "Utilities", icon: "⚡", color: "#6B7280" },
  { name: "Insurance", icon: "🛡️", color: "#14B8A6" },
  { name: "Savings", icon: "💰", color: "#059669" },
  { name: "Debt Payments", icon: "💳", color: "#DC2626" },
  { name: "Education", icon: "📚", color: "#7C3AED" },
  { name: "Personal Care", icon: "💅", color: "#F97316" },
  { name: "Travel", icon: "✈️", color: "#0EA5E9" },
  { name: "Gifts & Donations", icon: "🎁", color: "#84CC16" },
  { name: "Miscellaneous", icon: "📦", color: "#64748B" }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Seed achievements
  console.log('📈 Creating achievements...')
  for (const achievement of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })