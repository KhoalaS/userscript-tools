import { DOMAttributeState, StateValue } from '../elements'
import { Widen } from '../misc'

export function useDomAttributeState<T extends StateValue>(
  element: HTMLElement,
  name: string,
  initial: T,
  onChange?: (newValue: T) => void,
) {
  const domState = new DOMAttributeState(element).addDOMState(name, initial, onChange)

  return {
    setState: (newValue: T) => {
      domState.setState(name, newValue as Widen<T>)
    },
    getState: () => {
      return domState.getState(name)
    },
  }
}
