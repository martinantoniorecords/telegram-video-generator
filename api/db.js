import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function createUser(username) {
  const { data, error } = await supabase
    .from("ilter")
    .insert({ username })
    .select()
    .single();

  if (error) {
    console.error("createUser error:", error);
    throw error;
  }
  return data;
}

export async function getUser(userId) {
  const { data, error } = await supabase
    .from("ilter")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function addCredits(userId, amount) {
  const { data, error } = await supabase
    .from("ilter")
    .update({ credits: supabase.raw("credits + ?", [amount]) })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
