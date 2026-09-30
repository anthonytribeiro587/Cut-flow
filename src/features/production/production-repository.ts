import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
export const productionRepository = {
  async listOrders(organizationId: string) {
    const supabase = await createClient();
    return ensureData("production_orders", await supabase.from("production_orders").select("*, orders(number,status), production_operations(*)").eq("organization_id", organizationId).order("priority", { ascending: false }));
  },
  async listLogs(organizationId: string, operationId: string) {
    const supabase = await createClient();
    return ensureData("production_logs", await supabase.from("production_logs").select("*").eq("organization_id", organizationId).eq("production_operation_id", operationId).order("occurred_at"));
  },
};
