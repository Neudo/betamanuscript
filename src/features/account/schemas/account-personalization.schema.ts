import { z } from "zod";

import { userRoles } from "../domain/user-role";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your name.")
  .max(80, "Use 80 characters or fewer.");

export const accountPersonalizationSchema = z.object({
  displayName: displayNameSchema,
  role: z.enum(userRoles),
});

export type AccountPersonalizationInput = z.infer<typeof accountPersonalizationSchema>;
