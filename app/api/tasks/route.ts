import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { TaskStatus } from "@/lib/generated/prisma/enums"
import { encrypt, decrypt } from "@/lib/encryption"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as { id: string }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const skip = (page - 1) * limit

    const where = {
      userId: decoded.id,
      ...(status && { status: status as TaskStatus }),
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ])

    // decrypt tasks
    const decryptedTasks = tasks.map((task) => ({
      ...task,
      title: decrypt(task.title),
      description: task.description ? decrypt(task.description) : null,
    }))

    // filter by search after decryption
    const filteredTasks = search
      ? decryptedTasks.filter((task) =>
          task.title.toLowerCase().includes(search.toLowerCase())
        )
      : decryptedTasks

    return NextResponse.json({
      tasks: filteredTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as { id: string }

    const body = await req.json()
    const { title, description, status } = body

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: encrypt(title.trim()),
        description: description ? encrypt(description.trim()) : null,
        status: status || "PENDING",
        userId: decoded.id,
      },
    })

    return NextResponse.json({
      task: {
        ...task,
        title: decrypt(task.title),
        description: task.description ? decrypt(task.description) : null,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}