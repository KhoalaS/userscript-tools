import { beforeEach, describe, expect, it } from 'vitest'
import { waitForSelector } from './DOMManipulation'

describe('DOMManipulation', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  describe('waitForSelector', () => {
    it('should resolve to an existing element', async () => {
      const child = document.createElement('div')
      child.classList.add('vitest')

      document.body.appendChild(child)

      const testee = await waitForSelector('.vitest')
      expect(testee).toBeTruthy()
    })

    it('should throw trying to select a non existing element', { timeout: 10_000 }, async () => {
      const child = document.createElement('div')
      child.classList.add('vitest')

      document.body.appendChild(child)
      expect(() =>
        waitForSelector('.does-not-exist', {
          interval: 50,
          timeout: 2500,
        }),
      ).rejects.toThrow()
    })
  })
})
