# Userscript Tools

Zero dependencies (for now) userscript utilities. APIs are not stable.

## Installation

```bash
npm install userscript-tools
```

## Basic usage

### Element builder

Thin wrapper around DOM APIs to make working with HTML elements less messy.

```ts
const button = new ElementBuilder("button")
    .addAttribute("saved", "true")
    .addClasses("important", "primary")
    .addInnerText("Save")
    .addStyle((style) => (style.borderRadius = "0.25rem"))
    .addChild(new ElementBuilder("i").addClasses("fas", "fa-bookmark"))
    .build();
// => returns HTMLButtonElement
```
