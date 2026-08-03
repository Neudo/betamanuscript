import { z } from "zod";

export const featureRequestSchema = z.object({
  message: z.string()
    .trim()
    .min(10, "Please share a little more detail.")
    .max(2000, "Keep your request under 2,000 characters."),
});

export type FeatureRequestInput = z.infer<typeof featureRequestSchema>;
