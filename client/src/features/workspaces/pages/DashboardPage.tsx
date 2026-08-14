import { Link } from 'react-router-dom'

/**
 * Placeholder — Dashboard Page
 * Shows workspace list. Replace with real workspace components (Phase 3).
 */
export function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', color: 'var(--text-primary)' }}>
      {/* Temporary nav bar */}
      <header className="glass border-b" style={{ borderColor: 'var(--border)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="font-semibold text-lg" style={{ color: 'var(--brand)' }}>KanbanCollab</span>
        <span className="flex-1" />
        <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign out</Link>
      </header>

      <main style={{ padding: '40px 24px' }}>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Your workspaces and recent boards — Phase 3
        </p>

        {/* Quick navigation for development */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/workspaces/demo-workspace"
            style={{
              padding: '12px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            → Workspace Page
          </Link>
          <Link
            to="/workspaces/demo-workspace/boards/demo-board"
            style={{
              padding: '12px 20px',
              background: 'var(--brand)',
              borderRadius: 'var(--radius)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            → Board Page
          </Link>
        </div>
      </main>
    </div>
  )
}
