import { ConsoleWrapper } from "@/services/console_wrapper"
import { renderUI } from "./ui"
import { Action, AssertMessage } from "../common/types"
import { State, initState } from "./state"
import { isDev } from "@/common/env"
import type { Invocation } from "@/services/types"
import { FetchWrapper } from "@/services/fetch_wrapper"
import { nanoid } from "nanoid"
import { XMLHttpRequestWrapper } from "@/services/xhr_wrapper"

init()

function init() {
  const state = initState()

  bindTunnelMessage(state)
  initUI(state)

  const console = initConsoleWrapper(state.entries)
  initHttpWrapper(state.entries, console.original as any)
}

function initUI(state: State) {
  setTimeout(() => {
    renderUI(state)
  }, 500)
}

function initConsoleWrapper(entries: Invocation[]): ConsoleWrapper {
  const csw = new ConsoleWrapper(self as any).turnOn()

  csw.listen((inv) => {
    switch (inv.method) {
      case "log":
      case "info":
      case "debug":
      case "warn":
      case "error":
        entries.push(inv)
        break

      default:
        if (isDev) {
          csw.original.debug(`ConsoleWrapper: Method ${inv.method} is discarded for now`, inv)
        }

        break
    }
  })

  return csw
}

function initHttpWrapper(entries: Invocation[], console: typeof window.console) {
  initFetchWrapper(entries, console)
  initXHRWrapper(entries, console)
}

function initFetchWrapper(entries: Invocation[], console: typeof window.console) {
  const fw = new FetchWrapper(self).turnOn()

  fw.listen((inv) => {
    if (isDev) {
      console.debug("FetchWrapper: Invocation", inv, inv.args[0].request.url)
    }

    const index = entries.findIndex((entry) => entry.id === inv.id)

    if (index === -1) {
      entries.push(inv)
    } else {
      // update id to force repaint in list UI
      entries.splice(index, 1, { ...inv, id: nanoid() })
    }
  })
}

function initXHRWrapper(entries: Invocation[], console: typeof window.console) {
  const wrapper = new XMLHttpRequestWrapper(self).turnOn()

  wrapper.listen((inv) => {
    if (isDev) {
      console.debug("XMLHttpRequestWrapper: Invocation", inv, inv.args[0].request.url)
    }

    const index = entries.findIndex((entry) => entry.id === inv.id)

    if (index === -1) {
      entries.push(inv)
    } else {
      // update id to force repaint in list UI
      entries.splice(index, 1, { ...inv, id: nanoid() })
    }
  })
}

function bindTunnelMessage(state: State) {
  window.addEventListener("message", (event) => {
    const msg = AssertMessage(event.data)

    if (!msg || msg.action !== Action.Tunnel) {
      return
    }

    const innerMsg = AssertMessage(msg.payload)

    if (!innerMsg) {
      return
    }

    switch (innerMsg.action) {
      case Action.Toggle:
        state.enabled = !state.enabled
        break

      case Action.Tunnel:
        throw new Error("Tunnel message is not expected here")

      default:
        throw new Error(`Unknown action: ${msg.action}`)
    }
  })
}
