import { Action, Message } from "../common/types"

console.log("content script isolated initiated")

init()

function init() {
  checkSiteOption()
  initListeners()
}

function initListeners() {
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
}

async function checkSiteOption() {
  const siteOption = await chrome.runtime.sendMessage({ action: Action.CheckSiteOption })

  console.log("got siteOption", siteOption)

  if (!siteOption || siteOption.mode === "off") {
    return
  }

  window.postMessage(
    {
      action: Action.Tunnel,
      payload: { action: Action.Toggle, payload: siteOption },
    },
    "*"
  )
}
