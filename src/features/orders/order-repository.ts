import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export const orderRepository = {
  async list(organizationId: string) {
    const supabase = await createClient();
    return ensureData("orders", await supabase.from("orders").select("*, customers(legal_name,trade_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }));
  },
  async create(organizationId: string, input: { quote_id?: string | null; customer_id?: string | null; number: string; promised_delivery_date?: string | null }) {
    const supabase = await createClient();
    return ensureData("orders", await supabase.from("orders").insert({ ...input, organization_id: organizationId }).select().single());
  },
};
