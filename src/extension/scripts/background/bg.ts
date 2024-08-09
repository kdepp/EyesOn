import { AppMode, SiteOptionStorage, negateMode } from "@/extension/services/site_options_storage"
import { isDev } from "@/common/env"
import { backgroundAPIs } from "./bg_api"
import { exposeBackgroundAPIs } from "../common/api_utils"

if (isDev) {
  console.log("background!!!")
}

init()

function init() {
  initListeners()
  exposeBackgroundAPIs(backgroundAPIs)
}

function initListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
      return
    }

    await updateSiteOption(tab.url)
    await backgroundAPIs.repaintInCurrentTab({ tab })
  })
}

async function updateSiteOption(url: string) {
  const storage = new SiteOptionStorage()
  let siteOption = await storage.getSiteOptionForURL(url)

  if (siteOption) {
    siteOption.mode = negateMode(siteOption.mode)
    await storage.update(siteOption)
  } else {
    siteOption = {
      id: "",
      domain: new URL(url).hostname,
      isDomainLevel: true,
      mode: AppMode.Dev,
    }
    await storage.add(siteOption)
  }
}
