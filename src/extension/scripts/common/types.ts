export enum Action {
  Toggle = "toggle",
  AskForLicenseKey = "askForLicenseKey",
  InformInvalidLicenseKey = "informInvalidLicenseKey",
  Tunnel = "tunnel",
  CheckSiteOption = "checkSiteOption",
  CheckLicenseState = "checkLicenseState",
}

export type Message<T extends Action = Action> = {
  action: T
  payload: any
}

export function AssertMessage(msg: any): Message | null {
  if (!msg || typeof msg !== "object" || !msg.action) {
    return null
  }

  return msg
}

// export type BackgroundAPI = "activateLicense" | "verifyLicense" | "deactivateLicense"

// export type BackgroundAPIPayload = {
//   activateLicense: { licenseKey: string }
//   deactivateLicense: {}
//   verifyLicense: {}
// }

export interface ContentScriptAPI {
  toggle(enabled?: boolean): void
  askForLicenseKey(): void
  informInvalidLicenseKey(licenseState: any): void
}

export interface BackgroundAPI {
  activateLicense(licenseKey: string): Promise<void>
  deactivateLicense(): Promise<void>
  verifyExistingLicense(): Promise<boolean>
}

export type PromiseFunction<T> = (...args: any[]) => Promise<T>

export interface IPromiseApiSet {
  [method: string]: PromiseFunction<any>
}
