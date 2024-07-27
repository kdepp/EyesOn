import { nanoid } from "nanoid"
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
    return [...consoleMethods, ...nonStandardMethods].reduce((acc, method) => {
      acc[method] = (...args: any[]) => {
        ;(c[method] as Function)(...args)
        this.registry.fire(this.eventName, {
          args,
          id: nanoid(),
          method: method as any,
        })
      }
      return acc
    }, {}) as any as ConsoleAPI
  }
}

export type Invocation = {
  id: string
  method: keyof ConsoleAPI
  args: any[]
}

export type ConsoleAPI = Pick<
  Console,
  "assert" | "clear" | "count" | "countReset" |
  "debug" | "dir" | "dirxml" | "error" |
  "group" | "groupCollapsed" | "groupEnd" | "info" |
  "log" |  "table" | "time" | "timeEnd" | "timeLog" | "timeStamp" |
  "trace" | "warn" // | "profile" | "profileEnd"
>

const consoleMethods: Array<keyof ConsoleAPI> = [
  "assert", "clear", "count", "countReset",
  "debug", "dir", "dirxml", "error",
  "group", "groupCollapsed", "groupEnd", "info",
  "log", "table", "time", "timeEnd", "timeLog", "timeStamp",
  "trace", "warn",
]

const nonStandardMethods: string[] = ["profile", "profileEnd"]
