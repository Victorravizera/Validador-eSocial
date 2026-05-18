import { describe, it, expect } from "vitest";
import { validateBatch, getSupportedEvents } from "../../src/modules/validation/engine/index.js";
import { InvalidEventIdError } from "../../../shared/errors.js";
import type { ValidateBatchRequest } from "../../../shared/types.js";

const validEvt = {
  eventId: "S-2200" as const,
  payload: {
    cpfTrab: "529.982.247-25", nmTrab: "João",
    dtNascto: "1985-03-10", dtAdm: "2023-06-01",
    tpRegTrab: "1", codCateg: "101", vrSalFx: 4000, undSalFixo: "1",
  },
};

const invalidEvt = {
  eventId: "S-2200" as const,
  payload: { cpfTrab: "000.000.000-00", nmTrab: "", dtNascto: "1985-03-10",
    dtAdm: "2023-06-01", tpRegTrab: "1", codCateg: "101", vrSalFx: 100, undSalFixo: "1" },
};

describe("validateBatch", () => {
  it("processa múltiplos eventos e retorna contagens corretas", () => {
    const req: ValidateBatchRequest = { events: [validEvt, invalidEvt, validEvt] };
    const r = validateBatch(req);
    expect(r.totalEvents).toBe(3);
    expect(r.passed).toBe(2);
    expect(r.failed).toBe(1);
    expect(r.batchId).toBeTruthy();
  });

  it("failFast interrompe no primeiro erro", () => {
    const req: ValidateBatchRequest = { events: [invalidEvt, validEvt, validEvt], options: { failFast: true } };
    const r = validateBatch(req);
    expect(r.totalEvents).toBe(1);
    expect(r.failed).toBe(1);
  });

  it("overallScore é 100 quando todos passam", () => {
    const req: ValidateBatchRequest = { events: [validEvt, validEvt] };
    expect(validateBatch(req).overallScore).toBe(100);
  });
});

describe("getSupportedEvents", () => {
  it("inclui os eventos core", () => {
    const evts = getSupportedEvents();
    expect(evts).toContain("S-2200");
    expect(evts).toContain("S-2230");
    expect(evts).toContain("S-1200");
  });
});
