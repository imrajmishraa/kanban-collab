import { DialogShell } from "@/features/workspaces";

import CardAttachments from "./CardAttachments";

interface CardAttachmentsDialogProps {
  cardId: string;
  cardTitle: string;
  onClose: () => void;
}

/**
 * Attachments in their own surface, for the same reason as comments: they are
 * a separate task from editing the card and they were making the editor scroll.
 */
export default function CardAttachmentsDialog({
  cardId,
  cardTitle,
  onClose,
}: CardAttachmentsDialogProps) {
  return (
    <DialogShell title="Attachments" description={cardTitle} onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto p-4">
        <CardAttachments cardId={cardId} />
      </div>
    </DialogShell>
  );
}
