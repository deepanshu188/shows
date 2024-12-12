import { db } from '../db.ts';
import { z } from "zod";

const createTableItItNotExits = () => {
  db().run("CREATE TABLE IF NOT EXISTS SHOWS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, rating INTEGER, status TEXT)");
}

const showSchema = z.object({
  name: z.string(),
  rating: z.number().lt(11),
  status: z.string(),
});

export const getAllShows = () => {
  createTableItItNotExits()
  const shows = db().query("SELECT * FROM SHOWS");

  return new Response(JSON.stringify(shows.all()), {
    headers: { "Content-Type": "application/json" },
  })
}

export const addNewShow = async (req: Request) => {
  createTableItItNotExits()
  const r = await req.json();
  const parsedRequest = showSchema.safeParse(r);
  const { data, error } = parsedRequest;

  if (!parsedRequest.success)
    return new Response(JSON.stringify({ message: error?.formErrors.fieldErrors }), { status: 400 });

  if (!data) return new Response(JSON.stringify({ message: 'data does not exists' }))


  db().run("INSERT INTO SHOWS (NAME, RATING, STATUS) VALUES (?, ?, ?)", [
    data.name,
    data.rating,
    data.status,
  ]);
  return new Response(JSON.stringify({ message: "Show added successfully!" }), { status: 201 })
}
