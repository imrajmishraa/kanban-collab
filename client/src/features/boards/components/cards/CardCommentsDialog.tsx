import { DialogShell } from "@/features/workspaces";

import CardComments from "./CardComments";

interface CardCommentsDialogProps {
  cardId: string;
  cardTitle: string;
  onClose: () => void;
}

/**
 * Comments in their own surface.
 *
 * They used to render inside the card editor, which made that dialog tall
 * enough to scroll before you reached Save. Reading and writing comments is a
 * separate task from editing a card, so it gets its own box.
 */
export default function CardCommentsDialog({
  cardId,
  cardTitle,
  onClose,
}: CardCommentsDialogProps) {
  return (
    <DialogShell title="Comments" description={cardTitle} onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto p-4">
        <CardComments cardId={cardId} />
      </div>
    </DialogShell>
  );
}
