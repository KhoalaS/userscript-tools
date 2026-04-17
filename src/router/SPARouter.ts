export type BaseRoute = {
  prefix?: undefined
  regex?: undefined
  path: string
  handler: (path: string) => void
}

export type RegexRoute = {
  prefix?: undefined
  regex: true
  path: RegExp
  handler: (path: string, ...matches: string[]) => void
}

export type PrefixRoute = {
  prefix: true
  regex?: undefined
  path: string
  handler: (path: string) => void
}

export type Route = BaseRoute | RegexRoute | PrefixRoute

export class SPARouter {
  private routes = new Set<Route>()

  constructor(routes: Route[]) {
    for (const route of routes) {
      this.routes.add(route)
    }

    navigation.addEventListener('navigate', (event) => {
      const parsedUrl = URL.parse(event.destination.url)
      if (!parsedUrl) return

      const path = parsedUrl.pathname
      this.navigateHandler(path)
    })
  }

  private navigateHandler(path: string) {
    for (const route of this.routes.values()) {
      if (route.prefix && path.startsWith(route.path)) {
        route.handler(path)
        continue
      } else if (route.regex) {
        const match = route.path.exec(path)
        if (match) {
          route.handler(path, ...match)
          continue
        }
      } else if (route.path === path) {
        route.handler(path)
        continue
      }
    }
  }

  invokeHandlerOnCurrentUrl() {
    const path = window.location.pathname
    this.navigateHandler(path)
  }
}
