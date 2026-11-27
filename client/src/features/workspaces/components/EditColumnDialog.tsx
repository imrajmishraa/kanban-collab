import { useState } from "react";

import { DialogShell } from "./DialogShell";
import {
  inputClass,
  labelClass,
  cancelClass,
  submitClass,
} from "./dialogClasses";

export function EditColumnDialog({
  currentName,
  currentDescription,
  onSave,
  onClose,
}: {
  currentName: string;
  currentDescription?: string | null;
  onSave: (values: { name: string; description: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");

  const dirty =
    name.trim() !== currentName.trim() ||
    description.trim() !== (currentDescription ?? "").trim();

  return (
    <DialogShell
      title="Edit column"
      description="Rename the column or note what belongs in it"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onSave({ name: name.trim(), description: description.trim() });
          onClose();
        }}
        className="p-5"
      >
        <div className="space-y-4">
          <div>
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
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="column-description" className={labelClass}>
              Description (optional)
            </label>
            <textarea
              id="column-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What goes in this column?"
              className={`mt-1.5 resize-none ${inputClass}`}
            />
            <p className="mt-1.5 text-[11px] text-(--text-subtle)">
              {description.trim().length}/300
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button type="submit" disabled={!dirty} className={submitClass}>
            Save
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Add column ─────────────────────────────────────────────────────────── */
