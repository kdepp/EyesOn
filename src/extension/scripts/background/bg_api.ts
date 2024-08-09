import config from "@/config"
import { SiteOption, SiteOptionStorage } from "@/extension/services/site_options_storage"
import { BrowserDetector } from "@/services/browser_detector"
import { LicenseAPI } from "@/services/license_api"
import { LicenseManager, LicenseState } from "@/services/license_manager"
import { SyncStorage } from "@/services/sync_storage"
import { contentScriptAPIsForBackground } from "../common/api_utils"

export type BackgroundAPIs = typeof backgroundAPIs

export const backgroundAPIs = {
  repaintInCurrentTab(sender?: chrome.runtime.MessageSender): Promise<null> {
    // Call content script API after this request is returned
    // to avoid requests stacking on each other
    console.log("repaintInCurrentTab, sender", sender)

    if (sender?.tab?.id) {
      const csAPIs = contentScriptAPIsForBackground(sender.tab.id)

      Promise.all([
        backgroundAPIs.checkSiteOption(sender),
        backgroundAPIs.checkLicenseState(),
      ]).then(([siteOption, licenseState]) => {
        console.log("repaintInCurrentTab, siteOption, licenseState", siteOption, licenseState)
        return csAPIs.renderAccordingly(licenseState, siteOption)
      })
    }

    return Promise.resolve(null)
  },
  async checkSiteOption(sender?: chrome.runtime.MessageSender): Promise<SiteOption | null> {
    try {
      const storage = new SiteOptionStorage()
      return await storage.getSiteOptionForURL(sender?.tab?.url)
    } catch (e) {
      console.error("failed when handling getSiteOptionForURL", e)
      return null
    }
  },
  async checkLicenseState(): Promise<LicenseState | null> {
    try {
      const licenseManager = getLicenseManager()
      return await licenseManager.getLicenseState()
    } catch (e) {
      console.error("failed when handling getLicenseState", e)
      return null
    }
  },
  activateLicense(licenseKey: string): Promise<null> {
    return getLicenseManager()
      .activateLicense(licenseKey)
      .then(() => null)
  },
  deactivateLicense(): Promise<void> {
    return getLicenseManager()
      .deactivateLicense()
      .then(() => null)
  },
  verifyExistingLicenseIfShould(): Promise<null> {
    return getLicenseManager()
      .verifyExistingLicenseIfShould()
      .then(() => null)
  },
}

function getLicenseManager() {
  return new LicenseManager({
    demoDomains: config.demoDomains,
    shouldVerifyLicense: (lastVerifiedAt: Date | null) => {
      return (
        lastVerifiedAt === null ||
        new Date().getTime() - lastVerifiedAt.getTime() > config.verifyLicenseInterval
      )
    },
    api: new LicenseAPI(config.licenseAPIBaseURL, config.productId),
    detector: new BrowserDetector(),
    uidStorage: new SyncStorage("device_uid"),
    licenseKeyStorage: new SyncStorage("license_key"),
    licenseKeyLastVerifiedAtStorage: new SyncStorage("license_key_last_verified_at"),
  })
}
