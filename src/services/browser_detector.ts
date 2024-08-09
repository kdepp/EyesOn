import { detect } from "detect-browser"
import { IBrowserDetector } from "./types"

export class BrowserDetector implements IBrowserDetector {
  public getDeviceInfo() {
    const info = detect()

    return {
      ua: window.navigator.userAgent,
      os: info.os,
      browser: info.name,
      version: info.version,
    }
  }
}
