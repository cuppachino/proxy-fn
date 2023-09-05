import type { IfAsync, MaybePromise, ProxyFn } from '../types/index.js'
import { isPromise } from '../utils/is-promise.js'

/**
 * Curried proxy creator. Proxy a function, and optionally transform its arguments and/or return value.
 * @param fn The function to proxy.
 * @returns A function that accepts an object with `from` and `to` methods.
 */
export function proxyFn<
  T,
  ExpectedArgs extends any[],
  Properties extends Record<PropertyKey, any> = {}
>(fn: ((...args: ExpectedArgs) => T) & Properties) {
  /**
   * @param from A function that accepts the arguments that the proxy function will receive, and returns the arguments that the original function will receive.
   * @param to A function that accepts the return value of the original function, and returns the desired return value of the proxy function.
   * @returns `ProxyFn<From, ExpectedArgs, To>`
   * @example
   * ```ts
   * const addRandom = proxyFn(add)({
   *   async from() {
   *     const generatedNumbers = await generateNumbers();
   *     return [generatedNumbers[0], generatedNumbers[1]];
   *   },
   *   to(result) {
   *     return result * 2;
   *   }
   * });
   * const randomNumber = await addRandom()
   * ```
   */
  return <
    ReturnTypeOfFrom extends MaybePromise<[...ExpectedArgs, ...any[]]>,
    From extends any[] = ExpectedArgs,
    To = T
  >({
    from,
    to
  }: Partial<{
    from(...args: From): ReturnTypeOfFrom
    to(res: IfAsync<ReturnTypeOfFrom, Promise<T>, T>): To
  }>): ProxyFn<From, ExpectedArgs, To, Properties> => {
    if (from && to) {
      return new Proxy(fn, {
        apply(target, thisArg, argArray) {
          const args = from(...(argArray as From))
          if (isPromise(args)) {
            return Promise.resolve(args).then((awaitedArgs) => {
              return to(Reflect.apply(target, thisArg, awaitedArgs))
            })
          } else {
            return to(Reflect.apply(target, thisArg, args))
          }
        }
      }) as any
    } else if (from && !to) {
      return new Proxy(fn, {
        apply(target, thisArg, argArray) {
          const args = from(...(argArray as From))
          if (isPromise(args)) {
            return Promise.resolve(args).then((awaitedArgs) =>
              Reflect.apply(target, thisArg, awaitedArgs)
            )
          } else {
            return Reflect.apply(target, thisArg, args)
          }
        }
      }) as any
    } else if (!from && to) {
      return new Proxy(fn, {
        apply(target, thisArg, argArray) {
          return to(Reflect.apply(target, thisArg, argArray))
        }
      }) as any
    } else {
      return new Proxy(fn, {}) as any
    }
  }
}
