import { tryAsResult } from '../misc'

export function appendToExisting(selector: string, child: Node) {
  const target = document.querySelector(selector)
  target?.appendChild(child)
}

export function prependToExisting(selector: string, child: Node) {
  const target = document.querySelector(selector)
  target?.prepend(child)
}

export function replaceExisting(selector: string, newNode: Node) {
  const old = document.querySelector(selector)
  const parent = old?.parentNode
  if (!old || !parent) return

  parent.replaceChild(newNode, old)
}

export type WaitOptions = {
  interval: number
  timeout: number
}

export async function elementExists(selector: string) {
  const result = await tryAsResult(() =>
    waitForSelector(selector, {
      interval: 50,
      timeout: 500,
    }),
  )

  return result.ok
}

export async function waitForSelector(
  selector: string,
  options: WaitOptions = {
    interval: 100,
    timeout: 5000,
  },
) {
  return new Promise<Element>((resolve, reject) => {
    let found = false
    const timeoutHandler = setTimeout(() => {
      if (found) return

      clearInterval(handle)
      reject(new Error(`could not find element with selector "${selector}"`))
    }, options.timeout)

    const handle = setInterval(() => {
      const target = document.querySelector(selector)
      if (target) {
        found = true
        clearInterval(handle)
        clearTimeout(timeoutHandler)
        resolve(target)
        return
      }
    }, options.interval)
  })
}
