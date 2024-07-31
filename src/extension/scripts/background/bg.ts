import { AppMode, SiteOptionStorage, negateMode } from "@/extension/services/site_options_storage"
import { Action } from "../common/types"

console.log("background!!!")

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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("msg", msg)
  console.log("sender", sender)

  switch (msg.action) {
    case Action.CheckSiteOption:
      const url = sender.tab?.url

      if (!url) {
        return sendResponse(null)
      }

      const storage = new SiteOptionStorage()

      storage
        .getSiteOptionForURL(url)
        .then((option) => {
          console.log("result of getSiteOptionForURL", option)
          sendResponse(option)
        })
        .catch((err) => {
          console.error("failed when handling getSiteOptionForURL", err)
          sendResponse(null)
        })

      return true
  }
})
