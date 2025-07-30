import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createBudgetSchema, budgetQuerySchema } from "@/lib/validations"
import { generateShareToken } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = budgetQuerySchema.parse({
      period: searchParams.get("period"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    })

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        ...(query.period && { period: query.period }),
        ...(query.startDate && query.endDate && {
          startDate: { gte: new Date(query.startDate) },
          endDate: { lte: new Date(query.endDate) },
        }),
      },
      include: {
        categories: {
          include: {
            _count: {
              select: { transactions: true }
            }
          }
        },
        _count: {
          select: { 
            transactions: true,
            collaborators: true 
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
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
    const validatedData = createBudgetSchema.parse(body)

    // Check if total allocated matches total budget
    const totalAllocated = validatedData.categories.reduce((sum, cat) => sum + cat.allocated, 0)
    if (Math.abs(totalAllocated - validatedData.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: "Total allocated amount must equal budget amount" },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        totalAmount: validatedData.totalAmount,
        period: validatedData.period,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        userId: session.user.id,
        categories: {
          create: validatedData.categories.map(category => ({
            name: category.name,
            icon: category.icon,
            color: category.color,
            allocated: category.allocated,
          }))
        }
      },
      include: {
        categories: true,
        _count: {
          select: { transactions: true }
        }
      }
    })

    // Award achievement for creating first budget
    const userBudgetCount = await prisma.budget.count({
      where: { userId: session.user.id }
    })

    if (userBudgetCount === 1) {
      const firstBudgetAchievement = await prisma.achievement.findFirst({
        where: { name: "First Steps" }
      })

      if (firstBudgetAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: firstBudgetAchievement.id
          }
        })

        // Award points
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            points: { increment: firstBudgetAchievement.points }
          }
        })
      }
    }

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
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