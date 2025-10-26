import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export async function createUser(username) {
  const { data, error } = await supabase
    .from("users")
    .insert({ username, credits: 0 })
    .select()
    .single();

  if (error) {
    console.error("createUser error:", error);
    throw error;
  }
  return data;
}
