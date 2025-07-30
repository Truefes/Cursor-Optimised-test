import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTransactionSchema, transactionQuerySchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = transactionQuerySchema.parse({
      budgetId: searchParams.get("budgetId"),
      categoryId: searchParams.get("categoryId"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    })

    const skip = (query.page - 1) * query.limit

    const where = {
      userId: session.user.id,
      ...(query.budgetId && { budgetId: query.budgetId }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.startDate && query.endDate && {
        date: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        },
      }),
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          budget: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { date: "desc" },
        skip,
        take: query.limit,
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / query.limit)
      }
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // Verify that the budget and category belong to the user
    const budget = await prisma.budget.findUnique({
      where: { 
        id: validatedData.budgetId,
        userId: session.user.id 
      },
      include: {
        categories: {
          where: { id: validatedData.categoryId }
        }
      }
    })

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    if (budget.categories.length === 0) {
      return NextResponse.json({ error: "Category not found in this budget" }, { status: 404 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        date: validatedData.date,
        isRecurring: validatedData.isRecurring,
        frequency: validatedData.frequency,
        attachments: validatedData.attachments,
        userId: session.user.id,
        budgetId: validatedData.budgetId,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
        budget: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Update category spent amount
    await prisma.budgetCategory.update({
      where: { id: validatedData.categoryId },
      data: {
        spent: { increment: validatedData.amount }
      }
    })

    // Award achievement for creating first transaction
    const userTransactionCount = await prisma.transaction.count({
      where: { userId: session.user.id }
    })

    if (userTransactionCount === 1) {
      const firstTransactionAchievement = await prisma.achievement.findFirst({
        where: { name: "Transaction Master" }
      })

      if (firstTransactionAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: firstTransactionAchievement.id
          }
        })

        // Award points
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            points: { increment: firstTransactionAchievement.points }
          }
        })
      }
    }

    // Update user's last activity and streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastActivity: true, streak: true }
    })

    if (user) {
      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let newStreak = user.streak || 0
      
      if (!lastActivity || lastActivity < yesterday) {
        // Streak broken or first activity
        newStreak = 1
      } else if (lastActivity.getTime() === yesterday.getTime()) {
        // Consecutive day
        newStreak += 1
      }
      // If lastActivity is today, don't change streak

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          lastActivity: new Date(),
          streak: newStreak,
          points: { increment: 10 } // 10 points for adding a transaction
        }
      })

      // Check for streak achievements
      if (newStreak === 7) {
        const weekWarriorAchievement = await prisma.achievement.findFirst({
          where: { name: "Week Warrior" }
        })

        if (weekWarriorAchievement) {
          const existingAchievement = await prisma.userAchievement.findFirst({
            where: {
              userId: session.user.id,
              achievementId: weekWarriorAchievement.id
            }
          })

          if (!existingAchievement) {
            await prisma.userAchievement.create({
              data: {
                userId: session.user.id,
                achievementId: weekWarriorAchievement.id
              }
            })

            await prisma.user.update({
              where: { id: session.user.id },
              data: {
                points: { increment: weekWarriorAchievement.points }
              }
            })
          }
        }
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}