import { createApp } from "vue"
import LogsView from "@/views/Logs.vue"
import { getStyleInjector } from "@/services/style_injector"
import { Invocation } from "@/services/console_wrapper"
import resetStyles from "./reset_styles.scss"

export function renderUI(logs: Invocation[]) {
  const app = createApp(LogsView, { logs })
  const { shadowRoot, innerRoot } = createRoot()

  getStyleInjector().setRoot(shadowRoot as any)
  getStyleInjector().injectStyles(resetStyles)

  app.mount(innerRoot)
}

export function createRoot() {
  const root = document.createElement("div")
  const shadowRoot = root.attachShadow({ mode: "open" })
  const innerRoot = document.createElement("div")
  const documentBase = document.body ?? document.documentElement

  root.id = "eyeson_root"
  root.style.position = "fixed"
  root.style.zIndex = "9999"
  root.style.bottom = "0"
  root.style.right = "0"
  root.style.width = "50%"
  root.style.maxWidth = "600px"

  documentBase.appendChild(root)
  shadowRoot.appendChild(innerRoot)

  return { shadowRoot, innerRoot }
}
