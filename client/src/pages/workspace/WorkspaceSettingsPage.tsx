import ThemeToggle from '@components/ui/ThemeToggle'
import { useWorkspace } from '@context/WorkspaceContext'

const WorkspaceSettingsPage = () => {
  const { workspaceRoleLabel, workspaceDescription } = useWorkspace()

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/88 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Settings</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Appearance</p>
          <div className="mt-3">
            <ThemeToggle fullWidth />
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Choose Light, Dark, or follow your System preference.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Role</p>
          <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{workspaceRoleLabel}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your current level of workspace control.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Description</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{workspaceDescription}</p>
        </div>
      </div>
    </section>
  )
}

export default WorkspaceSettingsPage
