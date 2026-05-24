"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateBatchRequestSchema = exports.ValidateEventRequestSchema = exports.SUPPORTED_EVENTS = void 0;
const zod_1 = require("zod");
// ─── Enums / Literals ─────────────────────────────────────────────────────────
exports.SUPPORTED_EVENTS = [
    "S-1000", "S-1020", "S-1070",
    "S-2200", "S-2205", "S-2206",
    "S-2230", "S-2299",
    "S-1200", "S-1210",
];
// ─── API Request/Response Schemas (Zod) ───────────────────────────────────────
exports.ValidateEventRequestSchema = zod_1.z.object({
    eventId: zod_1.z.enum(exports.SUPPORTED_EVENTS),
    payload: zod_1.z.record(zod_1.z.unknown()),
    options: zod_1.z
        .object({
        strictMode: zod_1.z.boolean().default(false),
        skipWarnings: zod_1.z.boolean().default(false),
    })
        .optional(),
});
exports.ValidateBatchRequestSchema = zod_1.z.object({
    events: zod_1.z
        .array(exports.ValidateEventRequestSchema)
        .min(1, "Batch deve conter ao menos 1 evento")
        .max(500, "Batch não pode exceder 500 eventos"),
    options: zod_1.z
        .object({
        strictMode: zod_1.z.boolean().default(false),
        failFast: zod_1.z.boolean().default(false),
    })
        .optional(),
});
