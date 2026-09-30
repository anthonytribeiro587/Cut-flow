export interface HoleInput { diameterMm: number; quantity: number }
export interface QuoteCalculationInput {
  lengthMm: number; widthMm: number; thicknessMm: number; quantity: number; densityKgM3: number;
  materialPricePerKg: number; holes?: HoleInput[]; additionalCutLengthMm?: number;
  cutSpeedMmPerMin: number; pierceTimeSeconds: number; setupMinutes: number;
  machineHourlyCost: number; setupCost: number; otherCosts?: number; markupPercent: number;
}
export interface QuoteCalculation {
  unitWeightKg: number; totalWeightKg: number; cutLengthPerPieceMm: number; totalCutLengthMm: number;
  piercingsPerPiece: number; totalPiercings: number; cutMinutes: number; pierceMinutes: number;
  machineMinutes: number; materialCost: number; machineCost: number; setupCost: number;
  otherCosts: number; subtotal: number; sellingPrice: number;
}
function positive(name: string, value: number, allowZero = false) {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0))
    throw new RangeError(name + " must be " + (allowZero ? "zero or greater." : "greater than zero."));
}
/** Pure weight, cutting, piercing, time, and cost calculation for a rectangular part. */
export function calculateQuoteItem(input: QuoteCalculationInput): QuoteCalculation {
  positive("lengthMm", input.lengthMm); positive("widthMm", input.widthMm); positive("thicknessMm", input.thicknessMm);
  positive("quantity", input.quantity); positive("densityKgM3", input.densityKgM3); positive("cutSpeedMmPerMin", input.cutSpeedMmPerMin);
  for (const [name, value] of Object.entries({
    materialPricePerKg: input.materialPricePerKg, pierceTimeSeconds: input.pierceTimeSeconds,
    setupMinutes: input.setupMinutes, machineHourlyCost: input.machineHourlyCost, setupCost: input.setupCost,
    otherCosts: input.otherCosts ?? 0, markupPercent: input.markupPercent, additionalCutLengthMm: input.additionalCutLengthMm ?? 0,
  })) positive(name, value, true);
  const holes = input.holes ?? [];
  for (const hole of holes) { positive("hole.diameterMm", hole.diameterMm); positive("hole.quantity", hole.quantity); }
  const lengthM = input.lengthMm / 1000, widthM = input.widthMm / 1000, thicknessM = input.thicknessMm / 1000;
  const grossVolumeM3 = lengthM * widthM * thicknessM;
  const holeVolumeM3 = holes.reduce((sum, hole) => sum + Math.PI * (hole.diameterMm / 2000) ** 2 * thicknessM * hole.quantity, 0);
  if (holeVolumeM3 > grossVolumeM3) throw new RangeError("Hole volume cannot exceed part volume.");
  const unitWeightKg = (grossVolumeM3 - holeVolumeM3) * input.densityKgM3;
  const holeCount = holes.reduce((sum, hole) => sum + hole.quantity, 0);
  const cutLengthPerPieceMm = 2 * (input.lengthMm + input.widthMm)
    + holes.reduce((sum, hole) => sum + Math.PI * hole.diameterMm * hole.quantity, 0)
    + (input.additionalCutLengthMm ?? 0);
  const totalCutLengthMm = cutLengthPerPieceMm * input.quantity;
  const piercingsPerPiece = 1 + holeCount, totalPiercings = piercingsPerPiece * input.quantity;
  const cutMinutes = totalCutLengthMm / input.cutSpeedMmPerMin;
  const pierceMinutes = totalPiercings * input.pierceTimeSeconds / 60;
  const machineMinutes = input.setupMinutes + cutMinutes + pierceMinutes;
  const totalWeightKg = unitWeightKg * input.quantity;
  const materialCost = totalWeightKg * input.materialPricePerKg;
  const machineCost = machineMinutes / 60 * input.machineHourlyCost;
  const otherCosts = input.otherCosts ?? 0;
  const subtotal = materialCost + machineCost + input.setupCost + otherCosts;
  return { unitWeightKg, totalWeightKg, cutLengthPerPieceMm, totalCutLengthMm, piercingsPerPiece, totalPiercings,
    cutMinutes, pierceMinutes, machineMinutes, materialCost, machineCost, setupCost: input.setupCost,
    otherCosts, subtotal, sellingPrice: subtotal * (1 + input.markupPercent / 100) };
}
