import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters"),

  email: z.email("Invalid email address"),

  password: z.string().min(6, "Password must contain at least 8 characters"),
});