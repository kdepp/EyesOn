import { reactive, toRef } from "vue"
import { ConsoleWrapper, Invocation } from "@/services/console_wrapper"
import { renderUI } from "./ui"

init()

function init() {
  const csw = new ConsoleWrapper(self).turnOn()
  const cache = reactive({
    logs: toRef([] as Invocation[]),
  })

  csw.listen((inv) => {
    cache.logs.push(inv)
  })

  setTimeout(() => {
    renderUI(cache.logs)
  }, 500)
}
