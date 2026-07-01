import { z } from "zod"

export const shareSchema = z.object({
  shareType: z.enum(["ONE_TIME", "TIME_BASED"]),

  accessType: z.enum(["PUBLIC", "PASSWORD"]),

  expiresAt: z.string().optional(),

  password: z.string().optional(),
});