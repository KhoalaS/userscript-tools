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
