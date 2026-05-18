import { describe, it, expect } from "vitest";
import { validateEvent } from "../../src/modules/validation/engine/index.js";
import type { ValidateEventRequest } from "../../../shared/types.js";

const valid = (): ValidateEventRequest => ({
  eventId: "S-2200",
  payload: {
    cpfTrab: "529.982.247-25", nmTrab: "Maria da Silva",
    dtNascto: "1990-05-20", dtAdm: "2024-01-15",
    tpRegTrab: "1", codCateg: "101", vrSalFx: 3500, undSalFixo: "1",
  },
});

describe("S-2200: Admissão", () => {
  it("passa com payload válido", () => {
    const r = validateEvent(valid());
    expect(r.status).toBe("PASS");
    expect(r.score).toBe(100);
  });

  it("falha com CPF ausente", () => {
    const req = valid();
    delete (req.payload as Record<string, unknown>).cpfTrab;
    expect(validateEvent(req).issues.some((i) => i.code === "S2200_CPF_REQUIRED")).toBe(true);
  });

  it("falha com CPF inválido", () => {
    const req = valid();
    (req.payload as Record<string, unknown>).cpfTrab = "111.111.111-11";
    expect(validateEvent(req).issues.some((i) => i.code === "S2200_CPF_INVALID")).toBe(true);
  });

  it("falha com trabalhador menor de 14 anos", () => {
    const req = valid();
    const d = new Date();
    d.setFullYear(d.getFullYear() - 10);
    (req.payload as Record<string, unknown>).dtNascto = d.toISOString().slice(0, 10);
    expect(validateEvent(req).issues.some((i) => i.code === "S2200_IDADE_MINIMA")).toBe(true);
  });

  it("falha com data admissão futura", () => {
    const req = valid();
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    (req.payload as Record<string, unknown>).dtAdm = d.toISOString().slice(0, 10);
    expect(validateEvent(req).issues.some((i) => i.code === "S2200_DTADM_FUTURA")).toBe(true);
  });

  it("falha com salário abaixo do mínimo", () => {
    const req = valid();
    (req.payload as Record<string, unknown>).vrSalFx = 500;
    expect(validateEvent(req).issues.some((i) => i.code === "S2200_SALARIO_MINIMO")).toBe(true);
  });

  it("warning para jornada acima de 44h CLT", () => {
    const req = valid();
    (req.payload as Record<string, unknown>).qtdHrsSem = 50;
    const r = validateEvent(req);
    expect(r.issues.some((i) => i.code === "S2200_JORNADA_HORAS")).toBe(true);
    expect(r.status).toBe("WARN");
  });
});
