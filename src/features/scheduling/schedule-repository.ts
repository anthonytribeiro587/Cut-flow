import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";
import { planMachineCapacity, type CapacityPlan, type WorkSettings } from "./capacity-planner";
export const scheduleRepository = {
  async plan(organizationId: string, machineId: string, requiredMinutes: number, earliestStartAt?: Date | string): Promise<CapacityPlan> {
    const supabase = await createClient();
    const [machineResult, scheduleResult, settingsResult] = await Promise.all([
      supabase.from("machines").select("daily_capacity_minutes").eq("organization_id", organizationId).eq("id", machineId).single(),
      supabase.from("machine_schedule_entries").select("starts_at,ends_at").eq("organization_id", organizationId).eq("machine_id", machineId).in("status", ["scheduled", "running"]),
      supabase.from("settings").select("workday_start,lunch_start,lunch_end,workday_end,commercial_delivery_buffer_business_days").eq("organization_id", organizationId).maybeSingle(),
    ]);
    const machine = ensureData("machines", machineResult);
    const entries = ensureData("machine_schedule_entries", scheduleResult);
    if (settingsResult.error) throw new Error("Supabase settings: " + settingsResult.error.message);
    const row = settingsResult.data;
    const settings: WorkSettings | undefined = row ? {
      workdayStart: row.workday_start,
      lunchStart: row.lunch_start,
      lunchEnd: row.lunch_end,
      workdayEnd: row.workday_end,
      commercialDeliveryBufferBusinessDays: row.commercial_delivery_buffer_business_days,
    } : undefined;
    return planMachineCapacity({
      machine: { dailyCapacityMinutes: machine.daily_capacity_minutes },
      requiredMinutes,
      existingSchedule: entries.map((entry) => ({ startsAt: entry.starts_at, endsAt: entry.ends_at })),
      settings,
      earliestStartAt,
    });
  },
};
