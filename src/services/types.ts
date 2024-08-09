export type ConsoleAPI = Pick<
  Console,
  "assert" | "clear" | "count" | "countReset" |
  "debug" | "dir" | "dirxml" | "error" |
  "group" | "groupCollapsed" | "groupEnd" | "info" |
  "log" |  "table" | "time" | "timeEnd" | "timeLog" | "timeStamp" |
  "trace" | "warn" // | "profile" | "profileEnd"
>

export type Invocation<ArgsT = any[]> = {
  id: string
  method: keyof ConsoleAPI | "fetch" | "xhr"
  args: ArgsT
}

export type RequestPayload =
  | string
  | Document
  | Blob
  | DataView
  | File
  | FormData
  | URLSearchParams
  | ArrayBuffer
  | ArrayBufferView
  | ReadableStream<Uint8Array>

export type RequestKeyInfo = {
  url: string
  method: string
  headers: Record<string, string>
  payload?: RequestPayload
}

export type ResponseKeyInfo = {
  code: number
  body: ResponseContent
  headers: Record<string, string>
}

export enum ResponseType {
  JSON = "json",
  Text = "text",
  Image = "image",
  Blob = "blob",
  ArrayBuffer = "arraybuffer",
  Document = "document",
}

export type ResponseContent<T = any> = {
  type: T
  value: T extends ResponseType ? ResponseContentTypes[T] : any
}

export type ResponseContentTypes = {
  [ResponseType.JSON]: any
  [ResponseType.Text]: string
  [ResponseType.Image]: string
  [ResponseType.ArrayBuffer]: ArrayBuffer
  [ResponseType.Blob]: Blob
  [ResponseType.Document]: Document
}

export interface IStorage {
  get(): Promise<string | null>
  set(value: string): Promise<void>
  remove(): Promise<void>
}

export interface IBrowserDetector {
  getDeviceInfo(): DeviceInfo
}

export type DeviceInfo = {
  ua: string
  browser: string
  version: string
}

export interface ILicenseAPI {
  verifyLicenseKey(licenseKey: string, deviceUID: string): Promise<boolean>
  deactivateLicenseKey(licenseKey: string, deviceUID: string): Promise<void>
  activateLicenseKey(licenseKey: string, deviceUID: string, deviceInfo: DeviceInfo): Promise<void>
}
