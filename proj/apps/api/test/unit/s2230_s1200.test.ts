import { describe, it, expect } from "vitest";
import { validateEvent } from "../../src/modules/validation/engine/index.js";
import type { ValidateEventRequest } from "../../../shared/types.js";

// ── S-2230 ────────────────────────────────────────────────────────────────────

const validS2230 = (): ValidateEventRequest => ({
  eventId: "S-2230",
  payload: { cpfTrab: "529.982.247-25", dtIniAfast: "2024-02-01", codMotAfast: "03" },
});

describe("S-2230: Afastamento", () => {
  it("passa com payload válido", () => expect(validateEvent(validS2230()).status).toBe("PASS"));

  it("falha com CPF inválido", () => {
    const req = validS2230();
    (req.payload as Record<string, unknown>).cpfTrab = "000.000.000-00";
    expect(validateEvent(req).issues.some((i) => i.code === "S2230_CPF_INVALID")).toBe(true);
  });

  it("falha com código motivo inválido", () => {
    const req = validS2230();
    (req.payload as Record<string, unknown>).codMotAfast = "99";
    expect(validateEvent(req).issues.some((i) => i.code === "S2230_COD_MOT_INVALID")).toBe(true);
  });

  it("falha quando data fim é anterior ao início", () => {
    const req = validS2230();
    (req.payload as Record<string, unknown>).dtFimAfast = "2024-01-15";
    expect(validateEvent(req).issues.some((i) => i.code === "S2230_DT_FIM_ANTERIOR_INICIO")).toBe(true);
  });

  it("passa sem data fim (afastamento em aberto)", () => {
    expect(validateEvent(validS2230()).status).toBe("PASS");
  });
});

// ── S-1200 ────────────────────────────────────────────────────────────────────

const validS1200 = (): ValidateEventRequest => ({
  eventId: "S-1200",
  payload: {
    perApur: "2024-03", cpfTrab: "529.982.247-25",
    tpRegTrab: "1", vrRemun: 3500, vrDescInss: 315, vrDescIrrf: 0,
  },
});

describe("S-1200: Remuneração", () => {
  it("passa com payload válido", () => expect(validateEvent(validS1200()).status).toBe("PASS"));

  it("falha com período ausente", () => {
    const req = validS1200();
    delete (req.payload as Record<string, unknown>).perApur;
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_PERIODO_REQUIRED")).toBe(true);
  });

  it("falha com remuneração negativa", () => {
    const req = validS1200();
    (req.payload as Record<string, unknown>).vrRemun = -100;
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_REMUN_NEGATIVA")).toBe(true);
  });

  it("falha com INSS ausente", () => {
    const req = validS1200();
    delete (req.payload as Record<string, unknown>).vrDescInss;
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_INSS_REQUIRED")).toBe(true);
  });

  it("falha com IRRF ausente", () => {
    const req = validS1200();
    delete (req.payload as Record<string, unknown>).vrDescIrrf;
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_IRRF_REQUIRED")).toBe(true);
  });

  it("aceita IRRF zero (isento)", () => {
    const req = validS1200();
    (req.payload as Record<string, unknown>).vrDescIrrf = 0;
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_IRRF_REQUIRED")).toBe(false);
  });

  it("warning para alíquota INSS fora do range", () => {
    const req = validS1200();
    (req.payload as Record<string, unknown>).vrDescInss = 35; // 1% — muito baixo
    expect(validateEvent(req).issues.some((i) => i.code === "S1200_INSS_ALIQUOTA")).toBe(true);
  });
});
