import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";

export interface OrganizationSettings {
  commercial_delivery_buffer_business_days: number;
  workday_start: string;
  lunch_start: string;
  lunch_end: string;
  workday_end: string;
}
export const settingsRepository = {
  async get(organizationId: string) {
    const supabase = await createClient();
    return ensureData("settings", await supabase.from("settings").select("*").eq("organization_id", organizationId).single());
  },
  async update(organizationId: string, input: Partial<OrganizationSettings>) {
    const supabase = await createClient();
    return ensureData("settings", await supabase.from("settings").update(input).eq("organization_id", organizationId).select().single());
  },
};
