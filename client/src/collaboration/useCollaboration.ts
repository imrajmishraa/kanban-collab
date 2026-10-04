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

  // Stable identity key — reconnect only when meaningful inputs change.
  const sessionKey = useMemo(() => {
    if (!enabled || !room || !wsUrl || !user) return null;
    return `${room}::${wsUrl}::${user.userId}`;
  }, [enabled, room, wsUrl, user?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!sessionKey || !wsUrl || !user) return;

    destroyProvider();

    const options: YjsProviderOptions = {
      url: wsUrl,
      user,
      onStatus: setStatus,
      onPeers: setPeers,
      onError: setError,
    };

    const provider = new YjsProvider(options);
    providerRef.current = provider;
    publishProvider(provider);
    provider.connect();
  }, [sessionKey, wsUrl, user, destroyProvider, publishProvider]);

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

    if (!sessionKey || !wsUrl || !user) {
      destroyProvider();
      schedule(() => publishProvider(null));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    const options: YjsProviderOptions = {
      url: wsUrl,
      user,
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
  }, [sessionKey, wsUrl, user, destroyProvider, publishProvider]);

  // Push user metadata into the external awareness system only.
  // No React setState here.
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider || !user) return;
    provider.updateUser(user);
  }, [user]);

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
