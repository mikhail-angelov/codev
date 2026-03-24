import { Router, type Request, type Response } from "express";
import { problemRepository } from "../problems/problem-repository.js";

export const problemsRouter = Router();

export function getProblems(_req: Request, res: Response) {
  res.status(200).json(problemRepository.list());
}

export function getProblemById(req: Request, res: Response) {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "Problem not found" });
  }

  const problem = problemRepository.getById(id);

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  return res.status(200).json(problem);
}

problemsRouter.get("/", getProblems);
problemsRouter.get("/:id", getProblemById);
