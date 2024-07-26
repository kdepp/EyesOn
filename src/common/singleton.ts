export type AnyFunc = (...args: any[]) => any

export type SingletonFactory<FuncT extends AnyFunc> = (
  ...args: Parameters<FuncT> | []
) => ReturnType<FuncT>

export function singletonGetter<T extends AnyFunc>(factoryFn: T): SingletonFactory<T> {
  let instance: ReturnType<T> | null = null

  return (...args: Parameters<T> | []): ReturnType<T> => {
    if (instance) {
      return instance
    }

    instance = factoryFn(...args)
    return instance as ReturnType<T>
  }
}
