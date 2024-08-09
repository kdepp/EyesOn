import { nanoid } from "nanoid"
import { IBrowserDetector, ILicenseAPI, IStorage } from "./types"

export type LicenseManagerParams = {
  api: ILicenseAPI
  uidStorage: IStorage
  licenseKeyStorage: IStorage
  licenseKeyLastVerifiedAtStorage: IStorage
  detector: IBrowserDetector
  demoDomains: string[]
  shouldVerifyLicense: (lastVerifiedAt: Date | null) => boolean
}

export enum LicenseStatus {
  Absent = "absent",
  Valid = "valid",
  Invalid = "invalid",
}

export type LicenseState = {
  status: LicenseStatus
  licenseKey: string | null
  lastVerifiedAt: string | null
}

export class LicenseManager {
  constructor(private params: LicenseManagerParams) {}

  public async getLicenseState(): Promise<LicenseState> {
    const licenseKey = await this.params.licenseKeyStorage.get()
    const lastVerifiedAt = await this.params.licenseKeyLastVerifiedAtStorage.get()
    const status: LicenseStatus = await (async () => {
      if (!(await this.hasLicenseKey())) {
        return LicenseStatus.Absent
      }

      const isValid = await this.verifyExistingLicenseIfShould()

      return isValid ? LicenseStatus.Valid : LicenseStatus.Invalid
    })()

    return {
      status,
      licenseKey,
      lastVerifiedAt,
    }
  }

  public async hasLicenseKey(): Promise<boolean> {
    return this.params.licenseKeyStorage.get() !== null
  }

  public async isPurchased(): Promise<boolean> {
    const strLastVerifiedAt = await this.getLastVerifiedAt()
    const lastVerifiedAt = strLastVerifiedAt ? new Date(strLastVerifiedAt) : null

    return lastVerifiedAt !== null && !this.params.shouldVerifyLicense(lastVerifiedAt)
  }

  public async getAvailableDomains(): Promise<string[]> {
    return (await this.isPurchased()) ? ["*"] : this.params.demoDomains
  }

  public async getDeviceUID(): Promise<string> {
    let uid = await this.params.uidStorage.get()

    if (!uid) {
      uid = nanoid()
      await this.params.uidStorage.set(uid)
    }

    return uid
  }

  public async getLastVerifiedAt(): Promise<string | null> {
    return this.params.licenseKeyLastVerifiedAtStorage.get()
  }

  public async activateLicense(licenseKey: string): Promise<void> {
    const deviceInfo = await this.params.detector.getDeviceInfo()
    const deviceUID = await this.getDeviceUID()

    await this.params.api.activateLicenseKey(licenseKey, deviceUID, deviceInfo)
    await this.params.licenseKeyStorage.set(licenseKey)
    await this.params.licenseKeyLastVerifiedAtStorage.set(new Date().toISOString())
  }

  public async deactivateLicense(): Promise<void> {
    const deviceUID = await this.getDeviceUID()
    const licenseKey = await this.params.licenseKeyStorage.get()

    if (!licenseKey) {
      return
    }

    await this.params.api.deactivateLicenseKey(licenseKey, deviceUID)
    await this.params.licenseKeyStorage.remove()
    await this.params.licenseKeyLastVerifiedAtStorage.remove()
  }

  public async verifyExistingLicenseIfShould(): Promise<boolean> {
    const strLastVerifiedAt = await this.getLastVerifiedAt()
    const lastVerifiedAt = strLastVerifiedAt ? new Date(strLastVerifiedAt) : null
    const shouldVerify = this.params.shouldVerifyLicense(lastVerifiedAt)

    if (!shouldVerify) {
      return true
    }

    return this.verifyExistingLicense()
  }

  private async verifyExistingLicense(): Promise<boolean> {
    const licenseKey = await this.params.licenseKeyStorage.get()
    const deviceUID = await this.getDeviceUID()

    if (!licenseKey) {
      return false
    }

    const isValid = await this.params.api.verifyLicenseKey(licenseKey, deviceUID)

    if (isValid) {
      await this.params.licenseKeyLastVerifiedAtStorage.set(new Date().toISOString())
    }

    return isValid
  }
}
