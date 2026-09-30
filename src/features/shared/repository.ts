export function ensureData<T>(table: string, result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error("Supabase " + table + ": " + result.error.message);
  if (result.data === null) throw new Error("Supabase " + table + " returned no data.");
  return result.data;
}
