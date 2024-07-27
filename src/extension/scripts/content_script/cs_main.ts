import { ConsoleWrapper, Invocation } from "@/services/console_wrapper"
import { renderUI } from "./ui"
import { Action, AssertMessage } from "../common/types"
import { State, initState } from "./state"

init()

function init() {
  const state = initState()

  bindTunnelMessage(state)
  initConsoleWrapper(state.entries)
  initUI(state)
}

function initUI(state: State) {
  setTimeout(() => {
    renderUI(state)
  }, 500)
}

function initConsoleWrapper(entries: Invocation[]) {
  const csw = new ConsoleWrapper(self as any).turnOn()

  csw.listen((inv) => {
    entries.push(inv)
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
