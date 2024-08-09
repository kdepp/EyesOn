import { initState } from "./state"
import { createAPIs } from "./cs_main_api"
import { exposeContentScriptMainAPIs, proxiedAPIsForContentScriptMain } from "../common/api_utils"
import type { BackgroundAPIs } from "../common/api_types"

init()

function init() {
  const state = initState()
  const backgroundAPIs = proxiedAPIsForContentScriptMain<BackgroundAPIs>()
  const apis = createAPIs(state, backgroundAPIs)

  exposeContentScriptMainAPIs(apis)
}
