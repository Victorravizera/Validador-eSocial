import { describe, it, expect } from "vitest";
import {
  isValidCPF, isValidCNPJ, parseDate, parsePeriod,
  getAgeInYears, isFutureDate, getSalarioMinimo,
} from "../../../shared/utils/validators.js";

describe("isValidCPF", () => {
  it("aceita CPF válido com máscara", () => expect(isValidCPF("529.982.247-25")).toBe(true));
  it("aceita CPF válido sem máscara", () => expect(isValidCPF("52998224725")).toBe(true));
  it("rejeita dígitos iguais", () => expect(isValidCPF("111.111.111-11")).toBe(false));
  it("rejeita dígito verificador errado", () => expect(isValidCPF("529.982.247-26")).toBe(false));
  it("rejeita CPF curto", () => expect(isValidCPF("123.456")).toBe(false));
});

describe("isValidCNPJ", () => {
  it("aceita CNPJ válido", () => expect(isValidCNPJ("11.222.333/0001-81")).toBe(true));
  it("rejeita dígitos iguais", () => expect(isValidCNPJ("11.111.111/1111-11")).toBe(false));
  it("rejeita dígito verificador errado", () => expect(isValidCNPJ("11.222.333/0001-82")).toBe(false));
});

describe("parseDate", () => {
  it("parseia data válida", () => {
    const d = parseDate("2024-01-15");
    expect(d).not.toBeNull();
    expect(d!.getUTCFullYear()).toBe(2024);
  });
  it("retorna null para formato errado", () => {
    expect(parseDate("15/01/2024")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("parsePeriod", () => {
  it("parseia período válido", () => {
    const d = parsePeriod("2024-03");
    expect(d).not.toBeNull();
    expect(d!.getUTCMonth()).toBe(2);
  });
  it("rejeita formato errado", () => expect(parsePeriod("03/2024")).toBeNull());
});

describe("getAgeInYears", () => {
  it("calcula idade corretamente", () => {
    const birth = new Date("1990-06-15T00:00:00Z");
    const ref = new Date("2024-06-15T00:00:00Z");
    expect(getAgeInYears(birth, ref)).toBe(34);
  });
});

describe("getSalarioMinimo", () => {
  it("retorna valor correto para 2024", () => expect(getSalarioMinimo(2024)).toBe(1412.0));
  it("retorna valor correto para 2025", () => expect(getSalarioMinimo(2025)).toBe(1518.0));
});
