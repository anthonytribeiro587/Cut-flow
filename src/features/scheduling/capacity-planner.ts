export interface MachineCapacity { dailyCapacityMinutes: number }
export interface ScheduleInterval { startsAt: Date | string; endsAt: Date | string }
export interface WorkSettings {
  workdayStart?: string; lunchStart?: string; lunchEnd?: string; workdayEnd?: string;
  commercialDeliveryBufferBusinessDays?: number;
}
export interface CapacityPlanInput {
  machine: MachineCapacity; requiredMinutes: number; existingSchedule: ScheduleInterval[];
  settings?: WorkSettings; earliestStartAt?: Date | string;
}
export interface CapacityPlan {
  firstAvailableAt: Date; estimatedStartAt: Date; estimatedFinishAt: Date; suggestedDeliveryDate: string;
}
const dateValue = (value: Date | string) => value instanceof Date ? new Date(value) : new Date(value);
function timeMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) throw new RangeError("Invalid time: " + value);
  return Number(match[1]) * 60 + Number(match[2]);
}
function atMinute(day: Date, minute: number) {
  const value = new Date(day); value.setHours(Math.floor(minute / 60), minute % 60, 0, 0); return value;
}
function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
/** Plans weekday machine capacity around shifts, reservations, and daily capacity. */
export function planMachineCapacity(input: CapacityPlanInput): CapacityPlan {
  if (!Number.isFinite(input.requiredMinutes) || input.requiredMinutes <= 0) throw new RangeError("requiredMinutes must be greater than zero.");
  if (!Number.isFinite(input.machine.dailyCapacityMinutes) || input.machine.dailyCapacityMinutes <= 0) throw new RangeError("dailyCapacityMinutes must be greater than zero.");
  const settings = input.settings ?? {};
  const workStart = timeMinutes(settings.workdayStart ?? "08:00"), lunchStart = timeMinutes(settings.lunchStart ?? "12:00");
  const lunchEnd = timeMinutes(settings.lunchEnd ?? "13:00"), workEnd = timeMinutes(settings.workdayEnd ?? "17:00");
  const bufferDays = settings.commercialDeliveryBufferBusinessDays ?? 1;
  if (workStart >= lunchStart || lunchStart > lunchEnd || lunchEnd >= workEnd) throw new RangeError("Work and lunch times are inconsistent.");
  if (!Number.isInteger(bufferDays) || bufferDays < 0) throw new RangeError("Delivery buffer must be a non-negative integer.");
  const busy = input.existingSchedule.map(({ startsAt, endsAt }) => ({ start: dateValue(startsAt), end: dateValue(endsAt) }))
    .filter(({ start, end }) => Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const earliest = input.earliestStartAt ? dateValue(input.earliestStartAt) : new Date();
  if (!Number.isFinite(earliest.getTime())) throw new RangeError("earliestStartAt must be a valid date.");
  let firstAvailableAt: Date | undefined, estimatedStartAt: Date | undefined, remaining = input.requiredMinutes;
  const day = new Date(earliest); day.setHours(0, 0, 0, 0);
  for (let count = 0; remaining > 1e-8 && count < 36500; count++, day.setDate(day.getDate() + 1)) {
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    const free: Array<[Date, Date]> = [];
    for (const [from, to] of [[workStart, lunchStart], [lunchEnd, workEnd]]) {
      let cursor = atMinute(day, from);
      const end = atMinute(day, to);
      const dayBusy = busy.filter((slot) => slot.end > cursor && slot.start < end);
      for (const slot of dayBusy) {
        const slotStart = slot.start > cursor ? slot.start : cursor;
        if (slotStart > cursor) free.push([cursor, slotStart]);
        if (slot.end > cursor) cursor = slot.end;
        if (cursor >= end) break;
      }
      if (cursor < end) free.push([cursor, end]);
    }
    const effectiveFree = free
      .map(([start, end]) => [start < earliest && day.getTime() === new Date(earliest).setHours(0, 0, 0, 0) ? earliest : start, end] as [Date, Date])
      .filter(([start, end]) => end > start);
    const workdayMinutes = lunchStart - workStart + workEnd - lunchEnd;
    const freeMinutes = effectiveFree.reduce((sum, [start, end]) => sum + (end.getTime() - start.getTime()) / 60000, 0);
    const busyMinutes = Math.max(0, workdayMinutes - freeMinutes);
    let dailyRemaining = Math.min(input.machine.dailyCapacityMinutes - busyMinutes, freeMinutes);
    if (dailyRemaining <= 1e-8) continue;
    for (const [slotStart, slotEnd] of effectiveFree) {
      if (remaining <= 1e-8 || dailyRemaining <= 1e-8) break;
      const start = slotStart;
      if (!firstAvailableAt) firstAvailableAt = new Date(start);
      if (start >= slotEnd) continue;
      const available = Math.min((slotEnd.getTime() - start.getTime()) / 60000, dailyRemaining);
      if (available <= 0) continue;
      if (!estimatedStartAt) estimatedStartAt = new Date(start);
      const used = Math.min(remaining, available);
      remaining -= used; dailyRemaining -= used;
      if (remaining <= 1e-8) {
        const finish = new Date(start.getTime() + used * 60000);
        const delivery = new Date(finish); delivery.setHours(0, 0, 0, 0);
        for (let added = 0; added < bufferDays;) {
          delivery.setDate(delivery.getDate() + 1);
          if (delivery.getDay() !== 0 && delivery.getDay() !== 6) added++;
        }
        return { firstAvailableAt, estimatedStartAt, estimatedFinishAt: finish, suggestedDeliveryDate: dateKey(delivery) };
      }
    }
  }
  throw new RangeError("Could not find enough capacity in the supported planning horizon.");
}
