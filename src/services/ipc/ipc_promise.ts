interface TransError {
  isError: boolean
  name: string
  message: string
  stack?: string
}

export interface Ipc {
  ask: Function
  onAsk: Function
  destroy: Function
}

export interface IpcOutOnly {
  ask: Function
  destroy?: Function
}

export type IpcFactory = () => Ipc

interface IpcPromiseOptions {
  ask: Function
  answer: Function
  onAsk: Function
  onAnswer: Function
  destroy?: Function
  timeout?: number
}

var TO_BE_REMOVED = false

var encodeError = function (err): TransError {
  if (err instanceof Error) {
    return {
      isError: true,
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  }

  return {
    isError: false,
    name: "Error",
    message: "" + err,
  }
}

var decodeError = function (errLikeObj: TransError): Error {
  return new Error(errLikeObj.message)
}

// Note: The whole idea of ipc promise is about transforming the callback style
// ipc communication API to a Promise style
//
// eg. Orignial:    `chrome.runtime.sendMessage({}, () => {})`
//     ipcPromise:  `ipc.ask({}).then(() => {})`
//
// The benifit is
// 1. You can chain this promise with others
// 2. Create kind of connected channels between two ipc ends
//
// This is a generic interface to define a ipc promise utility
// All you need to declare is 4 functions
//
// e.g.
// ```
// ipcPromise({
//   ask: function (uid, cmd, args) { ... },
//   answer: function (uid, err, data) { ... },
//   onAsk: function (fn) { ... },
//   onAnswer: function (fn) { ... },
// })
// ```
export function ipcPromise(options: IpcPromiseOptions): Ipc {
  var ask = options.ask
  var answer = options.answer
  var timeout = options.timeout
  var onAnswer = options.onAnswer
  var onAsk = options.onAsk
  var userDestroy = options.destroy

  var askCache = {}
  var unhandledAsk = []
  var markUnhandled = function (uid, cmd, args) {
    unhandledAsk.push({ uid: uid, cmd: cmd, args: args })
  }
  var handler: Function | Function[] = markUnhandled

  var runHandlers = (handlers, cmd, args, resolve, reject) => {
    for (let i = 0, len = handlers.length; i < len; i++) {
      var res

      try {
        res = handlers[i](cmd, args)
      } catch (e) {
        return reject(e)
      }

      if (res !== undefined) {
        return resolve(res)
      }
    }
    // Note: DO NOT resolve anything if all handlers return undefined
  }

  // both for ask and unhandledAsk
  timeout = timeout || 5000

  onAnswer(function (uid, err, data) {
    if (uid && askCache[uid] === TO_BE_REMOVED) {
      delete askCache[uid]
      return
    }

    if (!uid || !askCache[uid]) {
      // log('ipcPromise: response uid invalid: ' + uid);
      return
    }

    var resolve = askCache[uid][0]
    var reject = askCache[uid][1]

    delete askCache[uid]

    if (err) {
      reject(decodeError(err))
    } else {
      resolve(data)
    }
  })

  onAsk(function (uid, cmd, args) {
    setTimeout(function () {
      var found =
        unhandledAsk &&
        unhandledAsk.find(function (item) {
          return item.uid === uid
        })

      if (!found) return

      answer(
        uid,
        new Error(
          "ipcPromise: answer timeout " + timeout + ' for cmd "' + cmd + '", args "' + args + '"'
        )
      )
    }, timeout)

    if (handler === markUnhandled) {
      markUnhandled(uid, cmd, args)
      return
    }

    return new Promise((resolve, reject) => {
      runHandlers(handler, cmd, args, resolve, reject)
    }).then(
      function (data) {
        // note: handler doens't handle the cmd => return undefined, should wait for timeout
        if (data === undefined) return markUnhandled(uid, cmd, args)
        answer(uid, null, data)
      },
      function (err) {
        answer(uid, encodeError(err), null)
      }
    )
  })

  var wrapAsk = function (cmd, args, timeoutToOverride) {
    var uid = "ipcp_" + new Date().getTime() + "_" + Math.round(Math.random() * 1000)
    var finalTimeout = timeoutToOverride || timeout

    if (finalTimeout >= 0 && finalTimeout !== Infinity) {
      setTimeout(function () {
        var reject

        if (askCache && askCache[uid]) {
          reject = askCache[uid][1]
          askCache[uid] = TO_BE_REMOVED
          reject(
            new Error(
              "ipcPromise: onAsk timeout " +
                finalTimeout +
                ' for cmd "' +
                cmd +
                '", args "' +
                JSON.stringify(args) +
                '"'
            )
          )
        }
      }, finalTimeout)
    }

    ask(uid, cmd, args || [])

    return new Promise(function (resolve, reject) {
      askCache[uid] = [resolve, reject]
    })
  }

  var wrapOnAsk = function (fn) {
    if (Array.isArray(handler)) {
      handler.push(fn)
    } else {
      handler = [fn]
    }

    var ps = unhandledAsk.map(function (task) {
      return new Promise((resolve, reject) => {
        runHandlers(handler, task.cmd, task.args, resolve, reject)
      }).then(
        function (data) {
          // note: handler doens't handle the cmd => return undefined, should wait for timeout
          if (data === undefined) return
          answer(task.uid, null, data)
          return task.uid
        },
        function (err) {
          answer(task.uid, err, null)
          return task.uid
        }
      )
    })

    Promise.all(ps).then(function (uids) {
      for (var uid of uids) {
        if (uid === undefined) continue

        var index = unhandledAsk.findIndex(function (item) {
          return item.uid === uid
        })

        unhandledAsk.splice(index, 1)
      }
    })

    return () => {
      handler = (<Function[]>handler).filter((h) => h !== fn)
    }
  }

  var destroy = function () {
    userDestroy && userDestroy()

    ask = null
    answer = null
    onAnswer = null
    onAsk = null
    unhandledAsk = null

    Object.keys(askCache).forEach(function (uid) {
      var tuple = askCache[uid]
      var reject = tuple[1]
      reject && reject(new Error("IPC Promise has been Destroyed."))
      delete askCache[uid]
    })
  }

  return {
    ask: wrapAsk,
    onAsk: wrapOnAsk,
    destroy: destroy,
  }
}

export const serialize = function (obj: Ipc): Ipc {
  return {
    ask: function (cmd, args, timeout) {
      return obj.ask(cmd, JSON.stringify(args), timeout)
    },

    onAsk: function (fn) {
      return obj.onAsk(function (cmd, args) {
        return fn(cmd, JSON.parse(args))
      })
    },

    destroy: obj.destroy,
  }
}
