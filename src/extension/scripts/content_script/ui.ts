import { createApp } from "vue"
import LogsView from "@/views/Logs.vue"

export function renderUI() {
  const app = createApp(LogsView)

  app.mount(createRoot())
}

export function createRoot() {
  const root = document.createElement("div")

  root.id = "eyeson_root"
  root.style.position = "fixed"
  root.style.bottom = "0"
  root.style.right = "0"
  root.style.width = "50%"
  root.style.maxWidth = "600px"
  root.style.background = "yellow"

  document.body.appendChild(root)

  return root
}
