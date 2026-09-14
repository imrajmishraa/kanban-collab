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
      navigate(`/workspaces/${workspace.slug}`, { replace: true });
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
    <div className="w-full rounded-lg border border-white/10 bg-(--bg-elevated) shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-3.5">
        <div>
          <h1 className="text-[14px] font-medium text-(--text-primary)">
            New workspace
          </h1>
          <p className="mt-0.5 text-[11px] text-(--text-muted)">
            Create a space for your team.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close"
          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate className="p-5">
        <div className="space-y-3.5">
          {/* Name */}
          <div>
            <label
              htmlFor="ws-name"
              className="mb-1 block text-[11px] font-medium text-(--text-secondary)"
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
                "w-full rounded-md border bg-(--bg-card) px-2.5 py-1.5",
                "text-[13px] text-(--text-primary) placeholder:text-(--text-subtle)",
                "outline-none transition-colors",
                errors.name
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/8 hover:border-white/12 focus:border-white/25",
              ].join(" ")}
            />
            {errors.name && (
              <p className="mt-1 text-[10px] text-red-400/90">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="ws-desc"
              className="mb-1 block text-[11px] font-medium text-(--text-secondary)"
            >
              Description{" "}
              <span className="font-normal text-(--text-muted)">
                (optional)
              </span>
            </label>
            <textarea
              id="ws-desc"
              {...register("description")}
              placeholder="What is this workspace for?"
              rows={3}
              className={[
                "w-full resize-none rounded-md border bg-(--bg-card) px-2.5 py-1.5",
                "text-[13px] text-(--text-primary) placeholder:text-(--text-subtle)",
                "outline-none transition-colors",
                errors.description
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/8 hover:border-white/12 focus:border-white/25",
              ].join(" ")}
            />
            {errors.description && (
              <p className="mt-1 text-[10px] text-red-400/90">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-8 cursor-pointer items-center rounded-md border border-white/8 bg-transparent px-3 text-[12px] text-(--text-secondary) transition-colors hover:bg-white/4 hover:text-(--text-primary)"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-(--brand) px-3 text-[12px] font-medium text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
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
