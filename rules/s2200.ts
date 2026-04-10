import type { Rule } from "@/shared/types/index.js";
import {
  isValidCPF,
  parseDate,
  getAgeInYears,
  isFutureDate,
  getSalarioMinimo,
} from "@/shared/utils/validators.js";

/**
 * Payload esperado para S-2200.
 * Campos opcionais seguem a tabela de obrigatoriedade do eSocial v2.5.
 */
export interface S2200Payload extends Record<string, unknown> {
  cpfTrab: unknown;
  nmTrab: unknown;
  dtNascto: unknown;
  dtAdm: unknown;
  tpRegTrab: unknown;
  codCateg: unknown;
  vrSalFx: unknown;
  undSalFixo: unknown;
  sexo?: unknown;
  tpAdmissao?: unknown;
  tpRegPrev?: unknown;
  CBOCargo?: unknown;
  qtdHrsSem?: unknown;
  tpJornada?: unknown;
}

const UND_SAL_FIXO_VALID = ["1", "2", "3", "4", "5", "6", "7"];
const TP_REG_TRAB_VALID = ["1", "2"];
const TP_JORNADA_VALID = ["1", "2", "3", "4", "9"];
const COD_CATEG_CLT_PREFIXES = ["1"]; // simplificado

export const s2200Rules: Rule<S2200Payload>[] = [
  // ── CPF ────────────────────────────────────────────────────────────────────
  {
    code: "S2200_CPF_REQUIRED",
    field: "cpfTrab",
    description: "CPF do trabalhador é obrigatório",
    severity: "error",
    validate: ({ cpfTrab }) => {
      if (!cpfTrab || typeof cpfTrab !== "string" || cpfTrab.trim() === "") {
        return { field: "cpfTrab", code: "S2200_CPF_REQUIRED", message: "CPF do trabalhador é obrigatório", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_CPF_INVALID",
    field: "cpfTrab",
    description: "CPF deve ser válido (dígitos verificadores)",
    severity: "error",
    validate: ({ cpfTrab }) => {
      if (!cpfTrab || typeof cpfTrab !== "string") return null; // coberto pela regra anterior
      if (!isValidCPF(cpfTrab)) {
        return { field: "cpfTrab", code: "S2200_CPF_INVALID", message: "CPF inválido — verifique os dígitos verificadores", severity: "error" };
      }
      return null;
    },
  },

  // ── Nome ───────────────────────────────────────────────────────────────────
  {
    code: "S2200_NOME_REQUIRED",
    field: "nmTrab",
    description: "Nome do trabalhador é obrigatório",
    severity: "error",
    validate: ({ nmTrab }) => {
      if (!nmTrab || typeof nmTrab !== "string" || nmTrab.trim().length < 2) {
        return { field: "nmTrab", code: "S2200_NOME_REQUIRED", message: "Nome do trabalhador é obrigatório (mínimo 2 caracteres)", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_NOME_MAX",
    field: "nmTrab",
    description: "Nome não pode ultrapassar 70 caracteres",
    severity: "error",
    validate: ({ nmTrab }) => {
      if (typeof nmTrab === "string" && nmTrab.trim().length > 70) {
        return { field: "nmTrab", code: "S2200_NOME_MAX", message: "Nome excede 70 caracteres (limite eSocial)", severity: "error" };
      }
      return null;
    },
  },

  // ── Data de Nascimento ─────────────────────────────────────────────────────
  {
    code: "S2200_DTNASCTO_REQUIRED",
    field: "dtNascto",
    description: "Data de nascimento é obrigatória (YYYY-MM-DD)",
    severity: "error",
    validate: ({ dtNascto }) => {
      if (!dtNascto || typeof dtNascto !== "string") {
        return { field: "dtNascto", code: "S2200_DTNASCTO_REQUIRED", message: "Data de nascimento é obrigatória no formato YYYY-MM-DD", severity: "error" };
      }
      if (!parseDate(dtNascto)) {
        return { field: "dtNascto", code: "S2200_DTNASCTO_INVALID", message: "Data de nascimento inválida — use o formato YYYY-MM-DD", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_IDADE_MINIMA",
    field: "dtNascto",
    description: "Trabalhador deve ter no mínimo 14 anos",
    severity: "error",
    validate: ({ dtNascto }) => {
      if (typeof dtNascto !== "string") return null;
      const birth = parseDate(dtNascto);
      if (!birth) return null;
      if (getAgeInYears(birth) < 14) {
        return { field: "dtNascto", code: "S2200_IDADE_MINIMA", message: "Trabalhador deve ter no mínimo 14 anos (art. 7º, XXXIII CF/88)", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_IDADE_IMPROVAVEL",
    field: "dtNascto",
    description: "Idade acima de 100 anos — verificar dado",
    severity: "warning",
    validate: ({ dtNascto }) => {
      if (typeof dtNascto !== "string") return null;
      const birth = parseDate(dtNascto);
      if (!birth) return null;
      if (getAgeInYears(birth) > 100) {
        return { field: "dtNascto", code: "S2200_IDADE_IMPROVAVEL", message: "Idade acima de 100 anos — verifique a data de nascimento", severity: "warning" };
      }
      return null;
    },
  },

  // ── Data de Admissão ───────────────────────────────────────────────────────
  {
    code: "S2200_DTADM_REQUIRED",
    field: "dtAdm",
    description: "Data de admissão é obrigatória (YYYY-MM-DD)",
    severity: "error",
    validate: ({ dtAdm }) => {
      if (!dtAdm || typeof dtAdm !== "string") {
        return { field: "dtAdm", code: "S2200_DTADM_REQUIRED", message: "Data de admissão é obrigatória no formato YYYY-MM-DD", severity: "error" };
      }
      if (!parseDate(dtAdm)) {
        return { field: "dtAdm", code: "S2200_DTADM_INVALID", message: "Data de admissão inválida — use o formato YYYY-MM-DD", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_DTADM_FUTURA",
    field: "dtAdm",
    description: "Data de admissão não pode ser futura",
    severity: "error",
    validate: ({ dtAdm }) => {
      if (typeof dtAdm !== "string") return null;
      const d = parseDate(dtAdm);
      if (d && isFutureDate(d)) {
        return { field: "dtAdm", code: "S2200_DTADM_FUTURA", message: "Data de admissão não pode ser uma data futura", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_DTADM_ANTES_NASCTO",
    field: "dtAdm",
    description: "Admissão não pode ser anterior ao nascimento",
    severity: "error",
    validate: ({ dtAdm, dtNascto }) => {
      if (typeof dtAdm !== "string" || typeof dtNascto !== "string") return null;
      const adm = parseDate(dtAdm);
      const nasc = parseDate(dtNascto);
      if (adm && nasc && adm <= nasc) {
        return { field: "dtAdm", code: "S2200_DTADM_ANTES_NASCTO", message: "Data de admissão não pode ser anterior ou igual à data de nascimento", severity: "error" };
      }
      return null;
    },
  },

  // ── Tipo de Regime ─────────────────────────────────────────────────────────
  {
    code: "S2200_TP_REG_TRAB_REQUIRED",
    field: "tpRegTrab",
    description: "Tipo de regime de trabalho é obrigatório (1=CLT, 2=Estatutário)",
    severity: "error",
    validate: ({ tpRegTrab }) => {
      if (!tpRegTrab || !TP_REG_TRAB_VALID.includes(String(tpRegTrab))) {
        return { field: "tpRegTrab", code: "S2200_TP_REG_TRAB_REQUIRED", message: "Tipo de regime inválido. Use: 1 (CLT) ou 2 (Estatutário)", severity: "error" };
      }
      return null;
    },
  },

  // ── Salário ────────────────────────────────────────────────────────────────
  {
    code: "S2200_SALARIO_REQUIRED",
    field: "vrSalFx",
    description: "Valor do salário fixo é obrigatório",
    severity: "error",
    validate: ({ vrSalFx }) => {
      if (vrSalFx === undefined || vrSalFx === null || vrSalFx === "") {
        return { field: "vrSalFx", code: "S2200_SALARIO_REQUIRED", message: "Valor do salário fixo é obrigatório", severity: "error" };
      }
      return null;
    },
  },
  {
    code: "S2200_SALARIO_MINIMO",
    field: "vrSalFx",
    description: "Salário não pode ser inferior ao mínimo vigente",
    severity: "error",
    validate: ({ vrSalFx, undSalFixo }) => {
      // Aplica apenas para unidade mensal (1) e hora (2) — simplificado
      const valor = Number(vrSalFx);
      if (isNaN(valor)) return null;
      const und = String(undSalFixo);
      if (und === "1" && valor < getSalarioMinimo()) {
        return {
          field: "vrSalFx",
          code: "S2200_SALARIO_MINIMO",
          message: `Salário (R$ ${valor.toFixed(2)}) abaixo do mínimo vigente (R$ ${getSalarioMinimo().toFixed(2)})`,
          severity: "error",
        };
      }
      return null;
    },
  },
  {
    code: "S2200_UND_SAL_FIXO_REQUIRED",
    field: "undSalFixo",
    description: "Unidade do salário fixo é obrigatória",
    severity: "error",
    validate: ({ undSalFixo }) => {
      if (!undSalFixo || !UND_SAL_FIXO_VALID.includes(String(undSalFixo))) {
        return {
          field: "undSalFixo",
          code: "S2200_UND_SAL_FIXO_REQUIRED",
          message: `Unidade de salário inválida. Valores aceitos: ${UND_SAL_FIXO_VALID.join(", ")} (1=Mensal, 2=Hora, 3=Dia...)`,
          severity: "error",
        };
      }
      return null;
    },
  },

  // ── CBO ────────────────────────────────────────────────────────────────────
  {
    code: "S2200_CBO_FORMAT",
    field: "CBOCargo",
    description: "CBO deve ter 6 dígitos numéricos",
    severity: "warning",
    validate: ({ CBOCargo }) => {
      if (!CBOCargo) return null; // opcional
      if (!/^\d{6}$/.test(String(CBOCargo))) {
        return { field: "CBOCargo", code: "S2200_CBO_FORMAT", message: "CBO inválido — deve conter exatamente 6 dígitos numéricos", severity: "warning" };
      }
      return null;
    },
  },

  // ── Jornada ────────────────────────────────────────────────────────────────
  {
    code: "S2200_JORNADA_HORAS",
    field: "qtdHrsSem",
    description: "Jornada semanal não pode exceder 44 horas (CLT)",
    severity: "warning",
    validate: ({ qtdHrsSem, tpRegTrab }) => {
      if (!qtdHrsSem) return null;
      const hrs = Number(qtdHrsSem);
      if (String(tpRegTrab) === "1" && hrs > 44) {
        return { field: "qtdHrsSem", code: "S2200_JORNADA_HORAS", message: `Jornada de ${hrs}h/semana excede o limite CLT de 44h (art. 7º XIII CF/88)`, severity: "warning" };
      }
      return null;
    },
  },
  {
    code: "S2200_TP_JORNADA_VALID",
    field: "tpJornada",
    description: "Tipo de jornada deve ser válido",
    severity: "error",
    validate: ({ tpJornada }) => {
      if (!tpJornada) return null;
      if (!TP_JORNADA_VALID.includes(String(tpJornada))) {
        return { field: "tpJornada", code: "S2200_TP_JORNADA_VALID", message: `Tipo de jornada inválido. Valores aceitos: ${TP_JORNADA_VALID.join(", ")}`, severity: "error" };
      }
      return null;
    },
  },
];
