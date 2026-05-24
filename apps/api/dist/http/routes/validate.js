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
exports.validateEventRoute = validateEventRoute;
var types_js_1 = require("../../../../../shared/types.js");
var index_js_1 = require("../../modules/validation/engine/index.js");
var auth_js_1 = require("../middlewares/auth.js");
var errors_js_1 = require("../../../../../shared/errors.js");
var tenant_repository_js_1 = require("../../modules/tenant/tenant.repository.js");
var index_js_2 = require("../../infra/db/index.js");
function validateEventRoute(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.post("/validate/event", { preHandler: [auth_js_1.requireApiKey, auth_js_1.requireQuota], schema: { tags: ["Validação"] } }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var parsed, result, tenantId;
                return __generator(this, function (_a) {
                    parsed = types_js_1.ValidateEventRequestSchema.safeParse(request.body);
                    if (!parsed.success) {
                        throw new errors_js_1.ValidationError(parsed.error.issues.map(function (i) { return "".concat(i.path.join("."), ": ").concat(i.message); }).join("; "));
                    }
                    result = (0, index_js_1.validateEvent)(parsed.data);
                    tenantId = request.tenant.id;
                    Promise.all([
                        tenant_repository_js_1.TenantRepository.incrementQuota(tenantId, 1),
                        (0, index_js_2.getDb)()(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          INSERT INTO validation_logs (tenant_id, event_id, status, score, total_rules, passed_rules, issue_count, duration_ms)\n          VALUES (", ", ", ", ", ", ", ",\n                  ", ", ", ", ", ", ", ")\n        "], ["\n          INSERT INTO validation_logs (tenant_id, event_id, status, score, total_rules, passed_rules, issue_count, duration_ms)\n          VALUES (", ", ", ", ", ", ", ",\n                  ", ", ", ", ", ", ", ")\n        "])), tenantId, result.eventId, result.status, result.score, result.totalRules, result.passedRules, result.issues.length, result.durationMs).catch(function () { }),
                    ]).catch(function () { });
                    return [2 /*return*/, reply.status(200).send(result)];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
var templateObject_1;
