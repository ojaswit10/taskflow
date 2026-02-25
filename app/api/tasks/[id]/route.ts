import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { encrypt, decrypt } from "@/lib/encryption"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as { id: string }

    const task = await prisma.task.findFirst({
      where: { id, userId: decoded.id },
    })

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    return NextResponse.json({
      task: {
        ...task,
        title: decrypt(task.title),
        description: task.description ? decrypt(task.description) : null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as { id: string }

    const existing = await prisma.task.findFirst({
      where: { id, userId: decoded.id },
    })

    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    const body = await req.json()
    const { title, description, status } = body

    if (title && title.trim() === "") {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: encrypt(title.trim()) }),
        ...(description !== undefined && {
          description: description ? encrypt(description.trim()) : null,
        }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({
      task: {
        ...updated,
        title: decrypt(updated.title),
        description: updated.description ? decrypt(updated.description) : null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as { id: string }

    const existing = await prisma.task.findFirst({
      where: { id, userId: decoded.id },
    })

    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ message: "Task deleted successfully" })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}