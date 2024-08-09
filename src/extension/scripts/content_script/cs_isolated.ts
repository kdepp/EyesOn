import { isDev } from "@/common/env"
import { Action, Message } from "../common/types"
import { LicenseStatus } from "@/services/license_manager"

if (isDev) {
  console.log("content script isolated initiated")
}

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
  const [siteOption, licenseState] = await Promise.all([
    chrome.runtime.sendMessage({ action: Action.CheckSiteOption }),
    chrome.runtime.sendMessage({ action: Action.CheckLicenseState }),
  ])

  if (isDev) {
    console.log("got siteOption", siteOption)
    console.log("got licenseState", licenseState)
  }

  if (!siteOption || siteOption.mode === "off") {
    return
  }

  switch (licenseState.status) {
    case LicenseStatus.Absent:
      postTunnelMessage({ action: Action.AskForLicenseKey, payload: null })
      break

    case LicenseStatus.Invalid:
      postTunnelMessage({ action: Action.InformInvalidLicenseKey, payload: licenseState })
      break

    case LicenseStatus.Valid:
      postTunnelMessage({ action: Action.Toggle, payload: siteOption })
      break
  }
}

function postTunnelMessage(payload: any) {
  window.postMessage(
    {
      action: Action.Tunnel,
      payload,
    },
    "*"
  )
}
