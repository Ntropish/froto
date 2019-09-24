export const from = curry(
  (range, value) => (value - range[0]) / duration(range),
)

export const to = curry((range, value) => value * duration(range) + range[0])

export const line = curry((a, b, value) => to(b, from(a, value)))

export const pow = curry((power, a, b, value) => to(b, from(a, value) ** power))

export const toFixedString = range => range.map(n => n.toFixed(2))

export const duration = ([start, end]) => end - start
export { duration as width }

export const grow = curry((amount, origin, range) => {
  return add(range, [-amount * origin, amount * (1 - origin)])
})

export const scale = curry((amount, origin, range) => {
  return grow(duration(range) * (1 + amount), origin, range)
})

export const add = curry((a, b) => [a[0] + b[0], a[1] + b[1]])

export const multiply = curry((amount, range) => [
  amount * range[0],
  amount * range[1],
])

export const contains = curry((range, value) => {
  // If clamping didn't change it then it's in the range
  return value === clamp(range, value)
})

export const containsRange = curry((container, range) => {
  return (
    contains(container, range[0]) ||
    contains(container, range[1]) ||
    contains(range, container[0])
  )
})

export const valueIn = curry((value, range) => contains(range, value))

export const clamp = curry((range, value) => {
  // ranges could be inverted so the max
  // and min must be calculated, I think..
  const max = Math.max(...range)
  const min = Math.min(...range)
  return Math.min(max, Math.max(min, value))
})

// this will slide one range into another
// if the range wont fit it will be centered but its length will not change
export const clampRange = curry((bounds, target) => {
  // first get the distances from the edges
  const distances = sub(bounds, target)
  // these clamps erase values that are in bounds and leave ones out of bounds
  const outOfBounds = [
    clamp([0, Infinity], distances[0]),
    clamp([-Infinity, 0], distances[1]),
  ]
  // then, translate the target range the average value of the remaining non-zero values
  const countTruthy = (count, item) => count + (item ? 0 : 1)
  const addendsCount = outOfBounds.reduce(countTruthy, 0)
  const clampedSum = outOfBounds.reduce((a, b) => a + b, 0)
  const translate = clampedSum / (addendsCount || 1)
  return add(target, [translate, translate])
})

export function curry(fn, namer) {
  // chef will execute the function or wait for more args with a new function
  function chef(args = []) {
    if (args.length >= fn.length) {
      return fn(...args)
    } else {
      const argsGetter = function(...newArgs) {
        return chef(args.concat(newArgs))
      }
      Object.defineProperty(argsGetter, 'name', {
        value: namer ? namer(args) : `Give me ${fn.length - args.length} args`,
        writable: false,
      })
      argsGetter.args = args
      argsGetter.fn = fn
      return argsGetter
    }
  }
  return chef()
}
