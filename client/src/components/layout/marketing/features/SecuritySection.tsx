import React from 'react';
import { SecurityPoint } from '@components/ui/marketing/features/SecurityPoint';
import { SecurityStatus } from '@components/ui/marketing/features/SecurityStatus';

export default function SecuritySection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          {/* Security status panel */}
          <div className="order-2 border border-neutral-800 bg-[#0c0c0e] lg:order-1">
            {/* Header */}
            <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full border border-emerald-500"
                />

                <span className="font-mono text-[10px] text-neutral-500">
                  kanban / security
                </span>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                Secure
              </span>
            </div>

            {/* Status */}
            <div className="p-5 sm:p-6">
              <div className="border border-neutral-800 bg-[#101012]">
                <SecurityStatus
                  label="Authentication"
                  value="Protected"
                  status="ok"
                />

                <SecurityStatus
                  label="Session management"
                  value="Active"
                  status="ok"
                />

                <SecurityStatus
                  label="Access control"
                  value="Verified"
                  status="ok"
                />

                <SecurityStatus
                  label="Data transport"
                  value="Encrypted"
                  status="ok"
                />
              </div>

              {/* Terminal-style information */}
              <div className="mt-4 border border-neutral-800 bg-[#080808] p-4">
                <div className="space-y-2 font-mono text-[10px] leading-5">
                  <p className="text-neutral-700">
                    <span className="text-neutral-500">$</span> security.check
                  </p>

                  <p className="text-neutral-600">
                    validating workspace access...
                  </p>

                  <p className="text-emerald-600">✓ authentication verified</p>

                  <p className="text-emerald-600">✓ session validated</p>

                  <p className="text-emerald-600">✓ authorization verified</p>

                  <p className="text-neutral-700">
                    status: <span className="text-emerald-600">ready</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] text-rose-500">04</span>

              <span className="h-px w-6 bg-neutral-800" />

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Security
              </span>
            </div>

            <h2 className="font-mono text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Your workspace.
              <br />
              <span className="text-neutral-500">Protected by design.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Keep your workspaces and sessions protected with authentication,
              controlled access, and secure communication built into the
              application.
            </p>

            {/* Security points */}
            <div className="mt-9 space-y-0 border-y border-neutral-800">
              <SecurityPoint
                title="Authenticated access"
                description="Only authenticated users can access protected workspace resources."
              />

              <SecurityPoint
                title="Controlled sessions"
                description="Session lifecycle and authentication state are managed explicitly."
              />

              <SecurityPoint
                title="Protected communication"
                description="Application communication is designed around authenticated clients and controlled connections."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
