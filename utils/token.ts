import jwt from "jsonwebtoken";

const SECRET_KEY: string = process.env.SECRET_KEY || "";

export const getRequestToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(" ").at(-1);
  return token;
};

export const getUserEmail = (req: Request) => {
  const token = getRequestToken(req);
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    return decoded.email;
  }
  catch (error) {
    return null;
  }
};

export const validateToken = (req: Request) => {
  const token = getRequestToken(req);
  if (!token) {
    return false;
  }
  return jwt.verify(token, SECRET_KEY, (err) => {
    if (err) {
      return false;
    }
    return true;
  });
}
