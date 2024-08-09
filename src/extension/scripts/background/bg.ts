import { AppMode, SiteOptionStorage, negateMode } from "@/extension/services/site_options_storage"
import { Action } from "../common/types"
import { isDev } from "@/common/env"
import * as backgroundAPIs from "./bg_api"
import { exposeAPIs } from "../common/api_utils"

if (isDev) {
  console.log("background!!!")
}

init()

function init() {
  initListeners()
  exposeAPIs(backgroundAPIs)
}

function initListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
      return
    }

    const storage = new SiteOptionStorage()
    let siteOption = await storage.getSiteOptionForURL(tab.url)

    if (siteOption) {
      siteOption.mode = negateMode(siteOption.mode)
      await storage.update(siteOption)
    } else {
      siteOption = {
        id: "",
        domain: new URL(tab.url).hostname,
        isDomainLevel: true,
        mode: AppMode.Dev,
      }
      await storage.add(siteOption)
    }

    chrome.tabs.sendMessage(tab.id, {
      action: Action.Toggle,
      payload: siteOption,
    })
  })
}
