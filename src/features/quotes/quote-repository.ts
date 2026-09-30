import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export const quoteRepository = {
  async list(organizationId: string) {
    const supabase = await createClient();
    return ensureData("quotes", await supabase.from("quotes").select("*, customers(legal_name,trade_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }));
  },
  async create(organizationId: string, input: { customer_id?: string | null; number: string; valid_until?: string | null; markup_percent?: number; other_costs?: number; commercial_notes?: string | null }) {
    const supabase = await createClient();
    return ensureData("quotes", await supabase.from("quotes").insert({ ...input, organization_id: organizationId }).select().single());
  },
  async addItem(organizationId: string, input: Record<string, unknown> & { quote_id: string }) {
    const supabase = await createClient();
    return ensureData("quote_items", await supabase.from("quote_items").insert({ ...input, organization_id: organizationId }).select().single());
  },
};
