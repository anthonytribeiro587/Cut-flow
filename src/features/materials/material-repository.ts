import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export const materialRepository = {
  async list(organizationId: string) {
    const supabase = await createClient();
    return ensureData("materials", await supabase.from("materials").select("*, material_thicknesses(*)").eq("organization_id", organizationId).eq("active", true).order("name"));
  },
  async listProcesses(organizationId: string) {
    const supabase = await createClient();
    return ensureData("processes", await supabase.from("processes").select("*").eq("organization_id", organizationId).eq("active", true).order("name"));
  },
};
