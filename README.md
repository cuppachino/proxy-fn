# proxy-fn

Proxy a function and optionally transform its parameters and output.

| Type safety | Ok |
| - | - |
| Infers promises | ✅ |
| Retains properties assigned to the function | ✅ |
| Constrains the return type of `from` to extend the original function's parameters | ✅ |

#### Example function

```ts
const add = (a: number, b: number) => a + b
```

### From

```ts
/**
 * ```ts
 * (a: number, b: number, ...args: number[]) => number
 *
 * ProxyFn<
 *   // From
 *   [a: number, b: number, ...args: number[]],
 *   // ExpectedArgs
 *   [a: number, b: number],
 *   // ActualArgs
 *   [number, number]
 *   // To
 *   number,
 *   // Original function
 *   (a: number, b: number) => number
 * >
 * ```
 */
const addMany = proxyFn(add)({
  from(a, b, ...args: number[]) {
    return [a, args.reduce(add, b)]
  }
})

addMany(1, 2, 3, 4) // number
```

### To

```ts
/**
 * ```ts
 * (a: number, b: number) => Promise<readonly [number, string]>
 *
 * ProxyFn<
 *   // From
 *   [a: number, b: number],
 *   // ExpectedArgs
 *   [a: number, b: number],
 *   // ActualArgs
 *   MaybePromise<[a: number, b: number, ...any[]]>,
 *   // To
 *   Promise<readonly [number, string]>,
 *   // Original function
 *   (a: number, b: number) => number
 * >
 * ```
 */
const infersPromises = proxyFn(add)({
  async to(sum) {
    const data = await Promise.resolve(`data for ${sum}`)
    return [sum, data] as const
  }
})

infersPromises(4, 8) // Promise<[sum: number, msg: string]>
```

### From & To

```ts
/**
 * ```ts
 * () => Promise<[sum: number, msg: string]>
 *
 * ProxyFn<
 *   // From
 *   [],
 *   // ExpectedArgs
 *   [a: number, b: number],
 *   // ActualArgs
 *   Promise<[number, number]>,
 *   // To
 *   [sum: number, msg: string],
 *   // Original function
 *   ((a: number, b: number) => number) & { name: string; }
 * >
 * ```
 */
const inferProperties = proxyFn(Object.assign(add.bind(null), { name: 'foo' }))(
  {
    async from() {
      const a = await Promise.resolve(1)
      const b = await Promise.resolve(2)
      return [a, b]
    },
    to(sum): [sum: number, msg: string] {
      return [sum, 'msg']
    }
  }
)

inferProperties() // Promise<[sum: number, msg: string]>
```
