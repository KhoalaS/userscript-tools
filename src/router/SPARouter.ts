export type RegexRoute = {
  type: 'regex'
  path: RegExp
  handler: (path: string, ...matches: string[]) => void
  leaveHandler?: () => void
}

export type PrefixRoute = {
  type: 'prefix'
  path: string
  handler: (path: string) => void
  leaveHandler?: () => void
}

export type ExactRoute = {
  type: 'exact'
  path: string
  handler: (path: string) => void
  leaveHandler?: () => void
}

export type Route = ExactRoute | RegexRoute | PrefixRoute

export class SPARouter {
  private routes = new Set<Route>()
  private lastHandledRoutes: Route[] = []

  constructor(routes: Route[]) {
    for (const route of routes) {
      this.routes.add(route)
    }

    navigation.addEventListener('navigate', (event) => {
      const parsedUrl = URL.parse(event.destination.url)
      if (!parsedUrl) return

      for (const route of this.lastHandledRoutes) {
        route.leaveHandler?.()
      }

      const path = parsedUrl.pathname
      this.navigateHandler(path)
    })
  }

  private navigateHandler(path: string) {
    this.lastHandledRoutes = []

    for (const route of this.routes.values()) {
      switch (route.type) {
        case 'prefix':
          if (path.startsWith(route.path)) {
            route.handler(path)
            this.lastHandledRoutes.push(route)
          }
          break
        case 'regex':
          const match = route.path.exec(path)
          if (match) {
            route.handler(path, ...match)
            this.lastHandledRoutes.push(route)
          }
          break
        case 'exact':
          if (route.path === path) {
            route.handler(path)
            this.lastHandledRoutes.push(route)
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
