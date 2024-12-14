import { db } from '../db.ts';
import { z } from "zod";
import { getUserEmail } from '../utils/token.ts';

const createTableItItNotExits = () => {
  db().run("CREATE TABLE IF NOT EXISTS SHOWS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, rating INTEGER, status TEXT, email TEXT NOT NULL)");
}

const showSchema = z.object({
  name: z.string(),
  rating: z.number().lt(11),
  status: z.string(),
  email: z.string().email(),
});

const getShows = (data: any) => {
  const showsSchema = z.array(showSchema);
  const shows = showsSchema.safeParse(data);
  if (!shows.success) return new Response(JSON.stringify({ message: shows.error.formErrors.fieldErrors }), { status: 400 });

  return new Response(JSON.stringify(shows.data), {
    headers: { "Content-Type": "application/json" },
  })
}

export const getAllShows = () => {
  const q = db().query("SELECT * FROM SHOWS");
  return getShows(q.all())
}

export const addNewShow = async (req: Request) => {
  createTableItItNotExits()
  const email = getUserEmail(req);

  const r = await req.json();
  const parsedRequest = showSchema.safeParse({ ...r, email });
  const { data, error } = parsedRequest;

  if (!parsedRequest.success)
    return new Response(JSON.stringify({ message: error?.formErrors.fieldErrors }), { status: 400 });

  if (!data) return new Response(JSON.stringify({ message: 'data does not exists' }))


  db().run("INSERT INTO SHOWS (NAME, RATING, STATUS, EMAIL) VALUES (?, ?, ?, ?)", [
    data.name,
    data.rating,
    data.status,
    data.email
  ]);
  return new Response(JSON.stringify({ message: "Show added successfully!" }), { status: 201 })
}

export const getShowsByUserEmail = async (req: Request) => {
  const email = getUserEmail(req);
  const q = db().query("SELECT * FROM SHOWS WHERE email = ?");
  const showAddedByCurrentUser = q.all(email);
  return getShows(showAddedByCurrentUser)
}
