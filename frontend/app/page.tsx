import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const { userId } = await auth()

  // If user is already logged in, redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Umbral</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-slate-700 hover:text-slate-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Learn Anything with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}AI-Powered{' '}
            </span>
            Education
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Umbral revolutionizes learning through interactive concept graphs, personalized AI tutors,
            and full data ownership with our OpenFree export system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-slate-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Start Learning Free
            </Link>
            <Link
              href="#features"
              className="bg-white text-slate-900 px-8 py-3 rounded-lg text-lg font-medium border border-slate-300 hover:border-slate-400 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Multi-Model AI Chat
              </h3>
              <p className="text-slate-600">
                Choose between GPT-4, Claude, and other AI models. Switch teaching methods:
                practical, conceptual, or analogical.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Interactive Concept Graphs
              </h3>
              <p className="text-slate-600">
                Visualize knowledge as connected concepts. Explore from core ideas to specific
                subtopics in an intuitive graph.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Personalized Learning Paths
              </h3>
              <p className="text-slate-600">
                AI generates custom learning roadmaps based on your goals, current knowledge,
                and learning preferences.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-slate-600">
                Track mastery levels, time spent, and learning streaks. Get insights into your
                learning journey.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                OpenFree Data Export
              </h3>
              <p className="text-slate-600">
                Full ownership of your learning data. Export everything in an open format -
                no vendor lock-in.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Adaptive Assessments
              </h3>
              <p className="text-slate-600">
                AI-generated quizzes that adapt to your level. Immediate feedback with detailed
                explanations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join Umbral and experience AI-powered education today.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p>© 2026 Looper AI. MIT License.</p>
            <p className="mt-2 text-sm">Umbral EdTech Platform - Prototype Version</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
