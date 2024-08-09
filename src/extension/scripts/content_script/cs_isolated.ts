import { isDev } from "@/common/env"
import {
  backgroundAPIsForContentScriptIsolated,
  tunnelBackgroundToContentScriptMain,
  tunnelContentScriptMainToBackground,
} from "../common/api_utils"
import type { BackgroundAPIs } from "../common/api_types"

if (isDev) {
  console.log("content script isolated initiated")
}

init()

function init() {
  initListeners()
  tellBackgroundToRepaint()
}

function initListeners() {
  tunnelBackgroundToContentScriptMain()
  tunnelContentScriptMainToBackground()
}

function tellBackgroundToRepaint() {
  const api = backgroundAPIsForContentScriptIsolated<BackgroundAPIs>()
  api.repaintInCurrentTab()
}
