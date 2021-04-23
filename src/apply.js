/** returns a list of properties used by the given accessor function */
export function trace(accessorFn) {
  const result = []

  // shoutout to <https://github.com/kjleitz/black-hole-object>
  const proxy = new Proxy({}, {
    get(_, prop, receiver) {
      result.push(prop)

      return receiver
    }
  })

  if (accessorFn) accessorFn(proxy)

  return result
}

function clone(obj) {
  if (obj === null) return obj

  if (Array.isArray(obj)) return [...obj]
  if (typeof obj === 'object') return { ...obj }

  throw new Error(`${typeof obj} is not a supported type`)
}

/** locates a property on source and replaces it with the supplied value */
export function apply(source, locatorFn, value) {
  if (!locatorFn) return value

  const path = trace(locatorFn)

  // full replacement if there's no locator or it returns the source itself
  if (!path.length) return value

  const tail = path.pop()
  const result = clone(source)
  let subResult = result

  // clone each node along the path down to the target
  path.forEach(prop => {
    subResult[prop] = clone(subResult[prop])

    subResult = subResult[prop]
  })

  // return the entire original object if the targeted prop already matches value
  if (subResult[tail] === value) return source

  subResult[tail] = value

  return result
}

/** creates an apply function that can be passed to setState */
export function partialApply(locatorFn, valueFn) {
  return function (source) {
    const scoped = locatorFn ? locatorFn(source) : source
    const value = valueFn(scoped)

    return apply(source, locatorFn, value)
  }
}
