import { UserButton, auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Umbral</h1>
            </div>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome to Umbral</h2>
          <p className="mt-2 text-slate-600">
            Your AI-powered learning platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Chat Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">AI Chat</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Learn with AI tutors using multiple teaching methods
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Start Chat
            </button>
          </div>

          {/* Concept Graph Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Concept Graph</h3>
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Visualize and explore knowledge concepts interactively
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Explore Graph
            </button>
          </div>

          {/* Learning Paths Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Learning Paths</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Get personalized learning roadmaps for your goals
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              View Paths
            </button>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Track your learning progress and achievements
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              View Progress
            </button>
          </div>

          {/* Export Data Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Export Data</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Download your learning data in OpenFree format
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Export
            </button>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
              <span className="text-2xl">⚙️</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Customize your learning preferences
            </p>
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Open Settings
            </button>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Under Development</h3>
          <p className="text-blue-700">
            This is a prototype. Features are being actively developed. Stay tuned for updates!
          </p>
        </div>
      </main>
    </div>
  )
}
