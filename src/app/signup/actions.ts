"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signUpFormSchema, type SignUpFormState } from "./formSchema";

export async function signup(
  prevState: SignUpFormState,
  payload: FormData,
): Promise<SignUpFormState> {
  const formData = Object.fromEntries(payload);
  const parsedData = signUpFormSchema.safeParse(formData);

  if (!parsedData.success) {
    return {
      message: parsedData.error.message,
    };
  }

  // // const supabase = createClient();

  // // const { error } = await supabase.auth.signUp({
  // //   email: parsedData.data.email,
  // //   password: parsedData.data.password,
  // //   options: {
  // //     data: {
  // //       firstName: parsedData.data.firstName,
  // //       lastName: parsedData.data.lastName,
  // //     },
  // //   },
  // // });

  // if (error) {
  //   return {
  //     message: error.message,
  //   };
  // }

  revalidatePath("/", "layout");
  redirect("/");
}
