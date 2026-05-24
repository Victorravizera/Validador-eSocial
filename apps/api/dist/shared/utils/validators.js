"use strict";
// ─── CPF ─────────────────────────────────────────────────────────────────────
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
    const cpf = raw.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    const calcDigit = (digits, factor) => {
        const sum = [...digits].reduce((acc, d, i) => acc + parseInt(d) * (factor - i), 0);
        const rem = (sum * 10) % 11;
        return rem >= 10 ? 0 : rem;
    };
    return (calcDigit(cpf.slice(0, 9), 10) === parseInt(cpf[9]) &&
        calcDigit(cpf.slice(0, 10), 11) === parseInt(cpf[10]));
}
// ─── CNPJ ─────────────────────────────────────────────────────────────────────
function isValidCNPJ(raw) {
    const cnpj = raw.replace(/\D/g, "");
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj))
        return false;
    const calcDigit = (slice, weights) => {
        const sum = [...slice].reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
        const rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    };
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, ...w1];
    return (calcDigit(cnpj.slice(0, 12), w1) === parseInt(cnpj[12]) &&
        calcDigit(cnpj.slice(0, 13), w2) === parseInt(cnpj[13]));
}
// ─── Datas ────────────────────────────────────────────────────────────────────
/** Parseia YYYY-MM-DD para Date em UTC */
function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return null;
    const d = new Date(`${value}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
}
/** Parseia YYYY-MM para Date (primeiro dia do mês) */
function parsePeriod(value) {
    if (!/^\d{4}-\d{2}$/.test(value))
        return null;
    const d = new Date(`${value}-01T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
}
function getAgeInYears(birthDate, referenceDate = new Date()) {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const m = referenceDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate()))
        age--;
    return age;
}
function isFutureDate(date, referenceDate = new Date()) {
    return date > referenceDate;
}
// ─── Salário Mínimo ───────────────────────────────────────────────────────────
// Manter atualizado conforme legislação — idealmente vir de config/banco
const SALARIO_MINIMO_POR_ANO = {
    2023: 1320.0,
    2024: 1412.0,
    2025: 1518.0,
};
function getSalarioMinimo(year = new Date().getFullYear()) {
    return SALARIO_MINIMO_POR_ANO[year] ?? 1518.0;
}
// ─── Sanitização segura ───────────────────────────────────────────────────────
/** Remove máscara de CPF/CNPJ sem logar o valor */
function unmask(value) {
    return value.replace(/\D/g, "");
}
