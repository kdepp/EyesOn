import { nanoid } from "nanoid"
import { createListenerRegistry } from "@/common/registry"
import type { Invocation, RequestKeyInfo, ResponseContent, ResponseKeyInfo } from "./types"
import { ResponseType } from "./types"

type XHR = typeof window.XMLHttpRequest
type OpenFunc = typeof window.XMLHttpRequest.prototype.open
type SendFunc = typeof window.XMLHttpRequest.prototype.send
type SetRequestHeaderFunc = typeof window.XMLHttpRequest.prototype.setRequestHeader

type XHRData = {
  id: string
  async: boolean
  request?: RequestKeyInfo
  response?: ResponseKeyInfo
}

export class XMLHttpRequestWrapper {
  private registry = createListenerRegistry<Invocation>()
  private eventName = "invocation"
  private openBackup: OpenFunc | null = null
  private sendBackup: SendFunc | null = null
  private setRequestHeaderBackup: SetRequestHeaderFunc | null = null
  private dict: WeakMap<XMLHttpRequest, XHRData> = new WeakMap()

  constructor(private home: { XMLHttpRequest: XHR }) {
    this.openBackup = home.XMLHttpRequest.prototype.open
    this.sendBackup = home.XMLHttpRequest.prototype.send
    this.setRequestHeaderBackup = home.XMLHttpRequest.prototype.setRequestHeader
  }

  public turnOn() {
    this.home.XMLHttpRequest.prototype.open = this.createStubForOpen(this.openBackup)
    this.home.XMLHttpRequest.prototype.send = this.createStubForSend(this.sendBackup)
    this.home.XMLHttpRequest.prototype.setRequestHeader = this.createStubForSetRequestHeader(
      this.setRequestHeaderBackup
    )

    return this
  }

  public turnOff() {
    this.home.XMLHttpRequest.prototype.open = this.openBackup
    this.home.XMLHttpRequest.prototype.send = this.sendBackup
    this.home.XMLHttpRequest.prototype.setRequestHeader = this.setRequestHeaderBackup

    return this
  }

  public listen(fn: (inv: Invocation) => void) {
    this.registry.add(this.eventName, fn)
  }

  private createStubForOpen(f: OpenFunc): OpenFunc {
    const self = this
    const stub: OpenFunc = function (...args) {
      const that = this as XMLHttpRequest
      const method = args[0]
      const url = "" + args[1]
      const async = args[2] !== false
      const xhrData = self.getXHRData(this)

      xhrData.async = async
      xhrData.request = {
        url,
        method,
        headers: {},
      }

      self.listenToXHR(that, async)

      return f.apply(this, args)
    }

    return stub
  }

  private listenToXHR(xhr: XMLHttpRequest, async: boolean) {
    const handler = () => {
      if (xhr.readyState !== 4) {
        return
      }

      const xhrData = this.getXHRData(xhr)
      const respInfo: ResponseKeyInfo = {
        code: xhr.status,
        headers: this.parseHeadersString(xhr.getAllResponseHeaders()),
        body: this.extractResponseBody(xhr),
      }

      xhrData.response = respInfo

      this.registry.fire(this.eventName, {
        id: xhrData.id,
        method: "xhr",
        args: [{ request: xhrData.request }, { response: xhrData.response }],
      })
    }

    if (async) {
      xhr.addEventListener("readystatechange", handler)
    } else {
      xhr.addEventListener("loadend", handler)
    }
  }

  private parseHeadersString(headers: string): Record<string, string> {
    console.log("parseHeadersString", headers)

    const dict: Record<string, string> = {}
    const lines = headers.trim().split(/[\r\n]+/g)

    for (const line of lines) {
      const parts = line.split(": ")
      const key = parts.shift()
      const value = parts.join(": ")

      if (key) {
        dict[key] = value
      }
    }

    return dict
  }

  private createStubForSend(f: SendFunc): SendFunc {
    const self = this
    const stub: SendFunc = function (...args) {
      const xhrData = self.getXHRData(this)
      // const body = args[0]
      // TODO: set request body
      const inv: Invocation = {
        id: xhrData.id,
        method: "xhr",
        args: [
          {
            request: xhrData.request,
          },
        ],
      }

      self.registry.fire(self.eventName, inv)

      return f.apply(this, args)
    }

    return stub
  }

  private createStubForSetRequestHeader(f: SetRequestHeaderFunc): SetRequestHeaderFunc {
    const self = this
    const stub: SetRequestHeaderFunc = function (...args) {
      const key = "" + args[0]
      const value = "" + args[1]
      const xhrData = self.getXHRData(this)

      if (xhrData.request) {
        if (xhrData.request.headers[key]) {
          // References:
          // https://xhr.spec.whatwg.org/#the-setrequestheader()-method
          // https://fetch.spec.whatwg.org/#concept-header-list-combine
          xhrData.request.headers[key] += `"\u002C\u0020"${value}` // It means a prefix ", "
        } else {
          xhrData.request.headers[key] = value
        }
      }

      return f.apply(this, args)
    }

    return stub
  }

  private getXHRData(xhr: XMLHttpRequest): XHRData {
    let data = this.dict.get(xhr)

    if (!data) {
      data = {
        id: nanoid(),
        async: true,
      }

      this.dict.set(xhr, data)
    }

    return data
  }

  private extractResponseBody(xhr: XMLHttpRequest): ResponseContent {
    switch (xhr.responseType) {
      case "text":
      case "":
        return {
          type: ResponseType.Text,
          value: xhr.responseText,
        }

      case "document":
        return {
          type: ResponseType.Document,
          value: xhr.responseXML,
        }

      case "json":
        return {
          type: ResponseType.JSON,
          value: xhr.response,
        }

      case "blob":
        return {
          type: ResponseType.Blob,
          value: xhr.response,
        }

      case "arraybuffer":
        return {
          type: ResponseType.ArrayBuffer,
          value: xhr.response,
        }

      default:
        throw new Error(`unknown responseType: ${xhr.responseType}`)
    }
  }
}

window.XMLHttpRequest
