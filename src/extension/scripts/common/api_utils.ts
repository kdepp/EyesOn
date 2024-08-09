import { IPromiseApiSet } from "./types"
import { onMessage, postMsg } from "@/services/ipc/ipc_postmessage"

type Message = {
  action: string
  payload: any
  target?: any
}

type SendMessageFunc<T = any> = (msg: Message) => Promise<T>

type MessageHandler<T = any, C = any> = (msg: Message, ctx: C) => Promise<T>

type OnMessageFunc<T = any, C = any> = (handler: MessageHandler<T, C>) => void

enum MessageTarget {
  Background,
  Main,
  Isolated,
}

export function exposeBackgroundAPIs(apis: IPromiseApiSet): void {
  exposeAPIs(apis, chromeRuntimeOnMessage)
}

export function exposeContentScriptIsolatedAPIs(apis: IPromiseApiSet): void {
  exposeAPIs(apis, chromeRuntimeOnMessage)
}

export function exposeContentScriptMainAPIs(apis: IPromiseApiSet, win: Window = self): void {
  exposeAPIs(apis, onPostMessage(win))
}

// call it proxiedAPI as the APIs could comme from both background and content script isolated
export function proxiedAPIsForContentScriptMain<T extends IPromiseApiSet>(
  tunnelWindow: Window = self,
  currentWindow: Window = self
): T {
  return proxiedAPIs((msg: Message) => postMsg(tunnelWindow, currentWindow, msg, "*"))
}

export function backgroundAPIsForContentScriptIsolated<T extends IPromiseApiSet>(): T {
  return proxiedAPIs((msg: Message) => chrome.runtime.sendMessage(msg))
}

export function contentScriptAPIsForBackground<T extends IPromiseApiSet>(tabId: number): T {
  return proxiedAPIs((msg: Message) => chrome.tabs.sendMessage(tabId, msg))
}

export function tunnelBackgroundToContentScriptMain(): void {
  setupDirectedTunnel(
    () => true,
    chromeRuntimeOnMessage,
    (msg: Message) => {
      msg.target = MessageTarget.Main
      return postMsg(window, window, msg, "*")
    }
  )
}

export function tunnelContentScriptMainToBackground(): void {
  setupDirectedTunnel(
    (msg: Message) => msg.target !== MessageTarget.Main,
    onPostMessage(window),
    (msg: Message) => {
      return chrome.runtime.sendMessage(msg)
    }
  )
}

export function setupDirectedTunnel(
  includer: (msg: Message) => boolean,
  onMessage: OnMessageFunc,
  sendMessage: SendMessageFunc,
): void {
  onMessage((msg: Message) => {
    if (!includer(msg)) {
      return
    }

    return sendMessage(msg)
  })
}

function exposeAPIs<C = any>(apis: IPromiseApiSet, onMessage: OnMessageFunc<any, C>): void {
  onMessage((msg: Message, ctx: C) => {
    const action = msg?.action

    if (!action || !apis[action]) {
      return
    }

    const args: any[] = Array.isArray(msg.payload) ? msg.payload : [msg.payload]

    return apis[action](...args, ctx)
  })
}

type ChromeRuntimeOnMessageContext = chrome.runtime.MessageSender

function chromeRuntimeOnMessage(handler: MessageHandler<any, ChromeRuntimeOnMessageContext>): void {
  chrome.runtime.onMessage.addListener((msg: Message, sender, sendResponse) => {
    new Promise((resolve, reject) => {
      handler(msg, sender).then(resolve, reject)
    }).then(
      (result) => {
        if (result !== undefined) {
          sendResponse(result)
        }
      },
      (err: Error) => {
        sendResponse({ __error: err })
      }
    )

    return true
  })
}

type PostMessageContext = {
  source: any
}

function onPostMessage(from: Window): OnMessageFunc {
  return (handler: MessageHandler<any, PostMessageContext>): void => {
    onMessage(from, (msg: Message, ctx: PostMessageContext) => {
      return Promise.resolve(handler(msg, ctx))
    })
  }
}

function proxiedAPIs<T extends IPromiseApiSet>(sendMessage: SendMessageFunc): T {
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      return (...args: any[]): Promise<any> => {
        return new Promise((resolve, reject) => {
          try {
            sendMessage({ action: prop.toString(), payload: args }).then((res) => {
              if (res?.__error) {
                reject(new Error(res.__error))
              } else {
                resolve(res)
              }
            }, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
  })
}
