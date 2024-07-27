import { Action, Message } from "../common/types"

console.log("content script isolated initiated")

chrome.runtime.onMessage.addListener((msg: Message) => {
  switch (msg.action) {
    case Action.Toggle:
      window.postMessage(
        {
          action: Action.Tunnel,
          payload: msg,
        },
        "*"
      )
      break

    default:
      throw new Error(`Unknown action: ${msg.action}`)
  }
})
