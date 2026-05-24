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
exports.ApiKeyRepository = void 0;
var index_js_1 = require("../../infra/db/index.js");
var node_crypto_1 = require("node:crypto");
var index_js_2 = require("../../../../../config/index.js");
var errors_js_1 = require("../../../../../shared/errors.js");
exports.ApiKeyRepository = {
    create: function (tenantId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var db, plainKey, keyHash, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        plainKey = "eqa_".concat((0, node_crypto_1.randomBytes)(32).toString("hex"));
                        keyHash = hashApiKey(plainKey);
                        return [4 /*yield*/, db(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      INSERT INTO api_keys (tenant_id, key_hash, name)\n      VALUES (", ", ", ", ", ")\n      RETURNING id, tenant_id AS \"tenantId\", name,\n        last_used_at AS \"lastUsedAt\", expires_at AS \"expiresAt\", created_at AS \"createdAt\"\n    "], ["\n      INSERT INTO api_keys (tenant_id, key_hash, name)\n      VALUES (", ", ", ", ", ")\n      RETURNING id, tenant_id AS \"tenantId\", name,\n        last_used_at AS \"lastUsedAt\", expires_at AS \"expiresAt\", created_at AS \"createdAt\"\n    "])), tenantId, keyHash, name !== null && name !== void 0 ? name : null)];
                    case 1:
                        record = (_a.sent())[0];
                        return [2 /*return*/, { record: record, plainKey: plainKey }];
                }
            });
        });
    },
    validate: function (plainKey) {
        return __awaiter(this, void 0, void 0, function () {
            var db, keyHash, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        keyHash = hashApiKey(plainKey);
                        return [4 /*yield*/, db(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT tenant_id AS \"tenantId\", id FROM api_keys\n      WHERE key_hash = ", " AND revoked_at IS NULL\n        AND (expires_at IS NULL OR expires_at > NOW())\n    "], ["\n      SELECT tenant_id AS \"tenantId\", id FROM api_keys\n      WHERE key_hash = ", " AND revoked_at IS NULL\n        AND (expires_at IS NULL OR expires_at > NOW())\n    "])), keyHash)];
                    case 1:
                        row = (_a.sent())[0];
                        if (!row)
                            throw new errors_js_1.UnauthorizedError("API Key inválida ou revogada");
                        db(templateObject_3 || (templateObject_3 = __makeTemplateObject(["UPDATE api_keys SET last_used_at = NOW() WHERE id = ", ""], ["UPDATE api_keys SET last_used_at = NOW() WHERE id = ", ""])), row.id).catch(function () { });
                        return [2 /*return*/, row.tenantId];
                }
            });
        });
    },
    listByTenant: function (tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, index_js_1.getDb)();
                return [2 /*return*/, db(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      SELECT id, tenant_id AS \"tenantId\", name,\n        last_used_at AS \"lastUsedAt\", expires_at AS \"expiresAt\", created_at AS \"createdAt\"\n      FROM api_keys WHERE tenant_id = ", " AND revoked_at IS NULL\n      ORDER BY created_at DESC\n    "], ["\n      SELECT id, tenant_id AS \"tenantId\", name,\n        last_used_at AS \"lastUsedAt\", expires_at AS \"expiresAt\", created_at AS \"createdAt\"\n      FROM api_keys WHERE tenant_id = ", " AND revoked_at IS NULL\n      ORDER BY created_at DESC\n    "])), tenantId)];
            });
        });
    },
    revoke: function (id, tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        return [4 /*yield*/, db(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      UPDATE api_keys SET revoked_at = NOW()\n      WHERE id = ", " AND tenant_id = ", " AND revoked_at IS NULL\n    "], ["\n      UPDATE api_keys SET revoked_at = NOW()\n      WHERE id = ", " AND tenant_id = ", " AND revoked_at IS NULL\n    "])), id, tenantId)];
                    case 1:
                        result = _a.sent();
                        if (result.count === 0)
                            throw new errors_js_1.NotFoundError("API Key");
                        return [2 /*return*/];
                }
            });
        });
    },
};
function hashApiKey(plainKey) {
    return (0, node_crypto_1.createHash)("sha256").update(index_js_2.config.auth.apiKeySalt + plainKey).digest("hex");
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
