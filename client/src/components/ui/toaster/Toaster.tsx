import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      closeButton
      richColors={false}
      offset={16}
      gap={8}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "!bg-(--bg-elevated) !border !border-(--border) !text-(--text-primary) !shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] !rounded-lg",
          title: "!text-[13px] !font-medium",
          description: "!text-[12px] !text-(--text-muted)",
          actionButton: "!bg-(--brand) !text-white !text-[12px]",
          cancelButton: "!bg-white/8 !text-(--text-secondary) !text-[12px]",
          closeButton:
            "!bg-(--bg-elevated) !border-(--border) !text-(--text-muted) hover:!text-(--text-primary)",
          success: "!text-(--success)",
          error: "!text-(--danger)",
          warning: "!text-(--warning)",
          info: "!text-(--text-primary)",
          loading: "!text-(--text-primary)",
        },
      }}
    />
  );
}
