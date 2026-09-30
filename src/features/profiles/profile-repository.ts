import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";

export const profileRepository = {
  async getCurrentOrCreate() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error("Supabase auth: " + userError.message);
    if (!user) throw new Error("An authenticated user is required.");
    const existing = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (existing.error) throw new Error("Supabase profiles: " + existing.error.message);
    if (existing.data) return existing.data;
    const result = await supabase.from("profiles").insert({
      id: user.id,
      full_name: typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null,
      avatar_url: typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    }).select().single();
    if (result.error?.code === "23505") {
      return ensureData("profiles", await supabase.from("profiles").select("*").eq("id", user.id).single());
    }
    return ensureData("profiles", result);
  },
};
