import { describe, expect, it } from "vitest";
import { planMachineCapacity } from "./capacity-planner";
const machine={dailyCapacityMinutes:480}, settings={commercialDeliveryBufferBusinessDays:1};
describe("planMachineCapacity", () => {
 it("continues across lunch and adds a business day", () => {
  const plan=planMachineCapacity({machine,requiredMinutes:300,existingSchedule:[],settings,earliestStartAt:"2026-10-05T08:00:00"});
  expect(plan.estimatedStartAt.toISOString()).toBe("2026-10-05T08:00:00.000Z");
  expect(plan.estimatedFinishAt.toISOString()).toBe("2026-10-05T14:00:00.000Z");
  expect(plan.suggestedDeliveryDate).toBe("2026-10-06");
 });
 it("skips weekend dates and existing reservations", () => {
  const plan=planMachineCapacity({machine,requiredMinutes:240,settings,earliestStartAt:"2026-10-09T15:00:00",
   existingSchedule:[{startsAt:"2026-10-12T08:00:00",endsAt:"2026-10-12T10:00:00"}]});
  expect(plan.estimatedStartAt.toISOString()).toBe("2026-10-09T15:00:00.000Z");
  expect(plan.estimatedFinishAt.toISOString()).toBe("2026-10-12T12:00:00.000Z");
 });
 it("respects daily capacity and validates required minutes", () => {
  const plan=planMachineCapacity({machine:{dailyCapacityMinutes:240},requiredMinutes:300,existingSchedule:[],settings,earliestStartAt:"2026-10-05T08:00:00"});
  expect(plan.estimatedFinishAt.toISOString()).toBe("2026-10-06T09:00:00.000Z");
  expect(()=>planMachineCapacity({machine,requiredMinutes:0,existingSchedule:[],earliestStartAt:"2026-10-05T08:00:00"})).toThrow(RangeError);
 });
});
