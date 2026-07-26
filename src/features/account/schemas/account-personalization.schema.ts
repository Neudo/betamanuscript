import { z } from "zod";

import { userRoles } from "../domain/user-role";

export const accountPersonalizationSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name.").max(80, "Use 80 characters or fewer."),
  role: z.enum(userRoles),
});

export type AccountPersonalizationInput = z.infer<typeof accountPersonalizationSchema>;
