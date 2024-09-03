"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signInFormSchema, type SignInFormState } from "./formSchema";

export async function signin(
  prevState: SignInFormState,
  payload: FormData,
): Promise<SignInFormState> {
  console.log("signin");
  const formData = Object.fromEntries(payload);
  const parsedData = signInFormSchema.safeParse(formData);

  if (!parsedData.success) {
    return {
      message: parsedData.error.message,
    };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsedData.data.email,
    password: parsedData.data.password,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
