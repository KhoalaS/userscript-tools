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
    .addText("Save")
    .addStyle((style) => (style.borderRadius = "0.25rem"))
    .addChild(new ElementBuilder("i").addClasses("fas", "fa-bookmark"))
    .build();
// => returns HTMLButtonElement
```

### Router

A router which can be used to react to URL changes. Supports matching with prefixes or regexes.

```ts
const router = new SPARouter([
    {
        regex: true,
        path: /\/id\/(\d+)/g,
        handler: async (path, _, id) => {
            ...
        },
    },
    {
        prefix: true,
        path: "/foo",
        handler: () => {
            ...
        },
    },
]);

// immediatly invoke the handlers for the current URL
router.invokeHandlerOnCurrentUrl()
```

### DOM Manipulation

```ts
// waiting for an element to be in DOM, throws if not found
const element = await waitForSelector(".target");

appendToExisting("#app", new ElementBuilder("div").build());

replaceExisting("#app", new ElementBuilder("div").addText("My App").build());
```

### DOM State

Some websites use DOM attributes as state.

```ts
const state = new DOMAttributeState(buttonElement)
  .addDOMState('saved', true)
  .addDOMState('lang', 'en')

// setter and getter are fully typed
state.setState('lang', 'us')
const isSaved = state.getState('saved')
```
