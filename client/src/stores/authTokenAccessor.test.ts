import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
  setAuthSession,
} from "./authTokenAccessor";
import { useAuthStore } from "./useAuthStore";

const user = {
  id: "u1",
  email: "raj@example.com",
  fullName: "Raj Mishra",
};

describe("authTokenAccessor", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      accessToken: null,
    });
  });

  it("setAuthSession moves status, user and token together", () => {
    setAuthSession("token-1", user);

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("token-1");
    expect(getAccessToken()).toBe("token-1");
  });

  it("recovers a session the store had already written off", () => {
    // The exact case the interceptor used to get wrong: a refresh succeeds
    // while the store still says "unauthenticated", so the guards bounced the
    // user to /auth/login despite a valid token.
    useAuthStore.setState({ status: "unauthenticated" });

    setAuthSession("token-2", user);

    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("setAccessToken stays token-only, so callers cannot half-authenticate by accident", () => {
    setAccessToken("token-3");

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("token-3");
    expect(state.status).toBe("unauthenticated");
    expect(state.user).toBeNull();
  });

  it("clearAuthSession drops all three", () => {
    setAuthSession("token-4", user);

    clearAuthSession();

    const state = useAuthStore.getState();
    expect(state.status).toBe("unauthenticated");
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
