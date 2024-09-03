import { SignIn } from "@/components/Auth/SignIn";
import { createClient } from "@/lib/supabase/client";

export default async function LoginPage() {
  const client = createClient();
  const { data } = await client.auth.getUser();
  console.log(data);
  return <SignIn />;
}
