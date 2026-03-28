import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, initializeUser } from '@/store'
import StarfieldCanvas from '@/components/layout/StarfieldCanvas'
import Navigation from '@/components/layout/Navigation'
import BottomNav from '@/components/ui/BottomNav'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import CosmicErrorBoundary from '@/components/ui/ErrorBoundary'
import { hideSplashScreen, setStatusBarStyle, registerBackButton } from '@/lib/native'
import { initPurchases } from '@/lib/purchases'
import { initAnalytics } from '@/lib/analytics'

// Pages (lazy imports for performance)
import { lazy, Suspense } from 'react'
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const KundliPage = lazy(() => import('@/pages/Kundli'))
const TarotPage = lazy(() => import('@/pages/Tarot'))
const NumerologyPage = lazy(() => import('@/pages/Numerology'))
const VastuPage = lazy(() => import('@/pages/Vastu'))
const ScripturesPage = lazy(() => import('@/pages/Scriptures'))
const AchievementsPage = lazy(() => import('@/pages/Achievements'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const DailyRitualsPage = lazy(() => import('@/pages/DailyRituals'))
const OraclePage = lazy(() => import('@/pages/Oracle'))
const CompatibilityPage = lazy(() => import('@/pages/Compatibility'))
const PanchangaPage = lazy(() => import('@/pages/Panchanga'))
const MuhurtaPage = lazy(() => import('@/pages/Muhurta'))
const CommunityPage = lazy(() => import('@/pages/Community'))
const KnowledgeBasePage = lazy(() => import('@/pages/KnowledgeBase'))
const TransitsPage = lazy(() => import('@/pages/Transits'))
const CosmicCalendarPage = lazy(() => import('@/pages/CosmicCalendar'))
const RemediesPage = lazy(() => import('@/pages/Remedies'))
const QuizPage = lazy(() => import('@/pages/Quiz'))
const MoodJournalPage = lazy(() => import('@/pages/MoodJournal'))
const MuhurtaAlertsPage = lazy(() => import('@/pages/MuhurtaAlerts'))
const LearningPage = lazy(() => import('@/pages/Learning'))
const YearAheadPage = lazy(() => import('@/pages/YearAhead'))
const VideoAnalysisPage = lazy(() => import('@/pages/VideoAnalysis'))
const PrivacyPolicyPage = lazy(() => import('@/pages/Legal/PrivacyPolicy'))
const TermsOfServicePage = lazy(() => import('@/pages/Legal/TermsOfService'))

// Cosmic loader
function CosmicLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-gold/40 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-saffron/60 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">✦</div>
      </div>
      <p className="font-cinzel text-sm text-gold/60 animate-pulse">Loading Ancient Wisdom...</p>
    </div>
  )
}

// Main layout wrapper
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cosmos">
      <StarfieldCanvas />
      <Navigation />
      <main className="flex-1 lg:ml-64 relative z-10 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      <BottomNav />
      <PWAInstallBanner />
    </div>
  )
}

export default function App() {
  const { isOnboarded, user, updateStreak } = useStore()

  useEffect(() => {
    if (!user) {
      initializeUser()
    }
    updateStreak()
  }, [user, updateStreak])

  // Native platform initialization (Capacitor + RevenueCat)
  useEffect(() => {
    setStatusBarStyle()
    hideSplashScreen()
    registerBackButton()
    initPurchases(user?.id)
    initAnalytics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CosmicErrorBoundary>
      <AnimatePresence mode="wait">
        <Suspense fallback={<CosmicLoader />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />}
            />

            <Route path="/onboarding" element={<Onboarding />} />

            {/* Main app routes */}
            {[
              { path: '/dashboard', Component: Dashboard },
              { path: '/kundli/*', Component: KundliPage },
              { path: '/tarot/*', Component: TarotPage },
              { path: '/numerology/*', Component: NumerologyPage },
              { path: '/vastu/*', Component: VastuPage },
              { path: '/scriptures/*', Component: ScripturesPage },
              { path: '/achievements', Component: AchievementsPage },
              { path: '/profile', Component: ProfilePage },
              { path: '/daily-rituals', Component: DailyRitualsPage },
              { path: '/oracle', Component: OraclePage },
              { path: '/compatibility/*', Component: CompatibilityPage },
              { path: '/panchanga', Component: PanchangaPage },
              { path: '/muhurta', Component: MuhurtaPage },
              { path: '/community', Component: CommunityPage },
              { path: '/transits', Component: TransitsPage },
              { path: '/calendar', Component: CosmicCalendarPage },
              { path: '/remedies', Component: RemediesPage },
              { path: '/quiz', Component: QuizPage },
              { path: '/mood-journal', Component: MoodJournalPage },
              { path: '/muhurta-alerts', Component: MuhurtaAlertsPage },
              { path: '/learning', Component: LearningPage },
              { path: '/year-ahead', Component: YearAheadPage },
              { path: '/video-analysis', Component: VideoAnalysisPage },
            ].map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <AppLayout>
                    <PageTransition>
                      <Component />
                    </PageTransition>
                  </AppLayout>
                }
              />
            ))}

            {/* Admin-only routes */}
            <Route
              path="/knowledge"
              element={
                user?.role === 'admin' ? (
                  <AppLayout>
                    <PageTransition>
                      <KnowledgeBasePage />
                    </PageTransition>
                  </AppLayout>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* Legal pages — public, no layout wrapper */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </CosmicErrorBoundary>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
