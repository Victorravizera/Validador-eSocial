"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meRoute = meRoute;
exports.historyRoute = historyRoute;
var auth_js_1 = require("../middlewares/auth.js");
var index_js_1 = require("../../infra/db/index.js");
function meRoute(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.get("/me", { preHandler: [auth_js_1.requireApiKey], schema: { tags: ["Tenant"] } }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var tenant, remaining, percentUsed;
                return __generator(this, function (_a) {
                    tenant = request.tenant;
                    remaining = Math.max(0, tenant.monthlyQuota - tenant.usedThisMonth);
                    percentUsed = Math.round((tenant.usedThisMonth / tenant.monthlyQuota) * 100);
                    return [2 /*return*/, reply.send({ id: tenant.id, name: tenant.name, plan: tenant.plan,
                            quota: { monthly: tenant.monthlyQuota, used: tenant.usedThisMonth, remaining: remaining, percentUsed: percentUsed } })];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function historyRoute(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.get("/history", { preHandler: [auth_js_1.requireApiKey], schema: { tags: ["Validação"] } }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var db, _a, _b, page, _c, limit, eventId, status, offset, tenantId, rows, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            db = (0, index_js_1.getDb)();
                            _a = request.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, eventId = _a.eventId, status = _a.status;
                            offset = (page - 1) * limit;
                            tenantId = request.tenant.id;
                            return [4 /*yield*/, db(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      SELECT id, event_id AS \"eventId\", status, score,\n        total_rules AS \"totalRules\", passed_rules AS \"passedRules\",\n        issue_count AS \"issueCount\", duration_ms AS \"durationMs\", created_at AS \"createdAt\"\n      FROM validation_logs\n      WHERE tenant_id = ", "\n        ", "\n        ", "\n        AND created_at > NOW() - INTERVAL '30 days'\n      ORDER BY created_at DESC LIMIT ", " OFFSET ", "\n    "], ["\n      SELECT id, event_id AS \"eventId\", status, score,\n        total_rules AS \"totalRules\", passed_rules AS \"passedRules\",\n        issue_count AS \"issueCount\", duration_ms AS \"durationMs\", created_at AS \"createdAt\"\n      FROM validation_logs\n      WHERE tenant_id = ", "\n        ", "\n        ", "\n        AND created_at > NOW() - INTERVAL '30 days'\n      ORDER BY created_at DESC LIMIT ", " OFFSET ", "\n    "])), tenantId, eventId ? db(templateObject_1 || (templateObject_1 = __makeTemplateObject(["AND event_id = ", ""], ["AND event_id = ", ""])), eventId) : db(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""]))), status ? db(templateObject_3 || (templateObject_3 = __makeTemplateObject(["AND status = ", ""], ["AND status = ", ""])), status) : db(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""]))), limit, offset)];
                        case 1:
                            rows = _d.sent();
                            return [4 /*yield*/, db(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      SELECT COUNT(*)::int AS total FROM validation_logs\n      WHERE tenant_id = ", " AND created_at > NOW() - INTERVAL '30 days'\n    "], ["\n      SELECT COUNT(*)::int AS total FROM validation_logs\n      WHERE tenant_id = ", " AND created_at > NOW() - INTERVAL '30 days'\n    "])), tenantId)];
                        case 2:
                            total = (_d.sent())[0].total;
                            return [2 /*return*/, reply.send({ data: rows, pagination: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) } })];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
