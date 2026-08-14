import { useParams } from 'react-router-dom'

/**
 * Placeholder — Board Page
 * The main Kanban board with Yjs real-time collaboration.
 * Replace with real KanbanBoard component (Phase 4).
 */
export function BoardPage() {
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId: string }>()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', padding: '40px 24px' }}>
      <h1 className="text-2xl font-semibold mb-1">Board</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
        Board ID:{' '}
        <code style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{boardId}</code>
      </p>
      <p style={{ color: 'var(--text-secondary)' }}>
        Workspace ID:{' '}
        <code style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{workspaceId}</code>
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '14px' }}>
        Kanban columns + Yjs collaboration coming in Phase 4
      </p>
    </div>
  )
}
