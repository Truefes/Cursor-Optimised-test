import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateBudgetSchema } from "@/lib/validations"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budget = await prisma.budget.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        categories: {
          include: {
            transactions: {
              orderBy: { date: "desc" },
              take: 5 // Latest 5 transactions per category
            },
            _count: {
              select: { transactions: true }
            }
          }
        },
        transactions: {
          include: {
            category: true
          },
          orderBy: { date: "desc" },
          take: 10 // Latest 10 transactions
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: { 
            transactions: true,
            collaborators: true 
          }
        }
      }
    })

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error fetching budget:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateBudgetSchema.parse({ ...body, id: params.id })

    // Check if budget exists and user owns it
    const existingBudget = await prisma.budget.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    // If categories are being updated, validate total allocation
    if (validatedData.categories && validatedData.totalAmount) {
      const totalAllocated = validatedData.categories.reduce((sum, cat) => sum + cat.allocated, 0)
      if (Math.abs(totalAllocated - validatedData.totalAmount) > 0.01) {
        return NextResponse.json(
          { error: "Total allocated amount must equal budget amount" },
          { status: 400 }
        )
      }
    }

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.totalAmount && { totalAmount: validatedData.totalAmount }),
        ...(validatedData.period && { period: validatedData.period }),
        ...(validatedData.startDate && { startDate: validatedData.startDate }),
        ...(validatedData.endDate && { endDate: validatedData.endDate }),
        ...(validatedData.categories && {
          categories: {
            deleteMany: {},
            create: validatedData.categories.map(category => ({
              name: category.name,
              icon: category.icon,
              color: category.color,
              allocated: category.allocated,
            }))
          }
        })
      },
      include: {
        categories: true,
        _count: {
          select: { transactions: true }
        }
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error updating budget:", error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if budget exists and user owns it
    const existingBudget = await prisma.budget.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}