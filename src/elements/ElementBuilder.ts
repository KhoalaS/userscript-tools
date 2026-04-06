export class ElementBuilder<K extends keyof HTMLElementTagNameMap> {
    private readonly _element: HTMLElementTagNameMap[K];

    constructor(tagName: K) {
        this._element = document.createElement(tagName);
    }

    addClasses(...className: string[]) {
        this._element.classList.add(...className);
        return this;
    }

    addInnerText(content: string) {
        this._element.innerText += content;
        return this;
    }

    addStyle(modify: (style: CSSStyleDeclaration) => void) {
        modify(this._element.style);
        return this;
    }

    build() {
        return this._element;
    }
}
