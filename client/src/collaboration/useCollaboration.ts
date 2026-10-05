/**
 * React hook that owns a YjsProvider lifecycle for a
 * single collaboration room (typically a board).
 *
 * Usage:
 *
 *   const { doc, awareness, status, peers } = useCollaboration({
 *     room: boardId,
 *     wsUrl: boardId
 *       ? `${WS_BASE}/collab?room=${boardId}&token=${token}`
 *       : null,
 *     user: currentUser
 *       ? {
 *           userId: currentUser.id,
 *           name: currentUser.name,
 *           color: currentUser.color,
 *         }
 *       : null,
 *   });
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

import type { AwarenessUser } from "./awareness";
import {
  YjsProvider,
  type ProviderStatus,
  type YjsProviderOptions,
} from "./YjsProvider";

export type CollabStatus = ProviderStatus;

export interface UseCollaborationOptions {
  /** Document / room name (e.g. boardId). Null disables collaboration. */
  room: string | null;
  /** Full WebSocket URL including auth query params. Null disables. */
  wsUrl: string | null;
  /** Local user identity for awareness. Null disables. */
  user: AwarenessUser | null;
  /** When false the provider will not connect. Default true. */
  enabled?: boolean;
}

export interface UseCollaborationResult {
  doc: Y.Doc | null;
  awareness: Awareness | null;
  status: CollabStatus;
  peers: AwarenessUser[];
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export function useCollaboration({
  room,
  wsUrl,
  user,
  enabled = true,
}: UseCollaborationOptions): UseCollaborationResult {
  const [status, setStatus] = useState<CollabStatus>("idle");
  const [peers, setPeers] = useState<AwarenessUser[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);

  const providerRef = useRef<YjsProvider | null>(null);

  const userId = user?.userId ?? null;
  const userName = user?.name ?? null;
  const userColor = user?.color ?? null;

  /**
   * Stable identity for the awareness user.
   *
   * Callers commonly pass a fresh object literal every render
   * (`user: currentUser ? { userId, name, color } : null`). Depending on that
   * object directly made the connect effect re-run on every render — tearing
   * the socket down and reopening it, i.e. an endless stream of connections.
   * Keying the memo on the primitive fields keeps the effect stable.
   *
   * Only the identity fields are carried; `cursor` is ephemeral and no caller
   * sets it today, so it is intentionally not reconstructed here.
   */
  const stableUser = useMemo<AwarenessUser | null>(() => {
    if (!userId) return null;
    const next: AwarenessUser = { userId };
    if (userName !== null) next.name = userName;
    if (userColor !== null) next.color = userColor;
    return next;
  }, [userId, userName, userColor]);

  // Stable identity key — reconnect only when meaningful inputs change.
  const sessionKey = useMemo(() => {
    if (!enabled || !room || !wsUrl || !stableUser) return null;
    return `${room}::${wsUrl}::${stableUser.userId}`;
  }, [enabled, room, wsUrl, stableUser]);

  const publishProvider = useCallback((provider: YjsProvider | null) => {
    if (provider) {
      setDoc(provider.doc);
      setAwareness(provider.awareness);
      setError(null);
      setPeers([]);
    } else {
      setDoc(null);
      setAwareness(null);
      setPeers([]);
      setError(null);
      setStatus("idle");
    }
  }, []);

  const destroyProvider = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!sessionKey || !wsUrl || !stableUser) return;

    destroyProvider();

    const options: YjsProviderOptions = {
      url: wsUrl,
      user: stableUser,
      onStatus: setStatus,
      onPeers: setPeers,
      onError: setError,
    };

    const provider = new YjsProvider(options);
    providerRef.current = provider;
    publishProvider(provider);
    provider.connect();
  }, [sessionKey, wsUrl, stableUser, destroyProvider, publishProvider]);

  const disconnect = useCallback(() => {
    destroyProvider();
    setDoc(null);
    setAwareness(null);
    setPeers([]);
    setError(null);
    setStatus("disconnected");
  }, [destroyProvider]);

  // External system: YjsProvider + WebSocket.
  // React state updates are scheduled asynchronously so the
  // effect body never calls setState synchronously (React Compiler).
  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const schedule = (fn: () => void) => {
      frame = requestAnimationFrame(() => {
        if (!cancelled) fn();
      });
    };

    if (!sessionKey || !wsUrl || !stableUser) {
      destroyProvider();
      schedule(() => publishProvider(null));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    const options: YjsProviderOptions = {
      url: wsUrl,
      user: stableUser,
      onStatus: setStatus,
      onPeers: setPeers,
      onError: setError,
    };

    const provider = new YjsProvider(options);
    providerRef.current = provider;

    schedule(() => {
      publishProvider(provider);
      provider.connect();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      provider.destroy();
      if (providerRef.current === provider) {
        providerRef.current = null;
      }
    };
  }, [sessionKey, wsUrl, stableUser, destroyProvider, publishProvider]);

  // Push user metadata into the external awareness system only.
  // No React setState here.
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider || !stableUser) return;
    provider.updateUser(stableUser);
  }, [stableUser]);

  return {
    doc,
    awareness,
    status,
    peers,
    error,
    connect,
    disconnect,
  };
}
