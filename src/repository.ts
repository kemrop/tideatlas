import { z } from "zod";
import { coas, peptides, vendors } from "./data/seed.js";
import type { Coa, Page, Peptide, Vendor } from "./types.js";

export const vendorQuerySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  peptide: z.string().trim().min(1).max(50).optional(),
  country: z.string().trim().length(2).toUpperCase().optional(),
  hasCoa: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type VendorQuery = z.infer<typeof vendorQuerySchema>;

export function listVendors(query: VendorQuery): Page<Vendor> {
  const q = query.q?.toLowerCase();
  const filtered = vendors.filter(
    (v) =>
      (!q || v.name.toLowerCase().includes(q)) &&
      (!query.peptide || v.peptideIds.includes(query.peptide)) &&
      (!query.country || v.country === query.country) &&
      (query.hasCoa === undefined ||
        (v.coaAvailability !== "none") === query.hasCoa),
  );
  const start = (query.page - 1) * query.limit;
  return {
    data: filtered.slice(start, start + query.limit),
    page: query.page,
    limit: query.limit,
    total: filtered.length,
  };
}

export function getVendor(id: string): Vendor | undefined {
  return vendors.find((v) => v.id === id);
}

export function listCoas(vendorId: string, peptideId?: string): Coa[] {
  return coas.filter(
    (c) => c.vendorId === vendorId && (!peptideId || c.peptideId === peptideId),
  );
}

export function listPeptides(): Peptide[] {
  return peptides;
}
