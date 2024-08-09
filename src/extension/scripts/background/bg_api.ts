import config from "@/config"
import { SiteOption, SiteOptionStorage } from "@/extension/services/site_options_storage"
import { BrowserDetector } from "@/services/browser_detector"
import { LicenseAPI } from "@/services/license_api"
import { LicenseManager, LicenseState } from "@/services/license_manager"
import { SyncStorage } from "@/services/sync_storage"

export async function checkSiteOption(_: any, url: string | null): Promise<SiteOption | null> {
  try {
    const storage = new SiteOptionStorage()
    return await storage.getSiteOptionForURL(url)
  } catch (e) {
    console.error("failed when handling getSiteOptionForURL", e)
    return null
  }
}

export async function checkLicenseState(): Promise<LicenseState | null> {
  try {
    const licenseManager = getLicenseManager()
    return await licenseManager.getLicenseState()
  } catch (e) {
    console.error("failed when handling getLicenseState", e)
    return null
  }
}

export function activateLicense(licenseKey: string): Promise<void> {
  return getLicenseManager().activateLicense(licenseKey)
}

export function deactivateLicense(): Promise<void> {
  return getLicenseManager().deactivateLicense()
}

export function verifyExistingLicenseIfShould(): Promise<boolean> {
  return getLicenseManager().verifyExistingLicenseIfShould()
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
