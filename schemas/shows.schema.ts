import { z } from "zod";

export const showSchema = z.object({
  name: z.string(),
  rating: z.number().lt(11),
  status: z.string(),
  email: z.string().email(),
});

export const showsSchema = z.array(showSchema);
