import { createApp } from "vue"
import LogsView from "@/views/Logs.vue"
import { getStyleInjector } from "@/services/style_injector"

export function renderUI() {
  const app = createApp(LogsView)
  const root = createRoot()

  getStyleInjector().setRoot(root)
  app.mount(root)
}

export function createRoot() {
  const root = document.createElement("div")
  const shadowRoot = root.attachShadow({ mode: "open" })
  const innerRoot = document.createElement("div")

  root.id = "eyeson_root"
  root.style.position = "fixed"
  root.style.bottom = "0"
  root.style.right = "0"
  root.style.width = "50%"
  root.style.maxWidth = "600px"

  document.body.appendChild(root)
  shadowRoot.appendChild(innerRoot)

  return innerRoot
}
