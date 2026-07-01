import { z } from "zod";

export const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Maximum 100 characters"),

  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Maximum 5000 characters"),
});