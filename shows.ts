import { signup, login } from "./controllers/auth.controller.ts";
import { getAllShows, addNewShow, getShowsByUserEmail } from './controllers/shows.controller.ts'
import { validateToken } from "./utils/token.ts";

async function authMiddleware(req: Request, next: Function) {
  const { pathname } = new URL(req.url);
  const ignoreRoutes = ['/signup', '/login']
  const isBlacklistRoute = ignoreRoutes.includes(pathname)

  if (isBlacklistRoute) {
    return next(req);
  }
  else {
    const isTokenValid = validateToken(req);
    if (isTokenValid) {
      return next(req);
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  }
}

const requestHandler = async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    switch (url.pathname) {
      case "/all-shows":
        return getAllShows();
      case "/shows-by-user":
        return getShowsByUserEmail(req)
      default:
        return new Response("404 Not Found", { status: 404 });
    }
  }

  if (req.method === 'POST') {
    switch (url.pathname) {
      case "/signup":
        return await signup(req);
      case "/login":
        return await login(req);
      case "/add-show":
        return await addNewShow(req);
      default:
        return new Response("404 Not Found", { status: 404 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

Bun.serve({
  async fetch(req) {
    return await authMiddleware(req, requestHandler)
  },
});
