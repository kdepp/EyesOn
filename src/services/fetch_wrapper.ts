import { nanoid } from "nanoid"
import { createListenerRegistry } from "@/common/registry"
import type { Invocation, RequestKeyInfo, ResponseContent, ResponseKeyInfo } from "./types"
import { ResponseType } from "./types"

type FetchFunc = typeof window.fetch

export class FetchWrapper {
  private registry = createListenerRegistry<Invocation>()
  private eventName = "invocation"
  private fetchBackup: FetchFunc | null = null

  constructor(private home: { fetch: FetchFunc }) {
    this.fetchBackup = home.fetch
  }

  public turnOn() {
    this.home.fetch = this.createStub(this.fetchBackup)
    return this
  }

  public turnOff() {
    this.home.fetch = this.fetchBackup
    return this
  }

  public listen(fn: (inv: Invocation) => void) {
    this.registry.add(this.eventName, fn)
  }
  private createStub(f: FetchFunc): FetchFunc {
    const stub: FetchFunc = (...args) => {
      const inv: Invocation = {
        id: nanoid(),
        method: "fetch",
        args: [
          {
            request: this.extractRequestKeyInfo(...args),
          },
        ],
      }

      this.registry.fire(this.eventName, inv)

      return this.fetchBackup.apply(this.home, args).then((resp: Response) => {
        const cloned = resp.clone()

        setTimeout(async () => {
          const response = await this.extractResponseKeyInfo(cloned)

          inv.args.push({ response })
          this.registry.fire(this.eventName, inv)
        }, 0)

        return resp
      })
    }

    return stub
  }

  private extractRequestKeyInfo(...args: Parameters<FetchFunc>): RequestKeyInfo {
    const [p1, p2] = args
    const info: RequestKeyInfo = {
      url: "",
      method: "GET",
      headers: {},
    }

    if (typeof p1 === "string") {
      info.url = p1
    } else if (p1 instanceof URL) {
      info.url = p1.href
    } else if (!!p1) {
      info.url = p1.url
    }

    if (!!p1 && typeof (p1 as Request).method === "string") {
      info.method = (p1 as Request).method
    } else if (!!p2 && typeof (p2 as RequestInit).method === "string") {
      info.method = (p2 as RequestInit).method
    }

    if (!!p1 && typeof (p1 as Request).headers === "object") {
      info.headers = (p1 as Request).headers as any
    } else if (!!p2 && typeof (p2 as RequestInit).headers === "object") {
      info.headers = (p2 as RequestInit).headers as any
    }

    return info
  }

  private async extractResponseKeyInfo(resp: Response): Promise<ResponseKeyInfo> {
    const body = await this.extractBody(resp)

    return {
      body,
      code: resp.status,
      headers: this.extractHeaders(resp),
    }
  }

  private extractHeaders(resp: Response): Record<string, string> {
    const obj: Record<string, string> = {}

    resp.headers.forEach((v, k) => {
      obj[k] = v
    })

    return obj
  }

  private async extractBody(resp: Response): Promise<ResponseContent> {
    const ct = (resp.headers.get("Content-Type") ?? "").toLowerCase()

    if (ct === "application/json" || ct === "application/vnd.api+json") {
      const json = await resp.json()

      return {
        type: ResponseType.JSON,
        value: json,
      }
    }

    if (/^text\//.test(ct)) {
      const text = await resp.text()

      return {
        type: ResponseType.Text,
        value: text,
      }
    }

    if (/^image\//.test(ct)) {
      const blob = await resp.blob()

      return {
        type: ResponseType.Image,
        value: URL.createObjectURL(blob),
      }
    }

    const blob = await resp.blob()

    return {
      type: ResponseType.Blob,
      value: blob,
    }
  }
}
