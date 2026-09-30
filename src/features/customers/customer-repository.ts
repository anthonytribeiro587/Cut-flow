import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export interface CustomerInput {
  type?: "person" | "company"; legal_name: string; trade_name?: string | null; document?: string | null;
  email?: string | null; phone?: string | null; city?: string | null; state?: string | null; notes?: string | null; active?: boolean;
}
export const customerRepository = {
  async list(organizationId: string) {
    const supabase = await createClient();
    return ensureData("customers", await supabase.from("customers").select("*").eq("organization_id", organizationId).order("legal_name"));
  },
  async create(organizationId: string, input: CustomerInput) {
    const supabase = await createClient();
    return ensureData("customers", await supabase.from("customers").insert({ ...input, organization_id: organizationId }).select().single());
  },
  async update(organizationId: string, id: string, input: Partial<CustomerInput>) {
    const supabase = await createClient();
    return ensureData("customers", await supabase.from("customers").update(input).eq("organization_id", organizationId).eq("id", id).select().single());
  },
};
