import { AppMode, SiteOption } from "@/extension/services/site_options_storage"
import { State } from "./state"
import { renderUI } from "./ui"
import { Invocation } from "@/services/types"
import { ConsoleWrapper } from "@/services/console_wrapper"
import { isDev } from "@/common/env"
import { FetchWrapper } from "@/services/fetch_wrapper"
import { nanoid } from "nanoid"
import { XMLHttpRequestWrapper } from "@/services/xhr_wrapper"
import type { BackgroundAPIs } from "../common/api_types"
import { LicenseState, LicenseStatus } from "@/services/license_manager"

export type ContentScriptMainAPIs = ReturnType<typeof createAPIs>

export function createAPIs(state: State, backgroundAPIs: BackgroundAPIs) {
  const apis = {
    async renderAccordingly(licenseState: LicenseState, siteOption?: SiteOption) {
      if (isDev) {
        console.log("got siteOption", siteOption)
        console.log("got licenseState", licenseState)
      }

      // TODO: remove this test code
      licenseState.status = LicenseStatus.Valid as LicenseStatus

      switch (licenseState.status) {
        case LicenseStatus.Absent:
          console.warn("TODO: Ask for license key")
          break

        case LicenseStatus.Invalid:
          console.warn("TODO: Inform invalid license key")
          break

        case LicenseStatus.Valid:
          apis.toggleEyeson(siteOption)
          break
      }
    },
    async toggleEyeson(siteOption?: SiteOption) {
      // TODO: Pass other fields in innerMsg.payload (type: SiteOption) to UI
      state.enabled = siteOption?.mode === AppMode.Dev

      if (state.enabled && !state.initialized) {
        initApp(state)
      }
    },
  }

  return apis
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
