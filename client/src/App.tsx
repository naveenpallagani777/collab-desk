import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import DashboardPage from '@pages/DashboardPage'
import InvitePage from '@pages/InvitePage'
import WorkspaceLayout from '@components/workspace/WorkspaceLayout'
import WorkspaceOverviewPage from '@pages/workspace/WorkspaceOverviewPage'
import WorkspaceTeamPage from '@pages/workspace/WorkspaceTeamPage'
import WorkspaceSettingsPage from '@pages/workspace/WorkspaceSettingsPage'
import ToastViewport from '@components/ui/ToastViewport'
import './styles/App.css'

function App() {
  const { user, initializing, backendUnavailable, retrySession } = useAuth()

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Restoring session...
        </div>
      </main>
    )
  }

  if (!user && backendUnavailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Connection issue</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Backend is unavailable</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            We could not reach the server, so authentication state cannot be verified right now.
          </p>
          <button
            type="button"
            onClick={() => {
              void retrySession()
            }}
            className="mt-5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Retry connection
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/workspace/:workspaceId"
          element={user ? <WorkspaceLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<WorkspaceOverviewPage />} />
          <Route path="team" element={<WorkspaceTeamPage />} />
          <Route path="settings" element={<WorkspaceSettingsPage />} />
        </Route>
        <Route path="/invite" element={<InvitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </>
  )
}

export default App
