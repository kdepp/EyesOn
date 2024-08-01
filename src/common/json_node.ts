export type JSONNode = {
  root?: boolean
  key: string | number | Symbol
  value: Json
  keyPath: Array<string | number | Symbol>
}

export type Json = string | number | boolean | null | { [property: string]: Json } | Array<Json>

export function toNode(j: Json): JSONNode {
  return {
    root: true,
    key: "",
    value: j,
    keyPath: [],
  }
}

export function getChildrenOfNode(node: JSONNode): JSONNode[] {
  const isArray = Array.isArray(node.value)
  const isObject = typeof node.value === "object" && !!node.value && !isArray

  if (isArray) {
    return (node.value as Json[]).map((value, index) => ({
      key: index,
      value,
      keyPath: [...node.keyPath, index],
    }))
  }

  if (isObject) {
    const obj = node.value as { [property: string]: Json }

    return Object.keys(obj).map((key) => ({
      key,
      value: obj[key],
      keyPath: [...node.keyPath, key],
    }))
  }

  return []
}

export function getNodeID(node: JSONNode): string {
  return node.keyPath.join("/")
}

export function describeJson(j: Json, level: number = 0): string {
  const maxItems = 5
  const maxStringLength = 40

  if (j === null || ["number", "boolean"].indexOf(typeof j) !== -1) {
    return JSON.stringify(j)
  }

  if (typeof j === "string") {
    if (j.length <= maxStringLength) {
      return JSON.stringify(j)
    } else {
      return JSON.stringify(j.slice(0, maxStringLength) + "...")
    }
  }

  if (Array.isArray(j)) {
    if (level > 0) {
      return `Array(${j.length})`
    }

    const count = j.length > 1 ? `(${j.length}) ` : ""
    const items = j.slice(0, maxItems).map((item) => describeJson(item, level + 1))
    const rest = j.length > maxItems ? ", ..." : ""

    return `${count}[${items.join(", ")}${rest}]`
  }

  // Objects
  if (level > 0) {
    return "{...}"
  }

  const keys = Object.keys(j)
  const items = keys.slice(0, maxItems).map((key) => `${key}: ${describeJson(j[key], level + 1)}`)
  const rest = keys.length > maxItems ? ", ..." : ""

  return `{ ${items.join(", ")}${rest} }`
}
