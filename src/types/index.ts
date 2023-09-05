/**
 * Extract properties attached to a function.
 */
export type Assigned<T> = T extends (...args: any[]) => any
  ? {
      [K in keyof T]: {
        [V in K]: T[K]
      }
    }[keyof T]
  : {
      [K in keyof T]: T[K]
    }

/**
 * Either the type of `T`, or the type of `T` wrapped in a promise. If `T` is already a promise, it is not wrapped.
 */
export type MaybePromise<T> =
  | DefinitelyAwaited<T>
  | Promise<DefinitelyAwaited<T>>

/**
 * Infer the inner type of a promise if `T` is a promise, otherwise return `T`.
 */
export type DefinitelyAwaited<T> = T extends Promise<infer U> ? Awaited<U> : T

/**
 * If `T` is unknown, return `Default`, otherwise return `T`.
 */
export type DefaultParameters<T extends any[], Default extends any[]> = [
  undefined
] extends [T]
  ? Default extends any[]
    ? Default
    : never
  : T extends any[]
  ? T
  : never

/**
 * Check if `T` is a promise. If it is, return `Then`, otherwise return `Else`.
 */
export type IfAsync<T, Then, Else> = T extends Promise<any> ? Then : Else

/**
 * The Proxy created by `proxyFn`.
 *
 * @param From The arguments that the proxy function will receive.
 * @param FromShouldBe The arguments that the original function will receive, and that `From` will be converted to.
 * @param To The return type of the proxy function.
 */
export type ProxyFn<
  From extends any[],
  FromShouldBe extends any[],
  To,
  Properties extends Record<PropertyKey, any> = {}
> = ((
  ...args: DefaultParameters<From, FromShouldBe>
) => IfAsync<To, Promise<DefinitelyAwaited<To>>, DefinitelyAwaited<To>>) & {
  [K in keyof Properties]: Properties[K]
}
