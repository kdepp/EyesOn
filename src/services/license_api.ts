import { DeviceInfo, ILicenseAPI } from "./types"
import axios from "axios"

type APIResponse<T> = {
  error_code: number
  data: T
  message?: string
}

export class LicenseAPI implements ILicenseAPI {
  constructor(private base: string, private productId: string) {}

  public async verifyLicenseKey(licenseKey: string, deviceUID: string): Promise<boolean> {
    const url = `${this.base}/verifyLicense`
    const res = await axios.post<APIResponse<boolean>>(url, {
      licenseKey,
      deviceUID,
      productId: this.productId,
    })

    if (res.status === 200 && res.data.error_code === 0) {
      return !!res.data.data
    }

    return false
  }

  public async deactivateLicenseKey(licenseKey: string, deviceUID: string): Promise<void> {
    const url = `${this.base}/deactivateDeviceForLicense`
    const res = await axios.post<APIResponse<boolean>>(url, {
      licenseKey,
      deviceUID,
      productId: this.productId,
    })

    if (res.status === 200 && res.data.error_code === 0) {
      return
    }

    throw new Error(res.data.message ?? "Unknown error for deactivating license key")
  }

  public async activateLicenseKey(
    licenseKey: string,
    deviceUID: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const url = `${this.base}/activateDeviceForLicense`
    const res = await axios.post<APIResponse<boolean>>(url, {
      licenseKey,
      deviceUID,
      deviceInfo,
      productId: this.productId,
    })

    if (res.status === 200 && res.data.error_code === 0) {
      return
    }

    throw new Error(res.data.message ?? "Unknown error for activating license key")
  }
}
