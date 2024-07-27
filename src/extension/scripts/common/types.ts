export enum Action {
  Toggle = "toggle",
  Tunnel = "tunnel",
}

export type Message = {
  action: Action
  payload: any
}

export function AssertMessage(msg: any): Message | null {
  if (!msg || typeof msg !== "object" || !msg.action) {
    return null
  }

  return msg
}
