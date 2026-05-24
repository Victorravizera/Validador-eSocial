"use strict";
// ─── CPF ─────────────────────────────────────────────────────────────────────
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCPF = isValidCPF;
exports.isValidCNPJ = isValidCNPJ;
exports.parseDate = parseDate;
exports.parsePeriod = parsePeriod;
exports.getAgeInYears = getAgeInYears;
exports.isFutureDate = isFutureDate;
exports.getSalarioMinimo = getSalarioMinimo;
exports.unmask = unmask;
function isValidCPF(raw) {
    var cpf = raw.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    var calcDigit = function (digits, factor) {
        var sum = __spreadArray([], digits, true).reduce(function (acc, d, i) { return acc + parseInt(d) * (factor - i); }, 0);
        var rem = (sum * 10) % 11;
        return rem >= 10 ? 0 : rem;
    };
    return (calcDigit(cpf.slice(0, 9), 10) === parseInt(cpf[9]) &&
        calcDigit(cpf.slice(0, 10), 11) === parseInt(cpf[10]));
}
// ─── CNPJ ─────────────────────────────────────────────────────────────────────
function isValidCNPJ(raw) {
    var cnpj = raw.replace(/\D/g, "");
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj))
        return false;
    var calcDigit = function (slice, weights) {
        var sum = __spreadArray([], slice, true).reduce(function (acc, d, i) { return acc + parseInt(d) * weights[i]; }, 0);
        var rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    };
    var w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var w2 = __spreadArray([6], w1, true);
    return (calcDigit(cnpj.slice(0, 12), w1) === parseInt(cnpj[12]) &&
        calcDigit(cnpj.slice(0, 13), w2) === parseInt(cnpj[13]));
}
// ─── Datas ────────────────────────────────────────────────────────────────────
/** Parseia YYYY-MM-DD para Date em UTC */
function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return null;
    var d = new Date("".concat(value, "T00:00:00Z"));
    return isNaN(d.getTime()) ? null : d;
}
/** Parseia YYYY-MM para Date (primeiro dia do mês) */
function parsePeriod(value) {
    if (!/^\d{4}-\d{2}$/.test(value))
        return null;
    var d = new Date("".concat(value, "-01T00:00:00Z"));
    return isNaN(d.getTime()) ? null : d;
}
function getAgeInYears(birthDate, referenceDate) {
    if (referenceDate === void 0) { referenceDate = new Date(); }
    var age = referenceDate.getFullYear() - birthDate.getFullYear();
    var m = referenceDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate()))
        age--;
    return age;
}
function isFutureDate(date, referenceDate) {
    if (referenceDate === void 0) { referenceDate = new Date(); }
    return date > referenceDate;
}
// ─── Salário Mínimo ───────────────────────────────────────────────────────────
// Manter atualizado conforme legislação — idealmente vir de config/banco
var SALARIO_MINIMO_POR_ANO = {
    2023: 1320.0,
    2024: 1412.0,
    2025: 1518.0,
};
function getSalarioMinimo(year) {
    var _a;
    if (year === void 0) { year = new Date().getFullYear(); }
    return (_a = SALARIO_MINIMO_POR_ANO[year]) !== null && _a !== void 0 ? _a : 1518.0;
}
// ─── Sanitização segura ───────────────────────────────────────────────────────
/** Remove máscara de CPF/CNPJ sem logar o valor */
function unmask(value) {
    return value.replace(/\D/g, "");
}
