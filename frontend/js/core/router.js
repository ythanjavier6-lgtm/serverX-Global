 // Router simple para SPA
export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  async navigate(path) {
    const handler = this.routes[path];
    if (handler) {
      try {
        this.currentRoute = path;
        await handler();
        window.history.pushState({ path }, '', path);
      } catch (err) {
        console.error(`Error navegando a ${path}:`, err);
      }
    } else {
      console.warn(`Ruta no registrada: ${path}`);
    }
  }

  setupPopStateListener() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.path) {
        this.navigate(e.state.path);
      }
    });
  }
}

export function createRouter(routes = {}) {
  return new Router(routes);
}
