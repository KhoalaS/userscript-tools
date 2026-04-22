export type RegexRoute<Services> = {
  type: 'regex'
  path: RegExp
  handler: (params: { path: string; services: Services; matches: string[] }) => void
  leaveHandler?: () => void
}

export type PrefixRoute<Services> = {
  type: 'prefix'
  path: string
  handler: (params: { path: string; services: Services }) => void
  leaveHandler?: () => void
}

export type ExactRoute<Services> = {
  type: 'exact'
  path: string
  handler: (params: { path: string; services: Services }) => void
  leaveHandler?: () => void
}

export type Route<Services> = ExactRoute<Services> | RegexRoute<Services> | PrefixRoute<Services>

export class SPARouter<Providers = {}> {
  private routes = new Set<Route<Providers>>()
  private lastHandledRoutes: Route<Providers>[] = []
  private services: Record<string, unknown> = {}

  constructor() {
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

  addService<Provider, Key extends string>(key: Key, provider: Provider) {
    this.services[key] = provider

    return this as SPARouter<
      Providers & {
        [K in typeof key]: Provider
      }
    >
  }

  addRoute(route: Route<Providers>) {
    this.routes.add(route)

    return this
  }

  private navigateHandler(path: string) {
    this.lastHandledRoutes = []

    for (const route of this.routes.values()) {
      switch (route.type) {
        case 'prefix':
          if (path.startsWith(route.path)) {
            route.handler({ path, services: this.services as Providers })
            this.lastHandledRoutes.push(route)
          }
          break
        case 'regex':
          const match = route.path.exec(path)
          if (match) {
            route.handler({ path, matches: match, services: this.services as Providers })
            this.lastHandledRoutes.push(route)
          }
          break
        case 'exact':
          if (route.path === path) {
            route.handler({ path, services: this.services as Providers })
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
