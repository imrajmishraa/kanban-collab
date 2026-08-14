import { useParams } from 'react-router-dom'

/**
 * Placeholder — Workspace Page
 * Shows boards in a workspace. Replace with real components (Phase 3).
 */
export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', padding: '40px 24px' }}>
      <h1 className="text-2xl font-semibold mb-1">Workspace</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        ID: <code style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{workspaceId}</code>
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>
        Board list coming in Phase 3
      </p>
    </div>
  )
}
