import { createListenerRegistry } from "@/common/registry"

export class ConsoleWrapper {
  private registry = createListenerRegistry<Invocation>()
  private eventName = "invocation"
  private consoleBackup: ConsoleAPI | null = null

  constructor(private home: { console: ConsoleAPI }) {
    this.consoleBackup = home.console
  }

  get original(): ConsoleAPI {
    return this.consoleBackup
  }

  public turnOn() {
    this.home.console = this.createStub(this.consoleBackup)
    return this
  }

  public turnOff() {
    this.home.console = this.consoleBackup
    return this
  }

  public listen(fn: (inv: Invocation) => void) {
    this.registry.add(this.eventName, fn)
  }

  private createStub(c: ConsoleAPI): ConsoleAPI {
    return consoleMethods.reduce((acc, method) => {
      acc[method] = (...args: any[]) => {
        ;(c[method] as Function)(...args)
        this.registry.fire(this.eventName, { method, args })
      }
      return acc
    }, {}) as any as ConsoleAPI
  }
}

export type Invocation = {
  method: keyof ConsoleAPI
  args: any[]
}

export type ConsoleAPI = Pick<
  Console,
  "assert" | "clear" | "count" | "countReset" |
  "debug" | "dir" | "dirxml" | "error" |
  "group" | "groupCollapsed" | "groupEnd" | "info" |
  "log" | "profile" | "profileEnd" | "table" |
  "time" | "timeEnd" | "timeLog" | "timeStamp" |
  "trace" | "warn"
>

const consoleMethods: Array<keyof ConsoleAPI> = [
  "assert", "clear", "count", "countReset",
  "debug", "dir", "dirxml", "error",
  "group", "groupCollapsed", "groupEnd", "info",
  "log", "profile", "profileEnd", "table",
  "time", "timeEnd", "timeLog", "timeStamp",
  "trace", "warn",
]
