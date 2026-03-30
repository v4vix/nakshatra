import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, initializeUser } from '@/store'
import { useAuthStore } from '@/store/authStore'
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
const LoginPage = lazy(() => import('@/pages/Auth/Login'))
const RegisterPage = lazy(() => import('@/pages/Auth/Register'))
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
const AdminPage = lazy(() => import('@/pages/Admin'))
const SharedCardPage = lazy(() => import('@/pages/SharedCard'))
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
  const { user: localUser, updateStreak } = useStore()
  const { isAuthenticated, isLoading: authLoading, user: authUser, fetchMe } = useAuthStore()

  // Check server session on mount
  useEffect(() => {
    fetchMe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync auth user to local store for backward compat
  useEffect(() => {
    if (authUser) {
      initializeUser({
        id: authUser.id,
        username: authUser.username,
        email: authUser.email,
        fullName: authUser.fullName,
        avatar: authUser.avatar,
        birthDate: authUser.birthDate,
        birthTime: authUser.birthTime,
        birthPlace: authUser.birthPlace,
        birthLat: authUser.birthLat,
        birthLon: authUser.birthLon,
        level: authUser.level,
        xp: authUser.xp,
        role: authUser.role,
        onboardingComplete: authUser.onboardingComplete,
        achievements: authUser.achievements || [],
        streakDays: authUser.streakDays || 0,
        longestStreak: authUser.longestStreak || 0,
      })
      updateStreak()
    }
  }, [authUser]) // eslint-disable-line react-hooks/exhaustive-deps

  // Native platform initialization
  useEffect(() => {
    setStatusBarStyle()
    hideSplashScreen()
    registerBackButton()
    initPurchases(authUser?.id || localUser?.id)
    initAnalytics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show loader while checking auth
  if (authLoading) {
    return <CosmicLoader />
  }

  const isOnboarded = authUser?.onboardingComplete ?? false

  return (
    <CosmicErrorBoundary>
      <AnimatePresence mode="wait">
        <Suspense fallback={<CosmicLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
            <Route path="/s/:slug" element={<SharedCardPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Root redirect */}
            <Route
              path="/"
              element={
                !isAuthenticated
                  ? <Navigate to="/login" replace />
                  : !isOnboarded
                    ? <Navigate to="/onboarding" replace />
                    : <Navigate to="/dashboard" replace />
              }
            />

            {/* Onboarding — requires auth but not onboarding */}
            <Route
              path="/onboarding"
              element={
                !isAuthenticated ? <Navigate to="/login" replace /> : <Onboarding />
              }
            />

            {/* Main app routes — require auth */}
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
                  !isAuthenticated ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <AppLayout>
                      <PageTransition>
                        <Component />
                      </PageTransition>
                    </AppLayout>
                  )
                }
              />
            ))}

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : authUser?.role !== 'admin' ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AppLayout>
                    <PageTransition>
                      <AdminPage />
                    </PageTransition>
                  </AppLayout>
                )
              }
            />
            <Route
              path="/knowledge"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : authUser?.role !== 'admin' ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AppLayout>
                    <PageTransition>
                      <KnowledgeBasePage />
                    </PageTransition>
                  </AppLayout>
                )
              }
            />

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
