// reference: https://github.com/toss/es-toolkit/blob/b2817323224ca9b5ae5d5286a97acdf8fccac222/src/predicate/isPlainObject.ts#L14
export function isPlainObject(object: object): boolean {
  if (typeof object !== "object") {
    return false
  }

  if (object == null) {
    return false
  }

  if (Object.getPrototypeOf(object) === null) {
    return true
  }

  if (object.toString() !== "[object Object]") {
    return false
  }

  let proto = object

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(object) === proto
}
