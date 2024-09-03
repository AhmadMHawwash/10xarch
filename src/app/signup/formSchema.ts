import { z } from "zod";

export type SignUpFormState = {
  message: string;
  fields?: SignUpFormValues;
};

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const signUpFormSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8),
});
