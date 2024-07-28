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

export type RequestKeyInfo = {
  url: string
  method: string
  headers: Record<string, string>
  // TODO: payload
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
}

export type ResponseContent<T = any> = {
  type: T
  value: T extends ResponseType ? ResponseContentTypes[T] : any
}

export type ResponseContentTypes = {
  [ResponseType.JSON]: any
  [ResponseType.Text]: string
  [ResponseType.Image]: string
  [ResponseType.Blob]: Blob
}
