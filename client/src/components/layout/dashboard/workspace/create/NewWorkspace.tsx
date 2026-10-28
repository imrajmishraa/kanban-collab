import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";

import {
  createWorkspaceSchema,
  slugify,
  type CreateWorkspaceInput,
} from "@/validations/dashboard/workspace.validator";
import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { ApiClientError } from "@/api/client";
import { toastSuccess, toastError } from "@/lib/toast";
import { Tooltip } from "#components/Tooltips/ToolTip";

interface NewWorkspaceProps {
  onClose?: () => void;
}

export default function NewWorkspace({ onClose }: NewWorkspaceProps = {}) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    mode: "onBlur",
    defaultValues: { name: "", slug: "", description: "" },
  });

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        slug: slugify(values.name),
      };

      const workspace = await workspaceApi.createWorkspace(payload);

      toastSuccess(
        "Workspace created.",
        `"${workspace.name}" is ready to use.`,
      );

      onClose?.();
      navigate(`/workspaces/${workspace.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Field-level errors → inline under the inputs
        if (err.errors.length > 0) {
          for (const fieldError of err.errors) {
            const field = fieldError.field;
            if (field === "name" || field === "description") {
              setError(field, {
                type: "server",
                message: fieldError.message,
              });
            }
          }
        }

        // If it was ONLY field errors, the inline display is enough.
        // Otherwise show the summary in a toast.
        if (err.code !== "VALIDATION_FAILED") {
          toastError(err);
        }
        return;
      }

      toastError(err);
    }
  });

  return (
    <div className="w-full rounded-xl border border-orange-50/15 bg-[#0a0a0a]/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-orange-50/10 px-5 py-4">
        <div>
          <h1 className="text-[14px] font-medium tracking-tight text-neutral-100">
            New workspace
          </h1>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            Create a space for your{" "}
            <span className="font-medium text-orange-100 capitalize">team</span>
          </p>
        </div>

        {/* Icon only, so the shortcut lives in the tooltip rather than on screen. */}
        <Tooltip
          label="Close"
          highlight="Esc"
          side="bottom"
          shape="solid"
          size="sm"
        >
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-neutral-500 transition-colors duration-200 hover:border-orange-50/15 hover:bg-white/5 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate className="p-5">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="ws-name"
              className="mb-1.5 block text-[11px] font-medium text-neutral-300"
            >
              Name
            </label>
            <input
              id="ws-name"
              {...register("name")}
              type="text"
              placeholder="Acme Inc."
              autoFocus
              className={[
                "w-full rounded-lg border px-3 py-2",
                "text-[13px] text-neutral-100 placeholder:text-neutral-600",
                "outline-none transition-colors duration-200",
                // focus-visible:outline-none wins over the global
                // `:focus-visible { outline: 2px solid var(--brand) }` in
                // index.css, which is what painted the orange ring.
                "focus-visible:outline-none",
                errors.name
                  ? "border-rose-400/40 bg-white/3 focus:border-rose-400/60"
                  : "border-orange-50/15 bg-white/3 hover:border-orange-50/25 focus:border-white/25 focus:bg-white/5",
              ].join(" ")}
            />
            {errors.name && (
              <p className="mt-1.5 text-[10px] text-rose-300">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="ws-desc"
              className="mb-1.5 block text-[11px] font-medium text-neutral-300"
            >
              Description{" "}
              <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <textarea
              id="ws-desc"
              {...register("description")}
              placeholder="What is this workspace for?"
              rows={3}
              className={[
                "w-full resize-none rounded-lg border px-3 py-2",
                "text-[13px] text-neutral-100 placeholder:text-neutral-600",
                "outline-none transition-colors duration-200",
                "focus-visible:outline-none",
                errors.description
                  ? "border-rose-400/40 bg-white/3 focus:border-rose-400/60"
                  : "border-orange-50/15 bg-white/3 hover:border-orange-50/25 focus:border-white/25 focus:bg-white/5",
              ].join(" ")}
            />
            {errors.description && (
              <p className="mt-1.5 text-[10px] text-rose-300">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2">
          {/* Outline: mirrored corners of the solid button */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-9 cursor-pointer items-center rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
          >
            Cancel
          </button>

          {/* Solid: the one white button. Orange is never a fill in ChaiUI. */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={13}
                  strokeWidth={2}
                  className="animate-spin"
                />
                <span>Creating…</span>
              </>
            ) : (
              <span>Create workspace</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
