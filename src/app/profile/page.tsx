import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
