import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import { openApiDocument } from "./openapi.js";
import {
  getVendor,
  listCoas,
  listPeptides,
  listVendors,
  vendorQuerySchema,
} from "./repository.js";

const idParam = z.string().trim().min(1).max(50);
const coaQuerySchema = z.object({ peptide: idParam.optional() });

function sendValidationError(res: express.Response, error: z.ZodError) {
  res.status(400).json({
    error: "invalid_request",
    details: error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  });
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get("/peptides", (_req, res) => {
    // List all peptides
    res.json({ data: listPeptides() });
  });

  app.get("/vendors", (req, res) => {
    const parsed = vendorQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    res.json(listVendors(parsed.data));
  });

  app.get("/vendors/:id", (req, res) => {
    const id = idParam.safeParse(req.params.id);
    if (!id.success) return sendValidationError(res, id.error);
    const vendor = getVendor(id.data);
    if (!vendor) return void res.status(404).json({ error: "not_found" });
    res.json({ data: vendor });
  });

  app.get("/vendors/:id/coas", (req, res) => {
    const id = idParam.safeParse(req.params.id);
    if (!id.success) return sendValidationError(res, id.error);
    const query = coaQuerySchema.safeParse(req.query);
    if (!query.success) return sendValidationError(res, query.error);
    if (!getVendor(id.data)) {
      return void res.status(404).json({ error: "not_found" });
    }
    res.json({ data: listCoas(id.data, query.data.peptide) });
  });

  const notFound: RequestHandler = (_req, res) => {
    res.status(404).json({ error: "not_found" });
  };
  app.use(notFound);

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  };
  app.use(onError);

  return app;
}
