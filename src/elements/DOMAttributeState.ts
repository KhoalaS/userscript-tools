export type StateValue = string | number | boolean;

type Widen<T> = T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T;

type InternalState<T extends StateValue> = {
    rawValue: T;
    _onChange?: (newValue: T) => void;
};

export class DOMAttributeState<C = {}> {
    private readonly domState: Map<keyof C, InternalState<StateValue>> =
        new Map();

    constructor(private readonly _element: HTMLElement) {}

    addDOMState<T extends StateValue, N extends string>(
        name: N,
        initial: T,
        onChange?: (newValue: T) => void,
    ): DOMAttributeState<C & { [K in N]: Widen<T> }> {
        this.domState.set(name as unknown as keyof C, {
            rawValue: initial,
            _onChange: onChange as (newValue: StateValue) => void,
        });
        this._element.setAttribute(name, String(initial));
        return this as DOMAttributeState<C & { [K in N]: Widen<T> }>;
    }

    setState<N extends keyof C>(name: N, value: C[N]) {
        const state = this.domState.get(name);
        if (state == null) {
            return;
        }

        state.rawValue = value as StateValue;
        this._element.setAttribute(name as string, String(value));
        state._onChange?.(state.rawValue);
    }

    getState<N extends keyof C>(name: N): C[N] | undefined {
        return this.domState.get(name)?.rawValue as C[N] | undefined;
    }
}

export function useDomAttributeState<T extends StateValue>(
    element: HTMLElement,
    name: string,
    initial: T,
    onChange?: (newValue: T) => void,
) {
    const domState = new DOMAttributeState(element).addDOMState(
        name,
        initial,
        onChange,
    );

    return {
        setState: (newValue: T) => {
            domState.setState(name, newValue as Widen<T>);
        },
        getState: () => {
            return domState.getState(name);
        },
    };
}
