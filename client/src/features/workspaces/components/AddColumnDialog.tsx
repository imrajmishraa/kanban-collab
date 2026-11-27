import { useState } from "react";

import { DialogShell } from "./DialogShell";
import {
  inputClass,
  labelClass,
  cancelClass,
  submitClass,
} from "./dialogClasses";

export function AddColumnDialog({
  suggestedName,
  onCreate,
  onClose,
}: {
  suggestedName: string;
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(suggestedName);

  return (
    <DialogShell
      title="Add column"
      description="Columns group the cards on this board"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          onClose();
        }}
        className="p-5"
      >
        <label htmlFor="column-name" className={labelClass}>
          Name
        </label>
        <input
          id="column-name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="In progress"
          className={`mt-1.5 ${inputClass}`}
        />

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()} className={submitClass}>
            Add column
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Delete ─────────────────────────────────────────────────────────────── */
