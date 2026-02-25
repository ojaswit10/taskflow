"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  title: string
  description: string | null
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: "", description: "", status: "PENDING" })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "10")
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)

    const res = await fetch(`/api/tasks?${params.toString()}`)
    if (res.status === 401) return router.push("/signin")

    const data = await res.json()
    setTasks(data.tasks)
    setPagination(data.pagination)
    setLoading(false)
  }, [page, search, statusFilter, router])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleSignout = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/signin")
  }

  const openCreate = () => {
    setEditTask(null)
    setForm({ title: "", description: "", status: "PENDING" })
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setForm({ title: task.title, description: task.description || "", status: task.status })
    setFormError("")
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    const url = editTask ? `/api/tasks/${editTask.id}` : "/api/tasks"
    const method = editTask ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setFormLoading(false)

    if (!res.ok) return setFormError(data.error || "Something went wrong")
    setShowModal(false)
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    fetchTasks()
  }

  const statusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-green-500/20 text-green-400"
    if (status === "IN_PROGRESS") return "bg-yellow-500/20 text-yellow-400"
    return "bg-gray-500/20 text-gray-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">TaskFlow</h1>
        <button onClick={handleSignout} className="text-gray-400 hover:text-white text-sm transition">
          Sign out
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            + New Task
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No tasks found.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-400 text-sm">{task.description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(task)}
                    className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-400 text-sm">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-lg font-bold mb-4">{editTask ? "Edit Task" : "New Task"}</h2>
            {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}