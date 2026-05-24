"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.TenantRepository = void 0;
var index_js_1 = require("../../infra/db/index.js");
var errors_js_1 = require("../../../../../shared/errors.js");
var QUOTA_BY_PLAN = {
    starter: 5000, pro: 50000, enterprise: 999999999,
};
exports.TenantRepository = {
    create: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, quota, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        quota = QUOTA_BY_PLAN[input.plan];
                        return [4 /*yield*/, db(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      INSERT INTO tenants (name, plan, monthly_quota)\n      VALUES (", ", ", ", ", ")\n      RETURNING id, name, plan, monthly_quota AS \"monthlyQuota\"\n    "], ["\n      INSERT INTO tenants (name, plan, monthly_quota)\n      VALUES (", ", ", ", ", ")\n      RETURNING id, name, plan, monthly_quota AS \"monthlyQuota\"\n    "])), input.name, input.plan, quota)];
                    case 1:
                        row = (_a.sent())[0];
                        return [2 /*return*/, __assign(__assign({}, row), { usedThisMonth: 0 })];
                }
            });
        });
    },
    findById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db, yearMonth, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        yearMonth = new Date().toISOString().slice(0, 7);
                        return [4 /*yield*/, db(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT t.id, t.name, t.plan,\n        t.monthly_quota AS \"monthlyQuota\",\n        COALESCE(q.used, 0) AS \"usedThisMonth\"\n      FROM tenants t\n      LEFT JOIN quota_usage q ON q.tenant_id = t.id AND q.year_month = ", "\n      WHERE t.id = ", "\n    "], ["\n      SELECT t.id, t.name, t.plan,\n        t.monthly_quota AS \"monthlyQuota\",\n        COALESCE(q.used, 0) AS \"usedThisMonth\"\n      FROM tenants t\n      LEFT JOIN quota_usage q ON q.tenant_id = t.id AND q.year_month = ", "\n      WHERE t.id = ", "\n    "])), yearMonth, id)];
                    case 1:
                        row = (_a.sent())[0];
                        if (!row)
                            throw new errors_js_1.NotFoundError("Tenant");
                        return [2 /*return*/, row];
                }
            });
        });
    },
    incrementQuota: function (tenantId_1) {
        return __awaiter(this, arguments, void 0, function (tenantId, amount) {
            var db, yearMonth;
            if (amount === void 0) { amount = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        yearMonth = new Date().toISOString().slice(0, 7);
                        return [4 /*yield*/, db(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      INSERT INTO quota_usage (tenant_id, year_month, used)\n      VALUES (", ", ", ", ", ")\n      ON CONFLICT (tenant_id, year_month)\n      DO UPDATE SET used = quota_usage.used + ", "\n    "], ["\n      INSERT INTO quota_usage (tenant_id, year_month, used)\n      VALUES (", ", ", ", ", ")\n      ON CONFLICT (tenant_id, year_month)\n      DO UPDATE SET used = quota_usage.used + ", "\n    "])), tenantId, yearMonth, amount, amount)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
};
var templateObject_1, templateObject_2, templateObject_3;
