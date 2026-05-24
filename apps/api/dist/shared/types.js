import { z } from "zod";
// ─── Enums / Literals ─────────────────────────────────────────────────────────
export const SUPPORTED_EVENTS = [
    "S-1000", "S-1020", "S-1070",
    "S-2200", "S-2205", "S-2206",
    "S-2230", "S-2299",
    "S-1200", "S-1210",
];
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
