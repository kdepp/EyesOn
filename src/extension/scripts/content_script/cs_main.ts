import { ConsoleWrapper } from "@/services/console_wrapper"
import { renderUI } from "./ui"
import { Action, AssertMessage } from "../common/types"
import { State, initState } from "./state"
import { isDev } from "@/common/env"
import type { Invocation } from "@/services/types"
import { FetchWrapper } from "@/services/fetch_wrapper"
import { nanoid } from "nanoid"
import { XMLHttpRequestWrapper } from "@/services/xhr_wrapper"
import { AppMode } from "@/extension/services/site_options_storage"

init()

function init() {
  const state = initState()
  bindTunnelMessage(state)
}

function initApp(state: State) {
  initUI(state)
  initWrappers(state)
}

function initUI(state: State) {
  setTimeout(() => {
    renderUI(state)
    state.initialized = true
  }, 500)
}

function initWrappers(state: State) {
  const console = initConsoleWrapper(state.entries)
  initHttpWrapper(state.entries, console.original as any)
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
        // TODO: Pass other fields in innerMsg.payload (type: SiteOption) to UI
        state.enabled = innerMsg.payload?.mode === AppMode.Dev

        if (state.enabled && !state.initialized) {
          initApp(state)
        }

        break

      case Action.Tunnel:
        throw new Error("Tunnel message is not expected here")

      default:
        throw new Error(`Unknown action: ${msg.action}`)
    }
  })
}
