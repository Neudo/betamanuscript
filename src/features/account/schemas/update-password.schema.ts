import { z } from "zod";

import { passwordSchema } from "./sign-up.schema";

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
