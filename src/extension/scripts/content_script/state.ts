import type { Invocation } from "@/services/types"
import { reactive } from "vue"

export function initState() {
  return reactive({
    entries: [] as Invocation[],
    enabled: true,
  })
}

export type State = ReturnType<typeof initState>
