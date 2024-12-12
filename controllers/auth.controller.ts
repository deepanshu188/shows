import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from '../db.ts';

const saltRounds = 10;

const generateToken = (email: string) => {
  const token = jwt.sign({ email }, process.env.SECRET_KEY);

  if (!token) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
  }

  return token;
};

const createTableItItNotExits = () => {
  db().run("CREATE TABLE IF NOT EXISTS USERS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT)");
}

export const signup = async (request: Request) => {
  createTableItItNotExits();
  const newUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const req = await request.json();
  const parsedRequest = newUserSchema.safeParse(req);

  try {
    const { data, error } = parsedRequest;

    if (!parsedRequest.success)
      return new Response(JSON.stringify({ message: error?.formErrors.fieldErrors }), { status: 400 });

    if (!data) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });

    const token = generateToken(data.email);

    const hashedPassword = await bcrypt.hash(req.password, saltRounds);

    db().run("INSERT INTO USERS (NAME, EMAIL, PASSWORD) VALUES (?, ?, ?)", [
      data.name,
      data.email,
      hashedPassword,
    ]);
    return new Response(JSON.stringify({ token }), { status: 201 });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return new Response(JSON.stringify({ message: "Email already exists" }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
  }
};

export const login = async (request: Request) => {
  createTableItItNotExits();
  const existingUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  const req = await request.json();
  const parsedRequest = existingUserSchema.safeParse(req);
  try {
    const { data, error } = parsedRequest;

    if (!parsedRequest.success)
      return new Response(JSON.stringify({ message: error?.formErrors.fieldErrors }), { status: 400 });

    if (!data) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    const token = generateToken(data.email);

    const q = db().query(`SELECT * FROM USERS WHERE email = ?`);
    const user = q.get(data.email);
    if (!user) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    const hashedPassword = user.password;

    const isPasswordValid = await bcrypt.compare(data.password, hashedPassword);

    if (isPasswordValid) {
      return new Response(JSON.stringify({ token }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ message: "Wrong Password!" }), { status: 401 });
    }
  } catch {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
  }
};
