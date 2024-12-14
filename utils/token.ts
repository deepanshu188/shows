import jwt from "jsonwebtoken";

export const getRequestToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(" ").at(-1);
  return token;
};

export const getUserEmail = (req: Request) => {
  const token = getRequestToken(req);
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  return decoded.email;
};

export const validateToken = (req: Request) => {
  const token = getRequestToken(req);
  return jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if (err) {
      return false;
    }
    return true;
  });
}
