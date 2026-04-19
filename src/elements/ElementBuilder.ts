export class ElementBuilder<K extends keyof HTMLElementTagNameMap> {
  private readonly _element: HTMLElementTagNameMap[K]

  constructor(tagName: K) {
    this._element = document.createElement(tagName)
  }

  addClasses(...className: string[]) {
    this._element.classList.add(...className)
    return this
  }

  addText(content: string) {
    this._element.appendChild(new Text(content))
    return this
  }

  addStyle(modify: (style: CSSStyleDeclaration) => void) {
    modify(this._element.style)
    return this
  }

  addAttribute(attribute: string, value: string) {
    this._element.setAttribute(attribute, value)
    return this
  }

  addChild<K extends keyof HTMLElementTagNameMap>(childBuilder: ElementBuilder<K>) {
    const child = childBuilder.build()
    this._element.appendChild(child)
    return this
  }

  addRandomId() {
    this._element.id = crypto.randomUUID()
    return this
  }

  build() {
    return this._element
  }
}
