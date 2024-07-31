export enum Action {
  Toggle = "toggle",
  Tunnel = "tunnel",
  CheckSiteOption = "check_page_enabled",
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
