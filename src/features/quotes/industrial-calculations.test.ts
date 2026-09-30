import { describe, expect, it } from "vitest";
import { calculateQuoteItem } from "./industrial-calculations";
const base = { lengthMm:1000,widthMm:500,thicknessMm:2,quantity:2,densityKgM3:7850,materialPricePerKg:11.9,
  holes:[{diameterMm:10,quantity:2}],additionalCutLengthMm:100,cutSpeedMmPerMin:1000,pierceTimeSeconds:6,
  setupMinutes:5,machineHourlyCost:120,setupCost:10,otherCosts:2,markupPercent:25 };
describe("calculateQuoteItem", () => {
 it("calculates weight, cutting, piercing, time, and price", () => {
  const result=calculateQuoteItem(base);
  const weight=((1*.5*.002)-2*Math.PI*.005**2*.002)*7850;
  expect(result.unitWeightKg).toBeCloseTo(weight,8); expect(result.totalWeightKg).toBeCloseTo(weight*2,8);
  expect(result.cutLengthPerPieceMm).toBeCloseTo(3000+20*Math.PI+100,8);
  expect(result.totalPiercings).toBe(6); expect(result.pierceMinutes).toBe(.6);
  expect(result.machineMinutes).toBeCloseTo(5+result.totalCutLengthMm/1000+.6,8);
  expect(result.sellingPrice).toBeCloseTo(result.subtotal*1.25,8);
 });
 it("rejects invalid geometry", () => {
  expect(()=>calculateQuoteItem({...base,lengthMm:0})).toThrow(RangeError);
  expect(()=>calculateQuoteItem({...base,holes:[{diameterMm:1000,quantity:2}]})).toThrow(/Hole volume/);
 });
});
