import { z } from "zod";
import { userRoles } from "../domain/user-role";

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Add one uppercase letter.")
    .regex(/[0-9]/, "Add one number."),
  role: z.enum(userRoles),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
