export type BaseRoute = {
    prefix?: undefined;
    regex?: undefined;
    path: string;
    callback: (path: string) => void;
};

export type RegexRoute = {
    prefix?: undefined;
    regex: true;
    path: RegExp;
    callback: (path: string, ...matches: string[]) => void;
};

export type PrefixRoute = {
    prefix: true;
    regex?: undefined;
    path: string;
    callback: (path: string) => void;
};

export type Route = BaseRoute | RegexRoute | PrefixRoute;

export class SPARouter {
    private routes = new Set<Route>();

    constructor(routes: Route[]) {
        for (const route of routes) {
            this.routes.add(route);
        }

        navigation.addEventListener("navigate", (event) => {
            console.log(event);
            const parsedUrl = URL.parse(event.destination.url);
            if (!parsedUrl) return;

            const path = parsedUrl.pathname;
            for (const route of this.routes.values()) {
                if (route.prefix && path.startsWith(route.path)) {
                    route.callback(path);
                    return;
                } else if (route.regex) {
                    const match = route.path.exec(path);
                    if (match) {
                        route.callback(path, ...match);
                        return;
                    }
                } else if (route.path === path) {
                    route.callback(path);
                    return;
                }
            }
        });
    }
}
