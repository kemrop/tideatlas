export interface Peptide {
  id: string;
  name: string;
  category?: string;
}

export type CoaAvailability = "none" | "limited" | "per-batch";

export interface Vendor {
  id: string;
  name: string;
  website?: string;
  country?: string;
  coaAvailability: CoaAvailability;
  peptideIds: string[];
}

// Certificate of Analysis issued by a lab for one peptide batch.
export interface Coa {
  id: string;
  vendorId: string;
  peptideId: string;
  batch: string;
  lab: string;
  testedAt: string;
  purityPercent: number;
  url: string;
}

export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
