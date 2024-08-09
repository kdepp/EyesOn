import { createApp, h } from "vue"
import EntriesView from "@/views/Entries.vue"
import ActivateLicenseView from "@/views/ActivateLicense.vue"
import { getStyleInjector } from "@/services/style_injector"
import resetStyles from "./reset_styles.scss"
import { State } from "./state"

export function renderUI(state: State) {
  // IMPORTANT: must wrap LogsView in this new component to keep the fields in state reactive
  // eslint-disable-next-line vue/one-component-per-file
  const app = createApp({
    render: () =>
      h(EntriesView, {
        entries: state.entries,
        enabled: state.enabled,
      }),
  })

  const { shadowRoot, innerRoot } = createRoot("eyeson_root", {
    position: "fixed",
    zIndex: "9999",
    bottom: "0",
    right: "0",
    width: "50%",
    maxWidth: "600px",
  })

  getStyleInjector().setRoot(shadowRoot as any)
  getStyleInjector().injectStyles(resetStyles)

  app.mount(innerRoot)
}

export function renderActivateLicenseUI() {
  // eslint-disable-next-line vue/one-component-per-file
  const app = createApp({
    render: () => h(ActivateLicenseView, {}),
  })
  const { shadowRoot, innerRoot } = createRoot("eyeson_activate_license_root")

  getStyleInjector().setRoot(shadowRoot as any)
  getStyleInjector().injectStyles(resetStyles)

  app.mount(innerRoot)
}

export function createRoot(id, styles = {}) {
  const root = document.createElement("div")
  const shadowRoot = root.attachShadow({ mode: "open" })
  const innerRoot = document.createElement("div")
  const documentBase = document.body ?? document.documentElement

  root.id = id

  Object.keys(styles).forEach((key) => {
    root.style[key] = styles[key]
  })
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
