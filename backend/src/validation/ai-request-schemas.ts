import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const reviewRequestSchema = z
  .object({
    problemId: z.number().int().positive(),
    code: nonEmptyString,
    latestTestSummary: z
      .object({
        passedCount: z.number().int().nonnegative(),
        failedCount: z.number().int().nonnegative(),
        failureMessages: z.array(nonEmptyString).default([]),
      })
      .strict()
      .optional(),
  })
  .strict();

export const hintRequestSchema = z
  .object({
    problemId: z.number().int().positive(),
    code: nonEmptyString,
    mode: z.enum(["approach", "complexity", "edge-cases", "explain-current-code"]),
  })
  .strict();

export const chatRequestSchema = z
  .object({
    problemId: z.number().int().positive(),
    code: nonEmptyString,
    userMessage: nonEmptyString,
    recentMessages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant", "system"]),
            content: nonEmptyString,
          })
          .strict(),
      )
      .max(20)
      .default([]),
  })
  .strict();

export type ReviewRequestBody = z.infer<typeof reviewRequestSchema>;
export type HintRequestBody = z.infer<typeof hintRequestSchema>;
export type ChatRequestBody = z.infer<typeof chatRequestSchema>;
