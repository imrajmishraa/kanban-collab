import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileSidebarHeaderProps {
  onClose: () => void;
  onSearch: () => void;
}

const MobileSidebarHeader = ({
  onClose,
  onSearch,
}: MobileSidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 px-3">
      {/* Brand */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Go to homepage"
        className="group flex cursor-pointer items-center gap-2 font-mono text-lg font-bold tracking-tight text-neutral-100 transition-colors hover:text-white"
      >
        <span className="ml-1 font-extrabold text-rose-500">&gt;</span>

        <span>Kanban</span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          title="Search"
          className="flex size-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
        >
          <Search className="size-4" />
        </button>

        {/* Close menu */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          title="Close navigation menu"
          className="flex size-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
        >
          <X className="size-5" />
        </button>
      </div>
    </header>
  );
};

export default MobileSidebarHeader;
