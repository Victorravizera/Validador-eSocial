"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEvent = validateEvent;
exports.validateBatch = validateBatch;
exports.getSupportedEvents = getSupportedEvents;
var node_perf_hooks_1 = require("node:perf_hooks");
var errors_js_1 = require("../../../../../../shared/errors.js");
var s2200_js_1 = require("../../../../../../rules/s2200.js");
var s2230_js_1 = require("../../../../../../rules/s2230.js");
var s1200_js_1 = require("../../../../../../rules/s1200.js");
var RULES_REGISTRY = {
    "S-2200": s2200_js_1.s2200Rules,
    "S-2230": s2230_js_1.s2230Rules,
    "S-1200": s1200_js_1.s1200Rules,
};
function validateEvent(request) {
    var eventId = request.eventId, payload = request.payload, options = request.options;
    var start = node_perf_hooks_1.performance.now();
    var rules = RULES_REGISTRY[eventId];
    if (!rules)
        throw new errors_js_1.InvalidEventIdError(eventId);
    var issues = [];
    var errorRuleCount = 0;
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        if ((options === null || options === void 0 ? void 0 : options.skipWarnings) && rule.severity === "warning")
            continue;
        try {
            var issue = rule.validate(payload);
            if (issue) {
                issues.push(issue);
                if (issue.severity === "error")
                    errorRuleCount++;
            }
        }
        catch (_a) {
            issues.push({
                field: rule.field, code: "RULE_EXECUTION_ERROR",
                message: "Erro interno ao executar a regra ".concat(rule.code), severity: "error",
            });
            errorRuleCount++;
        }
    }
    var errorRules = rules.filter(function (r) { return r.severity === "error"; });
    var passedErrorRules = errorRules.length - errorRuleCount;
    var score = errorRules.length === 0 ? 100 : Math.round((passedErrorRules / errorRules.length) * 100);
    var hasErrors = issues.some(function (i) { return i.severity === "error"; });
    var hasWarnings = issues.some(function (i) { return i.severity === "warning"; });
    var status = hasErrors ? "FAIL" : hasWarnings ? "WARN" : "PASS";
    return {
        eventId: eventId,
        status: status,
        score: score,
        issues: issues,
        passedRules: rules.length - issues.length,
        totalRules: rules.length,
        durationMs: Math.round(node_perf_hooks_1.performance.now() - start),
    };
}
function validateBatch(request) {
    var events = request.events, options = request.options;
    var batchId = crypto.randomUUID();
    var start = node_perf_hooks_1.performance.now();
    var results = [];
    var passed = 0, failed = 0, warned = 0;
    for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
        var event_1 = events_1[_i];
        var result = validateEvent(__assign(__assign({}, event_1), { options: __assign(__assign({}, event_1.options), options) }));
        results.push(result);
        if (result.status === "PASS")
            passed++;
        else if (result.status === "FAIL") {
            failed++;
            if (options === null || options === void 0 ? void 0 : options.failFast)
                break;
        }
        else
            warned++;
    }
    var overallScore = results.length === 0 ? 0
        : Math.round(results.reduce(function (acc, r) { return acc + r.score; }, 0) / results.length);
    return {
        batchId: batchId,
        totalEvents: results.length,
        passed: passed,
        failed: failed,
        warned: warned,
        overallScore: overallScore,
        results: results,
        durationMs: Math.round(node_perf_hooks_1.performance.now() - start),
    };
}
function getSupportedEvents() {
    return Object.keys(RULES_REGISTRY);
}
