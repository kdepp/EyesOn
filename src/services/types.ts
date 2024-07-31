export type ConsoleAPI = Pick<
  Console,
  "assert" | "clear" | "count" | "countReset" |
  "debug" | "dir" | "dirxml" | "error" |
  "group" | "groupCollapsed" | "groupEnd" | "info" |
  "log" |  "table" | "time" | "timeEnd" | "timeLog" | "timeStamp" |
  "trace" | "warn" // | "profile" | "profileEnd"
>

export type Invocation = {
  id: string
  method: keyof ConsoleAPI | "fetch" | "xhr"
  args: any[]
}

export type RequestPayload =
  | string
  | Blob
  | DataView
  | File
  | FormData
  | URLSearchParams
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
