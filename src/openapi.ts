const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
});

const idPath = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", minLength: 1, maxLength: 50 },
  example: "alpha-peptides",
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "PeptideAtlas API",
    version: "1.0.0",
    description:
      "API for listing peptide vendors and their certificates of analysis (COAs).",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/peptides": {
      get: {
        summary: "List peptides",
        responses: {
          "200": {
            description: "All peptides",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Peptide" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/vendors": {
      get: {
        summary: "List vendors",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Case-insensitive vendor name search",
            schema: { type: "string", minLength: 1, maxLength: 100 },
          },
          {
            name: "peptide",
            in: "query",
            description: "Only vendors selling this peptide id",
            schema: { type: "string", minLength: 1, maxLength: 50 },
          },
          {
            name: "country",
            in: "query",
            description: "Two-letter country code",
            schema: { type: "string", minLength: 2, maxLength: 2 },
            example: "US",
          },
          {
            name: "hasCoa",
            in: "query",
            description: "Filter by COA availability (coaAvailability is not \"none\")",
            schema: { type: "string", enum: ["true", "false"] },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "A page of vendors",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VendorPage" },
              },
            },
          },
          "400": errorResponse("Invalid query parameters"),
        },
      },
    },
    "/vendors/{id}": {
      get: {
        summary: "Get a vendor",
        parameters: [idPath],
        responses: {
          "200": {
            description: "The vendor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Vendor" },
                  },
                },
              },
            },
          },
          "400": errorResponse("Invalid id"),
          "404": errorResponse("Vendor not found"),
        },
      },
    },
    "/vendors/{id}/coas": {
      get: {
        summary: "List a vendor's COAs",
        parameters: [
          idPath,
          {
            name: "peptide",
            in: "query",
            description: "Only COAs for this peptide id",
            schema: { type: "string", minLength: 1, maxLength: 50 },
          },
        ],
        responses: {
          "200": {
            description: "The vendor's COAs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Coa" },
                    },
                  },
                },
              },
            },
          },
          "400": errorResponse("Invalid id or query parameters"),
          "404": errorResponse("Vendor not found"),
        },
      },
    },
  },
  components: {
    schemas: {
      Peptide: {
        type: "object",
        properties: {
          id: { type: "string", example: "bpc-157" },
          name: { type: "string", example: "BPC-157" },
          category: { type: "string", example: "Recovery" },
        },
      },
      Vendor: {
        type: "object",
        properties: {
          id: { type: "string", example: "alpha-peptides" },
          name: { type: "string", example: "Alpha Peptides" },
          website: { type: "string" },
          country: { type: "string", example: "US" },
          coaAvailability: {
            type: "string",
            enum: ["none", "limited", "per-batch"],
          },
          peptideIds: { type: "array", items: { type: "string" } },
        },
      },
      VendorPage: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Vendor" },
          },
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
        },
      },
      Coa: {
        type: "object",
        description: "Certificate of Analysis issued by a lab for one batch.",
        properties: {
          id: { type: "string" },
          vendorId: { type: "string" },
          peptideId: { type: "string" },
          batch: { type: "string" },
          lab: { type: "string" },
          testedAt: { type: "string" },
          purityPercent: { type: "number" },
          url: { type: "string", format: "uri" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "invalid_request" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};
