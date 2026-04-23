export type BaseRoute = {
  onEnter?: () => void
  onLeave?: () => void
}

export type PushStateFunction = (url: string | URL, state: unknown) => void

export type RegexRoute<Services> = {
  type: 'regex'
  path: RegExp
  handler: (params: {
    path: string
    services: Services
    matches: string[]
    pushState: PushStateFunction
  }) => void
}

export type PrefixRoute<Services> = {
  type: 'prefix'
  path: string
  handler: (params: { path: string; services: Services; pushState: PushStateFunction }) => void
}

export type ExactRoute<Services> = {
  type: 'exact'
  path: string
  handler: (params: { path: string; services: Services; pushState: PushStateFunction }) => void
}

export type Route<Services> = BaseRoute &
  (ExactRoute<Services> | RegexRoute<Services> | PrefixRoute<Services>)

export class RouteWatcher<Providers = {}> {
  private routes = new Set<Route<Providers>>()
  private lastHandledRoutes: Route<Providers>[] = []
  private services: Record<string, unknown> = {}

  constructor() {
    navigation.addEventListener('navigate', (event) => {
      console.log(event)
      const parsedUrl = URL.parse(event.destination.url)
      if (!parsedUrl) return

      for (const route of this.lastHandledRoutes) {
        route.onLeave?.()
      }

      const path = parsedUrl.pathname
      this.navigateHandler(path)
    })
  }

  private pushState(url: string | URL, state: unknown) {
    if (typeof url === 'string') {
      url += '?fromrouter=true'
    } else {
      url.searchParams.append('fromrouter', 'true')
    }

    return window.history.pushState(state, '', url)
  }

  addService<Provider, Key extends string>(key: Key, provider: Provider) {
    this.services[key] = provider

    return this as RouteWatcher<
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
            route.onEnter?.()
            route.handler({ path, services: this.services as Providers, pushState: this.pushState })
            this.lastHandledRoutes.push(route)
          }
          break
        case 'regex':
          const match = route.path.exec(path)
          if (match) {
            route.onEnter?.()
            route.handler({
              path,
              matches: match,
              services: this.services as Providers,
              pushState: this.pushState,
            })
            this.lastHandledRoutes.push(route)
          }
          break
        case 'exact':
          if (route.path === path) {
            route.onEnter?.()
            route.handler({ path, services: this.services as Providers, pushState: this.pushState })
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
