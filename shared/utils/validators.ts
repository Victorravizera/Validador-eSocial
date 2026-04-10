// ─── CPF ─────────────────────────────────────────────────────────────────────

export function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (digits: string, factor: number): number => {
    const sum = [...digits].reduce(
      (acc, d, i) => acc + parseInt(d) * (factor - i),
      0
    );
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  };

  return (
    calcDigit(cpf.slice(0, 9), 10) === parseInt(cpf[9]) &&
    calcDigit(cpf.slice(0, 10), 11) === parseInt(cpf[10])
  );
}

// ─── CNPJ ─────────────────────────────────────────────────────────────────────

export function isValidCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = [...slice].reduce(
      (acc, d, i) => acc + parseInt(d) * weights[i],
      0
    );
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, ...w1];

  return (
    calcDigit(cnpj.slice(0, 12), w1) === parseInt(cnpj[12]) &&
    calcDigit(cnpj.slice(0, 13), w2) === parseInt(cnpj[13])
  );
}

// ─── Datas ────────────────────────────────────────────────────────────────────

/** Parseia YYYY-MM-DD para Date em UTC */
export function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

/** Parseia YYYY-MM para Date (primeiro dia do mês) */
export function parsePeriod(value: string): Date | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}-01T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

export function getAgeInYears(birthDate: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) age--;
  return age;
}

export function isFutureDate(date: Date, referenceDate = new Date()): boolean {
  return date > referenceDate;
}

// ─── Salário Mínimo ───────────────────────────────────────────────────────────
// Manter atualizado conforme legislação — idealmente vir de config/banco

const SALARIO_MINIMO_POR_ANO: Record<number, number> = {
  2023: 1320.0,
  2024: 1412.0,
  2025: 1518.0,
};

export function getSalarioMinimo(year = new Date().getFullYear()): number {
  return SALARIO_MINIMO_POR_ANO[year] ?? 1518.0;
}

// ─── Sanitização segura ───────────────────────────────────────────────────────

/** Remove máscara de CPF/CNPJ sem logar o valor */
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}
