export function appendToExisting(selector: string, child: Node) {
  const target = document.querySelector(selector)
  target?.appendChild(child)
}

export function replaceExisting(selector: string, newNode: Node) {
  const parent = document.querySelector(selector)?.parentElement
  if (!parent) return

  parent.innerHTML = ''
  parent.appendChild(newNode)
}

export type WaitOptions = {
  interval: number
  timeout: number
}

export async function waitForSelector(
  selector: string,
  options: WaitOptions = {
    interval: 500,
    timeout: 5000,
  },
) {
  return new Promise<Element>((resolve, reject) => {
    let found = false
    const handle = setInterval(() => {
      const target = document.querySelector(selector)
      if (target) {
        found = true
        clearInterval(handle)
        resolve(target)
        return
      }
    }, options.interval)
    setTimeout(() => {
      if (found) return

      clearInterval(handle)
      reject(new Error(`could not find element with selector "${selector}"`))
    }, options.timeout)
  })
}
