import type { Rule } from "@/shared/types/index.js";
import { isValidCPF, parsePeriod, isFutureDate, getSalarioMinimo } from "@/shared/utils/validators.js";

export interface S1200Payload extends Record<string, unknown> {
  perApur: unknown;
  cpfTrab: unknown;
  vrRemun: unknown;
  vrDescInss: unknown;
  vrDescIrrf: unknown;
  vrFGTS?: unknown;
  tpRegTrab?: unknown;
}

// Alíquotas INSS 2024 — tabela simplificada para validação de range
const INSS_ALIQUOTA_MIN = 0.075;
const INSS_ALIQUOTA_MAX = 0.14;

export const s1200Rules: Rule<S1200Payload>[] = [
  {
    code: "S1200_PERIODO_REQUIRED",
    field: "perApur",
    description: "Período de apuração é obrigatório no formato AAAA-MM",
    severity: "error",
    validate: ({ perApur }) => {
      if (!perApur || typeof perApur !== "string") {
        return { field: "perApur", code: "S1200_PERIODO_REQUIRED", message: "Período de apuração é obrigatório (formato: AAAA-MM)", severity: "error" };
      }
      if (!parsePeriod(perApur)) {
        return { field: "perApur", code: "S1200_PERIODO_INVALID", message: "Período de apuração inválido — use o formato AAAA-MM (ex: 2024-03)", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S1200_PERIODO_FUTURO",
    field: "perApur",
    description: "Período de apuração não pode ser futuro",
    severity: "error",
    validate: ({ perApur }) => {
      if (typeof perApur !== "string") return null;
      const d = parsePeriod(perApur);
      if (d && isFutureDate(d)) {
        return { field: "perApur", code: "S1200_PERIODO_FUTURO", message: "Período de apuração não pode ser futuro", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S1200_CPF_REQUIRED",
    field: "cpfTrab",
    description: "CPF do trabalhador é obrigatório",
    severity: "error",
    validate: ({ cpfTrab }) => {
      if (!cpfTrab || typeof cpfTrab !== "string") {
        return { field: "cpfTrab", code: "S1200_CPF_REQUIRED", message: "CPF do trabalhador é obrigatório", severity: "error" };
      }
      if (!isValidCPF(cpfTrab)) {
        return { field: "cpfTrab", code: "S1200_CPF_INVALID", message: "CPF inválido", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S1200_REMUN_REQUIRED",
    field: "vrRemun",
    description: "Valor da remuneração é obrigatório",
    severity: "error",
    validate: ({ vrRemun }) => {
      const v = Number(vrRemun);
      if (vrRemun === undefined || vrRemun === null || vrRemun === "" || isNaN(v)) {
        return { field: "vrRemun", code: "S1200_REMUN_REQUIRED", message: "Valor da remuneração é obrigatório e deve ser numérico", severity: "error" };
      }
      if (v < 0) {
        return { field: "vrRemun", code: "S1200_REMUN_NEGATIVA", message: "Remuneração não pode ser negativa", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S1200_REMUN_SALARIO_MINIMO",
    field: "vrRemun",
    description: "Remuneração CLT não pode ser inferior ao salário mínimo",
    severity: "warning",
    validate: ({ vrRemun, tpRegTrab }) => {
      const v = Number(vrRemun);
      if (isNaN(v)) return null;
      if (String(tpRegTrab) === "1" && v < getSalarioMinimo()) {
        return {
          field: "vrRemun",
          code: "S1200_REMUN_SALARIO_MINIMO",
          message: `Remuneração (R$ ${v.toFixed(2)}) abaixo do salário mínimo vigente (R$ ${getSalarioMinimo().toFixed(2)})`,
          severity: "warning",
        };
      }
      return null;
    },
  },
  {
    code: "S1200_INSS_REQUIRED",
    field: "vrDescInss",
    description: "Desconto INSS é obrigatório",
    severity: "error",
    validate: ({ vrDescInss }) => {
      if (vrDescInss === undefined || vrDescInss === null || vrDescInss === "") {
        return { field: "vrDescInss", code: "S1200_INSS_REQUIRED", message: "Desconto INSS é obrigatório", severity: "error" };
      }
      if (isNaN(Number(vrDescInss))) {
        return { field: "vrDescInss", code: "S1200_INSS_INVALID", message: "Desconto INSS deve ser numérico", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S1200_INSS_ALIQUOTA",
    field: "vrDescInss",
    description: "Alíquota INSS fora do range esperado (7,5%–14%)",
    severity: "warning",
    validate: ({ vrDescInss, vrRemun }) => {
      const inss = Number(vrDescInss);
      const remun = Number(vrRemun);
      if (isNaN(inss) || isNaN(remun) || remun === 0) return null;
      const aliquota = inss / remun;
      if (aliquota < INSS_ALIQUOTA_MIN || aliquota > INSS_ALIQUOTA_MAX) {
        return {
          field: "vrDescInss",
          code: "S1200_INSS_ALIQUOTA",
          message: `Alíquota INSS calculada (${(aliquota * 100).toFixed(2)}%) fora do range esperado (7,5%–14%) — verifique a tabela progressiva`,
          severity: "warning",
        };
      }
      return null;
    },
  },
  {
    code: "S1200_IRRF_REQUIRED",
    field: "vrDescIrrf",
    description: "Desconto IRRF é obrigatório (informe 0 se isento)",
    severity: "error",
    validate: ({ vrDescIrrf }) => {
      if (vrDescIrrf === undefined || vrDescIrrf === null || vrDescIrrf === "") {
        return { field: "vrDescIrrf", code: "S1200_IRRF_REQUIRED", message: "Desconto IRRF é obrigatório — informe 0 caso o trabalhador seja isento", severity: "error" };
      }
      if (isNaN(Number(vrDescIrrf))) {
        return { field: "vrDescIrrf", code: "S1200_IRRF_INVALID", message: "Desconto IRRF deve ser numérico", severity: "error" };
      }
      return null;
    },
  },
];
