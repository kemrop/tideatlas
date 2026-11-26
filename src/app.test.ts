import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { vendors } from "./data/seed.js";

const app = createApp();

describe("GET /vendors", () => {
  it("returns a paginated list", async () => {
    const res = await request(app).get("/vendors?limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(vendors.length);
  });

  it("filters by peptide", async () => {
    const res = await request(app).get("/vendors?peptide=kpv&limit=100");
    const expected = vendors.filter((v) => v.peptideIds.includes("kpv"));
    expect(res.body.total).toBe(expected.length);
    expect(res.body.data.map((v: { id: string }) => v.id)).toContain(
      "aavant-research",
    );
  });

  it("filters by COA availability", async () => {
    const withCoa = await request(app).get("/vendors?hasCoa=true&limit=100");
    expect(withCoa.body.total).toBe(
      vendors.filter((v) => v.coaAvailability !== "none").length,
    );
    expect(withCoa.body.data.map((v: { id: string }) => v.id)).toContain(
      "aavant-research",
    );
    const without = await request(app).get("/vendors?hasCoa=false");
    expect(without.body.total).toBe(vendors.length - withCoa.body.total);
  });

  it("rejects invalid query params", async () => {
    const res = await request(app).get("/vendors?limit=1000&hasCoa=maybe");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_request");
  });
});

describe("GET /vendors/:id", () => {
  it("returns a vendor", async () => {
    const res = await request(app).get("/vendors/aavant-research");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Aavant Research");
  });

  it("returns 404 for unknown vendor", async () => {
    const res = await request(app).get("/vendors/nope");
    expect(res.status).toBe(404);
  });
});

describe("GET /vendors/:id/coas", () => {
  it("lists COAs for a known vendor", async () => {
    const res = await request(app).get(
      "/vendors/aavant-research/coas?peptide=kpv",
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns 404 for unknown vendor", async () => {
    const res = await request(app).get("/vendors/nope/coas");
    expect(res.status).toBe(404);
  });
});

describe("misc", () => {
  it("lists peptides", async () => {
    const res = await request(app).get("/peptides");
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });
});

describe("API docs", () => {
  it("serves the OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toContain("/vendors/{id}/coas");
  });

  it("serves Swagger UI", async () => {
    const res = await request(app).get("/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger-ui");
  });
});
