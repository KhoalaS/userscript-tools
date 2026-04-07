export type StateValue = string | number | boolean;

export class DOMAttributeState {
    private readonly domState: Map<
        string,
        {
            rawValue: StateValue;
        }
    > = new Map();

    constructor(private readonly _element: HTMLElement) {}

    addDOMState<T extends StateValue>(
        name: string,
        initial: T,
        onChange?: (newValue: T) => void,
    ) {
        const proxy = new Proxy(
            {
                rawValue: initial,
            },
            {
                set: (target, prop, newValue) => {
                    this._element.setAttribute(name, String(newValue));
                    onChange?.(newValue);
                    return true;
                },
                get: () => {
                    const attributeValue = this._element.getAttribute(name);
                    if (typeof initial === "string") {
                        return attributeValue;
                    } else if (typeof initial === "number") {
                        return Number(attributeValue);
                    } else if (typeof initial === "boolean") {
                        return attributeValue === "true";
                    }
                },
            },
        );
        this.domState.set(name, proxy);
        this._element.setAttribute(name, String(initial));
    }

    setState<T extends StateValue>(name: string, value: T) {
        const state = this.domState.get(name);
        if (state == null) {
            return;
        }

        state.rawValue = value;
    }

    getState(name: string) {
        return this.domState.get(name)?.rawValue;
    }
}

export function useDomAttributeState<T extends StateValue>(
    element: HTMLElement,
    name: string,
    initial: T,
    onChange?: (newValue: T) => void,
) {
    const domState = new DOMAttributeState(element);
    domState.addDOMState(name, initial, onChange);

    return {
        setState: (newValue: T) => {
            domState.setState(name, newValue);
        },
        getState: () => {
            return domState.getState(name) as T | undefined;
        },
    };
}
