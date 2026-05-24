"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s2230Rules = void 0;
var validators_js_1 = require("../shared/utils/validators.js");
// Tabela 18 do eSocial — códigos válidos (principais)
var CODIGOS_AFASTAMENTO = new Set([
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "33", "34", "35", "36",
]);
exports.s2230Rules = [
    {
        code: "S2230_CPF_REQUIRED",
        field: "cpfTrab",
        description: "CPF do trabalhador é obrigatório",
        severity: "error",
        validate: function (_a) {
            var cpfTrab = _a.cpfTrab;
            if (!cpfTrab || typeof cpfTrab !== "string") {
                return { field: "cpfTrab", code: "S2230_CPF_REQUIRED", message: "CPF do trabalhador é obrigatório", severity: "error" };
            }
            if (!(0, validators_js_1.isValidCPF)(cpfTrab)) {
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
        validate: function (_a) {
            var dtIniAfast = _a.dtIniAfast;
            if (!dtIniAfast || typeof dtIniAfast !== "string") {
                return { field: "dtIniAfast", code: "S2230_DT_INI_REQUIRED", message: "Data de início do afastamento é obrigatória (YYYY-MM-DD)", severity: "error" };
            }
            if (!(0, validators_js_1.parseDate)(dtIniAfast)) {
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
        validate: function (_a) {
            var dtIniAfast = _a.dtIniAfast;
            if (typeof dtIniAfast !== "string")
                return null;
            var d = (0, validators_js_1.parseDate)(dtIniAfast);
            if (d && (0, validators_js_1.isFutureDate)(d)) {
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
        validate: function (_a) {
            var codMotAfast = _a.codMotAfast;
            if (!codMotAfast || typeof codMotAfast !== "string") {
                return { field: "codMotAfast", code: "S2230_COD_MOT_REQUIRED", message: "Código de motivo do afastamento é obrigatório", severity: "error" };
            }
            if (!CODIGOS_AFASTAMENTO.has(codMotAfast)) {
                return { field: "codMotAfast", code: "S2230_COD_MOT_INVALID", message: "C\u00F3digo '".concat(codMotAfast, "' n\u00E3o consta na Tabela 18 do eSocial"), severity: "error" };
            }
            return null;
        },
    },
    {
        code: "S2230_DT_FIM_ANTERIOR_INICIO",
        field: "dtFimAfast",
        description: "Data fim do afastamento deve ser posterior ao início",
        severity: "error",
        validate: function (_a) {
            var dtIniAfast = _a.dtIniAfast, dtFimAfast = _a.dtFimAfast;
            if (!dtFimAfast || typeof dtFimAfast !== "string")
                return null;
            var ini = typeof dtIniAfast === "string" ? (0, validators_js_1.parseDate)(dtIniAfast) : null;
            var fim = (0, validators_js_1.parseDate)(dtFimAfast);
            if (ini && fim && fim <= ini) {
                return { field: "dtFimAfast", code: "S2230_DT_FIM_ANTERIOR_INICIO", message: "Data fim do afastamento deve ser posterior à data de início", severity: "error" };
            }
            return null;
        },
    },
];
