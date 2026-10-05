import { useState } from "react";

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/dashboard/useNotificationPreferences";

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPE_ORDER,
  type DigestFrequency,
  type NotificationChannels,
  type NotificationPreferences as NotificationPreferencesShape,
} from "@/types/api/dashboard/notificationPreferences";

const CHANNEL_LABELS: Record<keyof NotificationChannels, string> = {
  inApp: "In-app",
  email: "Email",
  push: "Push",
  sms: "SMS",
};

const TYPE_LABELS: Record<string, string> = {
  CARD_ASSIGNED: "Card assigned to me",
  CARD_MOVED: "Card moved",
  CARD_DUE_SOON: "Card due soon",
  CARD_OVERDUE: "Card overdue",
  COMMENT_ADDED: "New comment",
  MENTION: "Mentioned in a comment",
  WORKSPACE_INVITE: "Workspace invitation",
  WORKSPACE_ROLE_CHANGED: "My role changed",
  WORKSPACE_DELETION_SCHEDULED: "Workspace deletion scheduled",
  BOARD_SHARED: "Board shared with me",
};

const EMPTY_CHANNELS: NotificationChannels = {
  inApp: false,
  email: false,
  push: false,
  sms: false,
};

/**
 * The editable form. Split from the data-fetching wrapper so the draft can be
 * initialised from props (via `useState(initial)`) rather than synced in an
 * effect — which the React Compiler flags as `set-state-in-effect`.
 */
function PreferencesForm({
  initial,
}: {
  initial: NotificationPreferencesShape;
}) {
  const [draft, setDraft] = useState<NotificationPreferencesShape>(initial);
  const update = useUpdateNotificationPreferences();

  const toggleChannel = (type: string, channel: keyof NotificationChannels) => {
    setDraft((prev) => {
      const current = prev.preferences[
        type as keyof typeof prev.preferences
      ] ?? { ...EMPTY_CHANNELS };

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [type]: { ...current, [channel]: !current[channel] },
        },
      };
    });
  };

  return (
    <div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-(--text-muted)">
              <th className="py-2 pr-4 text-left font-semibold uppercase tracking-[0.12em]">
                Notification
              </th>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <th
                  key={channel}
                  className="px-2 py-2 text-center font-semibold uppercase tracking-[0.12em]"
                >
                  {CHANNEL_LABELS[channel]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {NOTIFICATION_TYPE_ORDER.map((type) => {
              const channels = draft.preferences[type] ?? EMPTY_CHANNELS;

              return (
                <tr key={type} className="border-t border-white/6">
                  <td className="py-2 pr-4 text-(--text-primary)">
                    {TYPE_LABELS[type] ?? type}
                  </td>

                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <td key={channel} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={channels[channel]}
                        onChange={() => toggleChannel(type, channel)}
                        aria-label={`${TYPE_LABELS[type] ?? type} — ${CHANNEL_LABELS[channel]}`}
                        className="size-3.5 accent-(--brand)"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Digest */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-4">
        <div>
          <p className="font-mono text-[12px] text-(--text-primary)">
            Email digest
          </p>
          <p className="font-mono text-[10px] text-(--text-muted)">
            A periodic summary of unread notifications.
          </p>
        </div>

        <select
          value={draft.digestFrequency}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              digestFrequency: event.target.value as DigestFrequency,
            }))
          }
          className="h-9 rounded-lg border border-white/8 bg-white/4 px-3 font-mono text-[11px] text-(--text-primary) outline-none hover:border-white/14 focus:border-(--brand-border)"
        >
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Quiet hours */}
      <div className="mt-4 border-t border-white/6 pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.quietHours.enabled}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours,
                  enabled: event.target.checked,
                },
              }))
            }
            className="size-3.5 accent-(--brand)"
          />
          <span className="font-mono text-[12px] text-(--text-primary)">
            Quiet hours
          </span>
        </label>

        {draft.quietHours.enabled && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-[11px] text-(--text-muted)">
              From
              <input
                type="time"
                value={draft.quietHours.start}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    quietHours: {
                      ...prev.quietHours,
                      start: event.target.value,
                    },
                  }))
                }
                className="h-8 rounded-lg border border-white/8 bg-white/4 px-2 text-(--text-primary) outline-none"
              />
            </label>

            <label className="flex items-center gap-2 font-mono text-[11px] text-(--text-muted)">
              To
              <input
                type="time"
                value={draft.quietHours.end}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, end: event.target.value },
                  }))
                }
                className="h-8 rounded-lg border border-white/8 bg-white/4 px-2 text-(--text-primary) outline-none"
              />
            </label>

            <input
              type="text"
              value={draft.quietHours.timezone}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    timezone: event.target.value,
                  },
                }))
              }
              aria-label="Timezone"
              className="h-8 w-44 rounded-lg border border-white/8 bg-white/4 px-2 font-mono text-[11px] text-(--text-primary) outline-none"
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {update.isSuccess && !update.isPending && (
          <span className="font-mono text-[10px] text-(--success)">Saved</span>
        )}
        {update.isError && (
          <span className="font-mono text-[10px] text-(--danger)">
            Couldn&apos;t save.
          </span>
        )}

        <button
          type="button"
          onClick={() => update.mutate(draft)}
          disabled={update.isPending}
          className="rounded-lg border border-(--brand-border) bg-(--brand)/10 px-4 py-2 font-mono text-[11px] font-semibold text-(--text-primary) transition-colors hover:bg-(--brand)/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {update.isPending ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

/**
 * Notification preferences (T12). Reads/writes `NotificationPreferenceModel`;
 * the digest job already honours `digestFrequency`, but until now nothing could
 * set it.
 */
export default function NotificationPreferences() {
  const query = useNotificationPreferences();

  return (
    <section className="mt-6 rounded-xl border border-white/8 bg-white/3 p-5">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
        Notifications
      </h2>
      <p className="mt-1 font-mono text-[12px] leading-5 text-(--text-secondary)">
        Choose how you want to be notified, and when to stay quiet.
      </p>

      {query.isLoading && (
        <p className="mt-4 font-mono text-[11px] text-(--text-muted)">
          Loading preferences…
        </p>
      )}

      {query.isError && (
        <p className="mt-4 font-mono text-[11px] text-(--danger)">
          Couldn&apos;t load your notification preferences.
        </p>
      )}

      {query.data && <PreferencesForm initial={query.data} />}
    </section>
  );
}
