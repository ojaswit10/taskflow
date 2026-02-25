import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">TaskFlow</h1>
        <div className="flex gap-3">
          <Link
            href="/signin"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6 leading-tight">
          Manage your tasks
          <span className="text-blue-500"> smarter</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          A secure, fast, and simple task management app. Create, organize, and
          track your tasks with ease.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition text-lg"
          >
            Get Started Free
          </Link>
          <Link
            href="/signin"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-blue-500 text-2xl mb-3">🔒</div>
            <h3 className="font-semibold text-white mb-2">Secure by Default</h3>
            <p className="text-gray-400 text-sm">
              Passwords hashed with bcrypt. JWT stored in HTTP-only cookies. Data encrypted with AES-256.
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-blue-500 text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-white mb-2">Fast & Responsive</h3>
            <p className="text-gray-400 text-sm">
              Built with Next.js 15 and deployed on Vercel for blazing fast performance globally.
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-blue-500 text-2xl mb-3">📋</div>
            <h3 className="font-semibold text-white mb-2">Full Task Control</h3>
            <p className="text-gray-400 text-sm">
              Create, edit, delete, filter by status, and search tasks — all in one clean dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-6 py-6 text-center text-gray-600 text-sm">
        Built with Next.js · PostgreSQL · Prisma · Deployed on Vercel
      </div>
    </div>
  )
}