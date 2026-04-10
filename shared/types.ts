import { z } from "zod";

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export const SUPPORTED_EVENTS = [
  "S-1000", "S-1020", "S-1070",
  "S-2200", "S-2205", "S-2206",
  "S-2230", "S-2299",
  "S-1200", "S-1210",
] as const;

export type EsocialEventId = (typeof SUPPORTED_EVENTS)[number];

export type Severity = "error" | "warning" | "info";

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
  severity: Severity;
}

export interface ValidationResult {
  eventId: EsocialEventId;
  status: "PASS" | "FAIL" | "WARN";
  score: number;          // 0–100
  issues: ValidationIssue[];
  passedRules: number;
  totalRules: number;
  durationMs: number;
}

export interface BatchValidationResult {
  batchId: string;
  totalEvents: number;
  passed: number;
  failed: number;
  warned: number;
  overallScore: number;
  results: ValidationResult[];
  durationMs: number;
}

// ─── Rule System ──────────────────────────────────────────────────────────────

export type RuleFn<T extends Record<string, unknown>> = (
  payload: T
) => ValidationIssue | null;

export interface Rule<T extends Record<string, unknown> = Record<string, unknown>> {
  code: string;
  field: string;
  description: string;
  severity: Severity;
  validate: RuleFn<T>;
}

// ─── API Request/Response Schemas (Zod) ───────────────────────────────────────

export const ValidateEventRequestSchema = z.object({
  eventId: z.enum(SUPPORTED_EVENTS),
  payload: z.record(z.unknown()),
  options: z
    .object({
      strictMode: z.boolean().default(false),
      skipWarnings: z.boolean().default(false),
    })
    .optional(),
});

export type ValidateEventRequest = z.infer<typeof ValidateEventRequestSchema>;

export const ValidateBatchRequestSchema = z.object({
  events: z
    .array(ValidateEventRequestSchema)
    .min(1, "Batch deve conter ao menos 1 evento")
    .max(500, "Batch não pode exceder 500 eventos"),
  options: z
    .object({
      strictMode: z.boolean().default(false),
      failFast: z.boolean().default(false),
    })
    .optional(),
});

export type ValidateBatchRequest = z.infer<typeof ValidateBatchRequestSchema>;

// ─── Tenant ───────────────────────────────────────────────────────────────────

export type Plan = "starter" | "pro" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  monthlyQuota: number;
  usedThisMonth: number;
}
