import { useParams } from "react-router-dom";

import { RequireWorkspace } from "../RequireWorkspace.tsx";

/**
 * `/boards/:boardId` predates scoped routes, so the id has to survive the hop
 * to the workspace-scoped path.
 *
 * Its own file: a component declared inside a route module, where the only
 * export is the route array, is what react-refresh reports.
 */
export function LegacyBoardPath() {
  const { boardId } = useParams<{ boardId: string }>();

  return <RequireWorkspace to={`/boards/${boardId ?? ""}`} />;
}
