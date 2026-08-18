import React from 'react'

function SettingsPage() {
  return (
    <div>
      <div
        className="min-h-screen"
        style={{
          background: "var(--bg-root)",
          color: "var(--text-primary)",
          padding: "40px 24px",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "24px",
            fontSize: "14px",
          }}
        >
          Kanban columns + Yjs collaboration coming in Phase 4
        </p>
      </div>
    </div>
  );
}

export default SettingsPage
