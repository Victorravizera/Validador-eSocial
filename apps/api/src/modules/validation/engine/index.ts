import { performance } from "node:perf_hooks";
import type {
  EsocialEventId, Rule, ValidationIssue, ValidationResult,
  BatchValidationResult, ValidateEventRequest, ValidateBatchRequest,
} from "../../../../../../shared/types.js";
import { InvalidEventIdError } from "../../../../../../shared/errors.js";
import { s2200Rules } from "../../../../../../rules/s2200.js";
import { s2230Rules } from "../../../../../../rules/s2230.js";
import { s1200Rules } from "../../../../../../rules/s1200.js";

const RULES_REGISTRY: Partial<Record<EsocialEventId, Rule[]>> = {
  "S-2200": s2200Rules as Rule[],
  "S-2230": s2230Rules as Rule[],
  "S-1200": s1200Rules as Rule[],
};

export function validateEvent(request: ValidateEventRequest): ValidationResult {
  const { eventId, payload, options } = request;
  const start = performance.now();

  const rules = RULES_REGISTRY[eventId];
  if (!rules) throw new InvalidEventIdError(eventId);

  const issues: ValidationIssue[] = [];
  let errorRuleCount = 0;

  for (const rule of rules) {
    if (options?.skipWarnings && rule.severity === "warning") continue;
    try {
      const issue = rule.validate(payload as Record<string, unknown>);
      if (issue) {
        issues.push(issue);
        if (issue.severity === "error") errorRuleCount++;
      }
    } catch {
      issues.push({
        field: rule.field, code: "RULE_EXECUTION_ERROR",
        message: `Erro interno ao executar a regra ${rule.code}`, severity: "error",
      });
      errorRuleCount++;
    }
  }

  const errorRules = rules.filter((r) => r.severity === "error");
  const passedErrorRules = errorRules.length - errorRuleCount;
  const score = errorRules.length === 0 ? 100 : Math.round((passedErrorRules / errorRules.length) * 100);
  const hasErrors = issues.some((i) => i.severity === "error");
  const hasWarnings = issues.some((i) => i.severity === "warning");
  const status = hasErrors ? "FAIL" : hasWarnings ? "WARN" : "PASS";

  return {
    eventId, status, score, issues,
    passedRules: rules.length - issues.length,
    totalRules: rules.length,
    durationMs: Math.round(performance.now() - start),
  };
}

export function validateBatch(request: ValidateBatchRequest): BatchValidationResult {
  const { events, options } = request;
  const batchId = crypto.randomUUID();
  const start = performance.now();
  const results: ValidationResult[] = [];
  let passed = 0, failed = 0, warned = 0;

  for (const event of events) {
    const result = validateEvent({ ...event, options: { ...event.options, ...options } });
    results.push(result);
    if (result.status === "PASS") passed++;
    else if (result.status === "FAIL") { failed++; if (options?.failFast) break; }
    else warned++;
  }

  const overallScore = results.length === 0 ? 0
    : Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);

  return {
    batchId, totalEvents: results.length, passed, failed, warned,
    overallScore, results, durationMs: Math.round(performance.now() - start),
  };
}

export function getSupportedEvents(): EsocialEventId[] {
  return Object.keys(RULES_REGISTRY) as EsocialEventId[];
}
