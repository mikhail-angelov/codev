import { Router } from "express";

export const healthRouter = Router();

export function getHealth(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  res.status(200).json({
    ok: true,
    service: "codev-backend",
  });
}

healthRouter.get("/", getHealth);
