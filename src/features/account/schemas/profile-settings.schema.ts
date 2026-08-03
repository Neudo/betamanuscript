import { z } from "zod";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(2_048, "Use 2,048 characters or fewer.")
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a full http:// or https:// URL.");

export const profileSettingsSchema = z.object({
  bio: z.string().trim().max(2_000, "Use 2,000 characters or fewer.").transform((value) => value || null),
  displayName: z.string().trim().min(2, "Enter your name.").max(80, "Use 80 characters or fewer."),
  website: optionalHttpUrl.transform((value) => value || null),
  socialLinks: z.object({
    instagram: optionalHttpUrl,
    tiktok: optionalHttpUrl,
    x: optionalHttpUrl,
    facebook: optionalHttpUrl,
    linkedin: optionalHttpUrl,
    discord: optionalHttpUrl,
    reddit: optionalHttpUrl,
  }),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
