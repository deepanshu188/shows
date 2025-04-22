import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const newUserSchema = authSchema.extend({
  name: z.string(),
});

export type UserType = z.infer<typeof authSchema>;
