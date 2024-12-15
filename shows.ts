import { signup, login } from "./controllers/auth.controller.ts";
import { getAllShows, addNewShow, getShowsByUserEmail } from './controllers/shows.controller.ts'
import { validateToken } from "./utils/token.ts";

async function corsMiddleware(req: Request, next: Function) {
  const headers: HeadersInit = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle pre-flight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: headers,
    });
  }


  const response = await next(req);

  const modifiedResponse = new Response(response.body, {
    ...response,
    headers: {
      ...response.headers,
      ...headers,
    },
  });

  return modifiedResponse;
}

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
      return new Response(JSON.stringify({ status: 401, message: "Unauthorized" }), { status: 401 });
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
        return new Response(JSON.stringify({ status: 404, message: "Not Found" }), { status: 404 });
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
        return new Response(JSON.stringify({ status: 404, message: "Not Found" }), { status: 404 });
    }
  }

  return new Response(JSON.stringify({ status: 404, message: "Method Not Allowed" }), { status: 404 });
}

Bun.serve({
  async fetch(req) {
    return await corsMiddleware(req, (req: Request) => authMiddleware(req, requestHandler));
  },
});
