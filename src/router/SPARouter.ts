export type RegexRoute = {
  type: 'regex'
  path: RegExp
  handler: (path: string, ...matches: string[]) => void
}

export type PrefixRoute = {
  type: 'prefix'
  path: string
  handler: (path: string) => void
}

export type ExactRoute = {
  type: 'exact'
  path: string
  handler: (path: string) => void
}

export type Route = ExactRoute | RegexRoute | PrefixRoute

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
      switch (route.type) {
        case 'prefix':
          if (path.startsWith(route.path)) {
            route.handler(path)
          }
          break
        case 'regex':
          const match = route.path.exec(path)
          if (match) {
            route.handler(path, ...match)
          }
          break
        case 'exact':
          if (route.path === path) {
            route.handler(path)
          }
          break
        default:
          console.warn('Unknown route type', route)
      }
    }
  }

  invokeHandlerOnCurrentUrl() {
    const path = window.location.pathname
    this.navigateHandler(path)
  }
}
