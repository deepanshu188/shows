import { signup, login } from "./controllers/auth.controller.ts";
import { getAllShows, addNewShow } from './controllers/shows.controller.ts'

function authMiddleware(req, next) {
  const token = req.headers.get("Authorization");
  if (!req.url) return new Response('URL is invalid')
  return next(req)
}

const requestHandler = async (req) => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    switch (url.pathname) {
      case "/all-shows":
        return getAllShows();
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
      case "/add":
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
