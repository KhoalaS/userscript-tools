import { describe, expect, it, vi } from 'vitest'
import { DOMAttributeState } from './DOMAttributeState'

describe('DOMAttributeState', () => {
  it('should update DOM attriutes on initialization', () => {
    const testee = document.createElement('div')

    new DOMAttributeState(testee).addDOMState('flag', true)

    expect(testee.getAttribute('flag')).toBe('true')
  })

  it('should update DOM attributes on state change', () => {
    const testee = document.createElement('div')

    const domState = new DOMAttributeState(testee).addDOMState('flag', true)

    domState.setState('flag', false)
    expect(testee.getAttribute('flag')).toBe('false')
  })

  it('should execute the onChange callback when the value is changed through the setter', () => {
    const testee = document.createElement('div')

    const onChange = vi.fn()

    const domState = new DOMAttributeState(testee).addDOMState('flag', true, onChange)

    domState.setState('flag', false)
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false)
  })

  it('should retrieve the correct state', () => {
    const testee = document.createElement('div')

    const domState = new DOMAttributeState(testee).addDOMState('flag', true)

    expect(domState.getState('flag')).toBe(true)
    domState.setState('flag', false)
    expect(domState.getState('flag')).toBe(false)
  })
})
