import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query; // user id from success redirect
  if (!id) return res.status(400).send("Missing user id");

  try {
    // increment credits by 5
    const { data, error } = await supabase
      .from("users")
      .update({ credits: supabase.raw("credits + 5") })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // redirect to a success page
    res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/success?credits=${data.credits}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update credits");
  }
}
