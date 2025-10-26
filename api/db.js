export async function createUser(username) {
    const { data, error } = await supabase
      .from("ilter")
      .insert({ username }) // optionally add email: "demo@example.com"
      .select()
      .single();
  
    if (error) {
      console.error("createUser error:", error);
      throw error;  // this will appear in Vercel logs
    }
    return data;
  }
  