/**
 * Sentry stub — used at build time to avoid bundling the heavy @sentry/* tree
 * (react + browser + core = 200+ ESM files → deadlocks Rollup on macOS).
 *
 * At runtime Sentry is loaded dynamically only when VITE_SENTRY_DSN is set.
 * Since the SDK is initialised lazily in analytics.ts behind an env-var guard,
 * missing these symbols at module-parse time is safe.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any

const noop: AnyFn = () => undefined

export const init: AnyFn = noop
export const captureException: AnyFn = noop
export const captureMessage: AnyFn = noop
export const setUser: AnyFn = noop
export const setTag: AnyFn = noop
export const setContext: AnyFn = noop
export const addBreadcrumb: AnyFn = noop
export const withScope: AnyFn = (cb: AnyFn) => cb({ setExtra: noop, setTag: noop })
export const Scope = class {}
export const ErrorBoundary = ({ children }: { children: unknown }) => children
export const withErrorBoundary = (c: unknown) => c
export const withSentryRouting = (c: unknown) => c
export const withProfiler = (c: unknown) => c
export const useProfiler: AnyFn = noop
export const BrowserTracing = class {}
export const Replay = class {}
