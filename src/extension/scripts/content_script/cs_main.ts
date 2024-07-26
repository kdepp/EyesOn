import { ConsoleWrapper } from "@/services/console_wrapper"
import Toastify from "toastify-js"
import { renderUI } from "./ui"

init()

function init() {
  const csw = new ConsoleWrapper(self).turnOn()

  csw.listen((inv) => {
    if (inv.method === "log") {
      Toastify({
        text: inv.method,
        duration: -1,
        close: true,
        gravity: "bottom",
      }).showToast()
    }
    // Toastify({
    //   text: "This is a toast for " + inv.method,
    //   duration: 3000,
    //   destination: "https://github.com/apvarun/toastify-js",
    //   newWindow: true,
    //   close: true,
    //   gravity: "top", // `top` or `bottom`
    //   position: "left", // `left`, `center` or `right`
    //   stopOnFocus: true, // Prevents dismissing of toast on hover
    //   style: {
    //     background: "linear-gradient(to right, #00b09b, #96c93d)",
    //   },
    // }).showToast()
  })

  setTimeout(() => {
    renderUI()
  }, 1000)
}
