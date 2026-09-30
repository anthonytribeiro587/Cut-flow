import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export const machineRepository = {
  async list(organizationId: string) {
    const supabase = await createClient();
    return ensureData("machines", await supabase.from("machines").select("*, machine_processes(process_id)").eq("organization_id", organizationId).eq("active", true).order("name"));
  },
  async findParameters(organizationId: string, machineId: string, processId: string, materialThicknessId: string) {
    const supabase = await createClient();
    const result = await supabase.from("machine_process_parameters").select("*")
      .eq("organization_id", organizationId).eq("machine_id", machineId).eq("process_id", processId)
      .eq("material_thickness_id", materialThicknessId).eq("active", true).maybeSingle();
    if (result.error) throw new Error("Supabase machine_process_parameters: " + result.error.message);
    return result.data;
  },
};
