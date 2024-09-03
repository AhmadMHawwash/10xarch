import { z } from "zod";

export type SignInFormState = {
  message: string;
  fields?: SignInFormValues;
};

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signInFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});
