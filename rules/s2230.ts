import type { Rule } from "@/shared/types/index.js";
import { isValidCPF, parseDate, isFutureDate } from "@/shared/utils/validators.js";

export interface S2230Payload extends Record<string, unknown> {
  cpfTrab: unknown;
  dtIniAfast: unknown;
  codMotAfast: unknown;
  dtFimAfast?: unknown;
  dtPrevFimAfast?: unknown;
}

// Tabela 18 do eSocial — códigos válidos (principais)
const CODIGOS_AFASTAMENTO = new Set([
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","33","34","35","36",
]);

export const s2230Rules: Rule<S2230Payload>[] = [
  {
    code: "S2230_CPF_REQUIRED",
    field: "cpfTrab",
    description: "CPF do trabalhador é obrigatório",
    severity: "error",
    validate: ({ cpfTrab }) => {
      if (!cpfTrab || typeof cpfTrab !== "string") {
        return { field: "cpfTrab", code: "S2230_CPF_REQUIRED", message: "CPF do trabalhador é obrigatório", severity: "error" };
      }
      if (!isValidCPF(cpfTrab)) {
        return { field: "cpfTrab", code: "S2230_CPF_INVALID", message: "CPF inválido", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2230_DT_INI_REQUIRED",
    field: "dtIniAfast",
    description: "Data de início do afastamento é obrigatória",
    severity: "error",
    validate: ({ dtIniAfast }) => {
      if (!dtIniAfast || typeof dtIniAfast !== "string") {
        return { field: "dtIniAfast", code: "S2230_DT_INI_REQUIRED", message: "Data de início do afastamento é obrigatória (YYYY-MM-DD)", severity: "error" };
      }
      if (!parseDate(dtIniAfast)) {
        return { field: "dtIniAfast", code: "S2230_DT_INI_INVALID", message: "Data de início inválida — use YYYY-MM-DD", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2230_DT_INI_FUTURA",
    field: "dtIniAfast",
    description: "Data de início do afastamento não pode ser futura",
    severity: "error",
    validate: ({ dtIniAfast }) => {
      if (typeof dtIniAfast !== "string") return null;
      const d = parseDate(dtIniAfast);
      if (d && isFutureDate(d)) {
        return { field: "dtIniAfast", code: "S2230_DT_INI_FUTURA", message: "Data de início do afastamento não pode ser futura", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2230_COD_MOT_REQUIRED",
    field: "codMotAfast",
    description: "Código do motivo do afastamento é obrigatório (Tabela 18)",
    severity: "error",
    validate: ({ codMotAfast }) => {
      if (!codMotAfast || typeof codMotAfast !== "string") {
        return { field: "codMotAfast", code: "S2230_COD_MOT_REQUIRED", message: "Código de motivo do afastamento é obrigatório", severity: "error" };
      }
      if (!CODIGOS_AFASTAMENTO.has(codMotAfast)) {
        return { field: "codMotAfast", code: "S2230_COD_MOT_INVALID", message: `Código '${codMotAfast}' não consta na Tabela 18 do eSocial`, severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2230_DT_FIM_ANTERIOR_INICIO",
    field: "dtFimAfast",
    description: "Data fim do afastamento deve ser posterior ao início",
    severity: "error",
    validate: ({ dtIniAfast, dtFimAfast }) => {
      if (!dtFimAfast || typeof dtFimAfast !== "string") return null;
      const ini = typeof dtIniAfast === "string" ? parseDate(dtIniAfast) : null;
      const fim = parseDate(dtFimAfast);
      if (ini && fim && fim <= ini) {
        return { field: "dtFimAfast", code: "S2230_DT_FIM_ANTERIOR_INICIO", message: "Data fim do afastamento deve ser posterior à data de início", severity: "error" };
      }
      return null;
    },
  },
];
