import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export async function getUser(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("getUser error:", error);
    return null;
  }
  return data;
}

export async function deductCredit(userId, amount) {
  const { data, error } = await supabase
    .from("users")
    .update({ credits: supabase.raw("credits - ?", [amount]) })
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    console.error("deductCredit error:", error);
    return null;
  }
  return data;
}

export async function addCredits(userId, amount) {
  const { data, error } = await supabase
    .from("users")
    .update({ credits: supabase.raw("credits + ?", [amount]) })
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    console.error("addCredits error:", error);
    return null;
  }
  return data;
}
