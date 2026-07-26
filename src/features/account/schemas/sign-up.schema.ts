import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Add one uppercase letter.")
    .regex(/[0-9]/, "Add one number."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
