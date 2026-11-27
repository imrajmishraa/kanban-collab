import {
  dismissToast,
  toastError,
  toastInfo,
  toastLoading,
  toastPromise,
  toastSuccess,
  toastWarning,
} from "@/lib/toast";

/**
 * Every toast the app can raise, behind one import.
 *
 * The seven calls live in `lib/toast.ts` because that is where the options are
 * built and where a service may import them without touching React. This is the
 * same seven, gathered: a component writes
 *
 * ```tsx
 * const toast = useToast();
 * toast.success("Board saved", "Twelve cards moved to Done.");
 * ```
 *
 * instead of importing whichever of the seven it happens to need, and a later
 * edit that adds `toast.warning` to the same file costs no import change.
 *
 * The signatures are `typeof` the library's own functions, so this file can
 * never drift from them: a new option on `toastSuccess` shows up here for free.
 */
export interface ToastApi {
  /** A result the reader asked for. 3s. */
  success: typeof toastSuccess;
  /** Something that happened, no verdict. 4s. */
  info: typeof toastInfo;
  /** Still worked, but worth a look. 4s. */
  warning: typeof toastWarning;
  /** Did not work. 6s — it has to be read *and* acted on. */
  error: typeof toastError;
  /** Stays until something replaces it — pair it with an `id`. */
  loading: typeof toastLoading;
  /** Loading, then success or error, in one toast. */
  promise: typeof toastPromise;
  /** One toast by id, or all of them. */
  dismiss: typeof dismissToast;
}

/**
 * Built once, at module scope.
 *
 * These are functions with no state, so one object serves every caller and a
 * component never re-renders because of it. `useToast()` hands back this same
 * reference, which is why it is safe to leave it out of a `useCallback`'s
 * dependencies — and why two components can compare it with `===`.
 */
export const toastApi: ToastApi = {
  success: toastSuccess,
  info: toastInfo,
  warning: toastWarning,
  error: toastError,
  loading: toastLoading,
  promise: toastPromise,
  dismiss: dismissToast,
};

/** The same object, from a hook, for a component that prefers that shape. */
export function useToast(): ToastApi {
  return toastApi;
}
