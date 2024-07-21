
type Listener<T> = (val: T) => void

export type RegistryOptions<T, V> = {
  process: (item: T, data: V, id: string) => void
  onZero?: (id: string) => void
  onOne?: (id: string) => void
}

export class Registry<T, V> {
  private cache: Record<string, T[]>

  constructor(private params: RegistryOptions<T, V>) {
    this.cache = {}
  }

  add(id: string, obj: T) {
    this.cache[id] = this.cache[id] || []
    this.cache[id].push(obj)

    if (this.cache[id].length === 1) {
      try {
        this.params.onOne?.(id)
      } catch (e) {
        console.error('in onOne, ' + e.message)
      }
    }

    return true
  }

  remove(id: string, obj: T) {
    if (!this.cache[id]) {
      return false
    }

    this.cache[id] = this.cache[id].filter((item: T) => item !== obj)

    if (this.cache[id].length === 0) {
      try {
        this.params.onZero?.(id)
      } catch (e) {
        console.error('in onZero, ' + e.message)
      }
    }

    return true
  }

  removeAllWithData(obj: T) {
    Object.keys(this.cache).forEach((id) => {
      for (let i = this.cache[id].length - 1; i >= 0; i--) {
        if (this.cache[id][i] === obj) {
          this.remove(id, this.cache[id][i])
        }
      }
    })
  }

  fire(id: string, data: V) {
    if (!this.cache[id]) {
      return false
    }

    this.cache[id].forEach((item: any) => {
      try {
        this.params.process(item, data, id)
      } catch (e) {
        console.error('in process, ' + e.message)
      }
    })
    return true
  }

  has(id: string) {
    return this.cache[id] && this.cache[id].length > 0
  }

  keys() {
    return Object.keys(this.cache).filter((key) => this.cache[key] && this.cache[key].length > 0)
  }

  destroy() {
    Object.keys(this.cache).forEach((id: string) => {
      try {
        this.params.onZero?.(id)
      } catch (e) {
        console.error('in onZero, ' + e.message)
      }
    })

    this.cache = {}
  }
}

export function createListenerRegistry<T>() {
  return new Registry<Listener<T>, T>({
    process: (fn: Listener<T>, data: T, _) => {
      fn(data)
    }
  })
}
