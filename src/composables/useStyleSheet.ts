export function useStyleSheet() {
  const styleSheet = new CSSStyleSheet()
  document.adoptedStyleSheets.push(styleSheet)

  const addRule = (
    selector: string,
    style: Partial<CSSStyleProperties> & Record<string, string>,
  ) => {
    let cssRuleText = '{ '

    for (const [key, value] of Object.entries(style)) {
      const kebapKey = key.replaceAll(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
      cssRuleText += `${kebapKey}: ${value} !important; `
    }

    cssRuleText += '}'

    const cssText = `${selector} ${cssRuleText}`
    styleSheet.insertRule(cssText)
  }

  return {
    addRule,
  }
}
