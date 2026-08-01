import { z } from "zod";

export const profileSettingsSchema = z.object({
  bio: z.string().trim().max(2_000, "Use 2,000 characters or fewer.").transform((value) => value || null),
  displayName: z.string().trim().min(2, "Enter your name.").max(80, "Use 80 characters or fewer."),
  website: z.string().trim().max(2_048, "Use 2,048 characters or fewer.").transform((value) => value || null),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
