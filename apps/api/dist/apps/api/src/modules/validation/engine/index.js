"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEvent = validateEvent;
exports.validateBatch = validateBatch;
exports.getSupportedEvents = getSupportedEvents;
const node_perf_hooks_1 = require("node:perf_hooks");
const errors_js_1 = require("../../../../../../shared/errors.js");
const s2200_js_1 = require("../../../../../../rules/s2200.js");
const s2230_js_1 = require("../../../../../../rules/s2230.js");
const s1200_js_1 = require("../../../../../../rules/s1200.js");
const RULES_REGISTRY = {
    "S-2200": s2200_js_1.s2200Rules,
    "S-2230": s2230_js_1.s2230Rules,
    "S-1200": s1200_js_1.s1200Rules,
};
function validateEvent(request) {
    const { eventId, payload, options } = request;
    const start = node_perf_hooks_1.performance.now();
    const rules = RULES_REGISTRY[eventId];
    if (!rules)
        throw new errors_js_1.InvalidEventIdError(eventId);
    const issues = [];
    let errorRuleCount = 0;
    for (const rule of rules) {
        if (options?.skipWarnings && rule.severity === "warning")
            continue;
        try {
            const issue = rule.validate(payload);
            if (issue) {
                issues.push(issue);
                if (issue.severity === "error")
                    errorRuleCount++;
            }
        }
        catch {
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
        durationMs: Math.round(node_perf_hooks_1.performance.now() - start),
    };
}
function validateBatch(request) {
    const { events, options } = request;
    const batchId = crypto.randomUUID();
    const start = node_perf_hooks_1.performance.now();
    const results = [];
    let passed = 0, failed = 0, warned = 0;
    for (const event of events) {
        const result = validateEvent({ ...event, options: { ...event.options, ...options } });
        results.push(result);
        if (result.status === "PASS")
            passed++;
        else if (result.status === "FAIL") {
            failed++;
            if (options?.failFast)
                break;
        }
        else
            warned++;
    }
    const overallScore = results.length === 0 ? 0
        : Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
    return {
        batchId, totalEvents: results.length, passed, failed, warned,
        overallScore, results, durationMs: Math.round(node_perf_hooks_1.performance.now() - start),
    };
}
function getSupportedEvents() {
    return Object.keys(RULES_REGISTRY);
}
